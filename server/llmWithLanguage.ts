/**
 * Language-aware LLM wrapper
 * 
 * Provides `invokeLLMWithLanguage` that automatically injects
 * a language instruction into the system prompt based on the user's
 * selected UI language.
 * 
 * Usage:
 *   import { invokeLLMWithLanguage } from "../llmWithLanguage";
 *   const response = await invokeLLMWithLanguage("ar", { messages: [...] });
 */

import { invokeLLM, type InvokeParams, type InvokeResult } from "./_core/llm";

export type SupportedLanguage = "ar" | "fr" | "en";

/**
 * Language instruction strings injected into system prompts
 */
const LANGUAGE_INSTRUCTIONS: Record<SupportedLanguage, string> = {
  ar: "\n\n[LANGUAGE DIRECTIVE] Strictly generate the script and all text in Arabic. أجب بالكامل باللغة العربية.",
  fr: "\n\n[LANGUAGE DIRECTIVE] Générer le script et tout le texte strictement en Français. Répondez entièrement en français.",
  en: "\n\n[LANGUAGE DIRECTIVE] Strictly generate the script and all text in English. Respond entirely in English.",
};

/**
 * Get the language instruction for a given language code
 */
export function getLanguageInstruction(lang: SupportedLanguage): string {
  return LANGUAGE_INSTRUCTIONS[lang] || LANGUAGE_INSTRUCTIONS.ar;
}

/**
 * Invoke LLM with automatic language context injection.
 * Appends a language directive to the first system message,
 * or prepends a new system message if none exists.
 */
export async function invokeLLMWithLanguage(
  language: SupportedLanguage,
  params: InvokeParams
): Promise<InvokeResult> {
  const instruction = getLanguageInstruction(language);
  const messages = [...params.messages];

  // Find the first system message
  const systemIdx = messages.findIndex((m) => m.role === "system");

  if (systemIdx >= 0) {
    // Append language instruction to existing system message
    const systemMsg = messages[systemIdx];
    const currentContent =
      typeof systemMsg.content === "string"
        ? systemMsg.content
        : Array.isArray(systemMsg.content)
          ? systemMsg.content
              .map((c) => (typeof c === "string" ? c : "type" in c && c.type === "text" ? c.text : ""))
              .join("\n")
          : "";

    messages[systemIdx] = {
      ...systemMsg,
      content: currentContent + instruction,
    };
  } else {
    // No system message found, prepend one
    messages.unshift({
      role: "system",
      content: instruction.trim(),
    });
  }

  return invokeLLM({ ...params, messages });
}

export default invokeLLMWithLanguage;
