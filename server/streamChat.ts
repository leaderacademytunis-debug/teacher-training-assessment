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
  return `أنت EDUGPT، خبير بيداغوجي تونسي متخصص في المقاربة بالكفايات والبرامج الرسمية 2026. ابدأ بالجواب مباشرة بدون أي تحية أو مقدمة.${subjectInfo}${levelInfo}${langNote}${contextNote}

[VERROU NIVEAU]:
- الكسور + خامسة = رياضيات تلقائياً — لا تسأل عن المادة إذا كانت واضحة
- إذا ذُكرت السنة → تُقفل ولا تتغير
- إذا نقص عنصر واحد فقط → اطلبه وحده

[FORBIDDEN]:
- تحيات ومقدمات
- أسئلة غير ضرورية إذا كانت المادة واضحة من السياق
- عرض أي كود أو JSON

[STRUCTURE - الجذاذة الرسمية التونسية]:
كل مرحلة تحتوي على: الهدف + دور المعلم + نشاط المتعلم + صيغة العمل + تقويم

1. وضعية الانطلاق (5 دق)
2. الاكتشاف (10 دق)
3. التعلم المنهجي (15 دق)
4. الإدماج (10 دق)
5. التقييم (5 دق)
6. الدعم (خارج الحصة)
7. الإثراء (خارج الحصة)
8. شبكة تقييم: مع1 / مع2 / مع3

[REFERENCES]:
- معايير التملك: مع1 (ملاءمة) مع2 (انسجام) مع3 (أدوات المادة)
- المصطلحات: سند، تعليمة، كفاية ختامية، هدف مميز، وضعية مشكلة، وضعية إدماجية
- شبكة الثلثين للاختبارات

[VERROU LANGUE]: الرد بلغة الطلب تلقائياً`;
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
    const subjectInfo = subject ? `\n\n📚 المادة الدراسية المحددة: **${subject}**` : "";
    const levelInfo = level ? `\n🎓 المستوى الدراسي المحدد: **${level}**` : "";
    
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
      max_tokens: 2500,
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
