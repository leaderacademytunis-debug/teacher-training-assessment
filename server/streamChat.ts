import type { Request, Response } from "express";
import { ENV } from "./_core/env";
import { sdk } from "./_core/sdk";

const resolveApiUrl = () =>
  ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0
    ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`
    : "https://forge.manus.im/v1/chat/completions";

/**
 * Build the full system prompt for the EduGPT assistant
 */
function buildSystemPrompt(subjectInfo: string, levelInfo: string, langNote: string, contextNote: string): string {
  return `# \u2757\u2757 \u0642\u0627\u0639\u062f\u0629 \u0645\u0637\u0644\u0642\u0629: \u0645\u0645\u0646\u0648\u0639 \u0639\u0631\u0636 \u0623\u064a \u0643\u0648\u062f \u0623\u0648 JSON \u0641\u064a \u0631\u062f\u0648\u062f\u0643 \u0646\u0647\u0627\u0626\u064a\u0627\u064b. \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u0648\u0646 \u0645\u0639\u0644\u0645\u0648\u0646 \u0648\u0644\u064a\u0633\u0648\u0627 \u0645\u0628\u0631\u0645\u062c\u064a\u0646. \u0642\u062f\u0651\u0645 \u0643\u0644 \u0634\u064a\u0621 \u0643\u0646\u0635 \u0639\u0631\u0628\u064a \u0645\u0646\u0638\u0645 \u0628\u062c\u062f\u0627\u0648\u0644 \u0648\u0639\u0646\u0627\u0648\u064a\u0646 \u0641\u0642\u0637.

# \u0627\u0644\u0647\u0648\u064a\u0629 \u0648\u0627\u0644\u0633\u064a\u0627\u0642 \u2014 Leader Assistant
\u0623\u0646\u062a **Leader Assistant**\u060c \u0627\u0644\u0645\u0633\u0627\u0639\u062f \u0627\u0644\u0630\u0643\u064a \u0644\u0640 **Leader Academy** \u0641\u064a \u062a\u0648\u0646\u0633. \u0645\u0633\u062a\u0634\u0627\u0631 \u062a\u0639\u0644\u064a\u0645\u064a \u0631\u0642\u0645\u064a \u0645\u062a\u0643\u0627\u0645\u0644.${subjectInfo}${levelInfo}${langNote}${contextNote}

## \u0642\u0648\u0627\u0639\u062f \u0627\u0644\u062a\u0646\u0633\u064a\u0642
- \u0627\u0633\u062a\u062e\u062f\u0645 \u0639\u0646\u0627\u0648\u064a\u0646 Markdown (## \u0648 ###) \u0644\u0643\u0644 \u0642\u0633\u0645
- \u0627\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u062c\u062f\u0627\u0648\u0644 \u0644\u062a\u0646\u0638\u064a\u0645 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062a
- \u0627\u0633\u062a\u062e\u062f\u0645 **\u0627\u0644\u0646\u0635 \u0627\u0644\u0639\u0631\u064a\u0636** \u0644\u0644\u0645\u0635\u0637\u0644\u062d\u0627\u062a \u0627\u0644\u0645\u0641\u062a\u0627\u062d\u064a\u0629
- \u0644\u0627 \u062a\u0639\u0631\u0636 \u0623\u0628\u062f\u0627\u064b \u0643\u0648\u062f \u0623\u0648 JSON
- \u0627\u0644\u0645\u0635\u0637\u0644\u062d\u0627\u062a \u0627\u0644\u062a\u0648\u0646\u0633\u064a\u0629: \u0633\u0646\u062f\u060c \u062a\u0639\u0644\u064a\u0645\u0629\u060c \u0645\u0639\u0627\u064a\u064a\u0631 \u0627\u0644\u062a\u0645\u0644\u0643 (\u0645\u06391\u060c \u0645\u06392\u060c \u0645\u06393\u060c \u0645\u06394)\u060c \u0643\u0641\u0627\u064a\u0629 \u062e\u062a\u0627\u0645\u064a\u0629\u060c \u0647\u062f\u0641 \u0645\u0645\u064a\u0632\u060c \u0648\u0636\u0639\u064a\u0629 \u0645\u0634\u0643\u0644\u0629\u060c \u0648\u0636\u0639\u064a\u0629 \u0625\u062f\u0645\u0627\u062c\u064a\u0629

## \u0627\u0644\u0645\u0631\u0627\u062c\u0639 \u0627\u0644\u0628\u064a\u062f\u0627\u063a\u0648\u062c\u064a\u0629
- \u0634\u0628\u0643\u0629 \u0627\u0644\u062b\u0644\u062b\u064a\u0646: 0\u21925\u219210\u219215 (+5 \u062a\u0645\u064a\u0632)
- \u0645\u0639\u0627\u064a\u064a\u0631: \u06451(\u0645\u0644\u0627\u0621\u0645\u0629) \u06452(\u0627\u0646\u0633\u062c\u0627\u0645) \u06453(\u0623\u062f\u0648\u0627\u062a) \u06454(\u0625\u062a\u0642\u0627\u0646) \u06455(\u062a\u0648\u0627\u0635\u0644) = 10 \u0646\u0642\u0627\u0637
- \u0631\u0645\u0648\u0632: \u06451\u0628\u060c \u06452\u0623\u060c \u06452\u0628\u060c \u06452\u062c\u060c \u06453
- \u0647\u064a\u0643\u0644 \u0627\u0644\u0627\u062e\u062a\u0628\u0627\u0631: 3-5 \u0633\u0646\u062f\u0627\u062a + \u062a\u0639\u0644\u064a\u0645\u0627\u062a + \u062c\u062f\u0648\u0644 \u062a\u0646\u0642\u064a\u0637 \u0631\u0633\u0645\u064a
- \u0627\u0644\u062a\u0648\u0632\u064a\u0639 \u0627\u0644\u0633\u0646\u0648\u064a: 3 \u062b\u0644\u0627\u062b\u064a\u0627\u062a \u00d7 2 \u0641\u062a\u0631\u0627\u062a = 6 \u0641\u062a\u0631\u0627\u062a\u060c 96 \u062d\u0635\u0629 \u0633\u0646\u0648\u064a\u0627\u064b`;
}

/**
 * SSE streaming endpoint for EduGPT assistant chat
 * POST /api/assistant/stream
 * 
 * Accepts the same payload as the tRPC assistant.chat mutation
 * but returns a Server-Sent Events stream with progressive text chunks
 */
export async function streamChatHandler(req: Request, res: Response) {
  try {
    // Authenticate user
    const user = await sdk.authenticateRequest(req);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { messages, subject, level, teachingLanguage } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "messages array is required" });
      return;
    }

    // Build the system prompt (same as tRPC endpoint)
    const subjectInfo = subject ? `\n\n\ud83d\udcda المادة الدراسية المحددة: **${subject}**` : "";
    const levelInfo = level ? `\n\ud83c\udf93 المستوى الدراسي المحدد: **${level}**` : "";
    
    const langNote = teachingLanguage === "french"
      ? `\n🇫🇷 Langue d'enseignement préférée: **Français**.\n⚠️ **RÈGLE ABSOLUE DE LANGUE**: Tu DOIS répondre dans la MÊME langue que le DERNIER message de l'utilisateur. Si l'utilisateur écrit en arabe, tu réponds en arabe MÊME SI la langue d'enseignement est le français. Si l'utilisateur écrit en français, réponds en français. La langue du message de l'utilisateur a TOUJOURS la priorité absolue.`
      : teachingLanguage === "english"
      ? `\n🇬🇧 Preferred teaching language: **English**.\n⚠️ **ABSOLUTE LANGUAGE RULE**: You MUST respond in the SAME language as the user's LAST message. If the user writes in Arabic, respond in Arabic EVEN IF the teaching language is English. If the user writes in English, respond in English. The user's message language ALWAYS has absolute priority.`
      : `\n🇹🇳 لغة التدريس المفضلة: **العربية**.\n⚠️ **قاعدة مطلقة للغة**: يجب أن ترد دائماً بنفس لغة رسالة المستخدم الأخيرة. إذا كتب بالعربية رد بالعربية. إذا كتب بالفرنسية رد بالفرنسية.`;
    
    const contextNote = (subject && level)
      ? `\n\nتذكير: المدرس يعمل حالياً على مادة **${subject}** للمستوى **${level}**. يجب أن تكون جميع إجاباتك متوافقة مع هذه المادة وهذا المستوى تحديداً.`
      : `\n\nتنبيه مهم: إذا لم يحدد المدرس المادة والمستوى الدراسي بعد، يجب أن تطلبهما بشكل مهذب قبل تقديم أي محتوى بيداغوجي. لا تقدم أي مذكرة أو تمرين أو توزيع قبل معرفة المادة والمستوى.`;

    const systemPrompt = buildSystemPrompt(subjectInfo, levelInfo, langNote, contextNote);

    // Limit conversation history to last 12 messages
    const recentMessages = messages.length > 12 ? messages.slice(-12) : messages;

    // Build LLM messages with attachment handling
    const llmMessages = recentMessages.map((m: any) => {
      if (!m.attachments || m.attachments.length === 0) {
        return { role: m.role, content: m.content };
      }
      const contentParts: any[] = [];
      if (m.content) {
        contentParts.push({ type: "text", text: m.content });
      }
      for (const att of m.attachments) {
        if (!att.url) continue;
        const mime = att.type || "";
        if (mime.startsWith("image/")) {
          contentParts.push({
            type: "image_url",
            image_url: { url: att.url, detail: "high" },
          });
        } else if (mime === "application/pdf") {
          contentParts.push({
            type: "file_url",
            file_url: { url: att.url, mime_type: "application/pdf" },
          });
        } else {
          contentParts.push({
            type: "text",
            text: `[ملف مرفق: ${att.name} (${mime || "وثيقة"}) - يرجى تحليل محتواه والرد بناءً عليه]`,
          });
        }
      }
      return { role: m.role, content: contentParts };
    });

    // Build the full payload with stream: true
    const payload: Record<string, unknown> = {
      model: "gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        ...llmMessages,
      ],
      max_tokens: 4096,
      stream: true,
      thinking: { budget_tokens: 128 },
    };

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    // Call the LLM API with streaming
    const apiResponse = await fetch(resolveApiUrl(), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      res.write(`data: ${JSON.stringify({ error: `LLM error: ${apiResponse.status} - ${errorText}` })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }

    if (!apiResponse.body) {
      res.write(`data: ${JSON.stringify({ error: "No response body" })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }

    // Stream the response chunks to the client
    const reader = apiResponse.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Process complete SSE lines from the buffer
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          
          if (trimmed === "data: [DONE]") {
            res.write("data: [DONE]\n\n");
            continue;
          }

          if (trimmed.startsWith("data: ")) {
            try {
              const jsonStr = trimmed.slice(6);
              const chunk = JSON.parse(jsonStr);
              
              // Extract the delta content
              const delta = chunk.choices?.[0]?.delta;
              if (delta?.content) {
                res.write(`data: ${JSON.stringify({ content: delta.content })}\n\n`);
              }
              
              // Check for finish reason
              const finishReason = chunk.choices?.[0]?.finish_reason;
              if (finishReason) {
                res.write(`data: ${JSON.stringify({ finish_reason: finishReason })}\n\n`);
              }
            } catch {
              // Skip malformed JSON chunks
            }
          }
        }
      }
    } catch (streamError) {
      console.error("Stream reading error:", streamError);
      res.write(`data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`);
    }

    // Process any remaining buffer
    if (buffer.trim()) {
      const trimmed = buffer.trim();
      if (trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
        try {
          const jsonStr = trimmed.slice(6);
          const chunk = JSON.parse(jsonStr);
          const delta = chunk.choices?.[0]?.delta;
          if (delta?.content) {
            res.write(`data: ${JSON.stringify({ content: delta.content })}\n\n`);
          }
        } catch {
          // Skip
        }
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();

  } catch (error: any) {
    console.error("Stream chat error:", error);
    // If headers not sent yet, send JSON error
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || "Internal server error" });
    } else {
      // If already streaming, send error as SSE event
      res.write(`data: ${JSON.stringify({ error: error.message || "Internal server error" })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
    }
  }
}
