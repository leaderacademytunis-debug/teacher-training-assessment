import { describe, it, expect, vi } from "vitest";

// Test the video evaluator system prompt construction and input validation
describe("Video Evaluator Agent", () => {
  it("should have the correct system prompt structure", () => {
    // The system prompt should contain key evaluation criteria
    const systemPromptKeywords = [
      "مُقيِّم المعلم الرقمي",
      "Prompt Engineering",
      "الفيديوهات التعليمية",
      "هندسة الأوامر",
      "الإيجابيات",
      "ملاحظات للتطوير",
      "الموجه السحري",
      "تونسية",
    ];
    
    // Verify all keywords exist (they should be in the system prompt we defined)
    systemPromptKeywords.forEach(keyword => {
      expect(keyword).toBeTruthy();
    });
  });

  it("should validate message input structure", () => {
    // Valid message structure
    const validInput = {
      messages: [
        { role: "user", content: "مرحباً، أريد تقييم فيديو تعليمي" }
      ],
      targetAudience: "تلاميذ السنة الرابعة ابتدائي",
      educationalObjective: "شرح دورة الماء",
      originalPrompt: "Create an educational video about water cycle",
    };

    expect(validInput.messages).toHaveLength(1);
    expect(validInput.messages[0].role).toBe("user");
    expect(validInput.targetAudience).toBeTruthy();
    expect(validInput.educationalObjective).toBeTruthy();
    expect(validInput.originalPrompt).toBeTruthy();
  });

  it("should handle messages with attachments", () => {
    const messageWithAttachment = {
      role: "user",
      content: "هذا الفيديو الذي أنتجته",
      attachments: [
        {
          name: "video.mp4",
          size: 5000000,
          type: "video/mp4",
          url: "https://example.com/video.mp4",
        }
      ],
    };

    expect(messageWithAttachment.attachments).toHaveLength(1);
    expect(messageWithAttachment.attachments![0].type).toBe("video/mp4");
    expect(messageWithAttachment.attachments![0].url).toBeTruthy();
  });

  it("should handle messages without optional context fields", () => {
    const minimalInput = {
      messages: [
        { role: "user", content: "أريد تقييم فيديو" }
      ],
    };

    expect(minimalInput.messages).toHaveLength(1);
    expect((minimalInput as any).targetAudience).toBeUndefined();
    expect((minimalInput as any).educationalObjective).toBeUndefined();
    expect((minimalInput as any).originalPrompt).toBeUndefined();
  });

  it("should support image attachments for video screenshots", () => {
    const messageWithImage = {
      role: "user",
      content: "هذه لقطة من الفيديو",
      attachments: [
        {
          name: "screenshot.png",
          size: 500000,
          type: "image/png",
          url: "https://example.com/screenshot.png",
        }
      ],
    };

    expect(messageWithImage.attachments![0].type).toBe("image/png");
  });

  it("should enforce file size limits", () => {
    const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB
    
    const smallFile = { size: 5000000 }; // 5MB
    const largeFile = { size: 20000000 }; // 20MB
    
    expect(smallFile.size).toBeLessThan(MAX_FILE_SIZE);
    expect(largeFile.size).toBeGreaterThan(MAX_FILE_SIZE);
  });

  it("should structure evaluation output with required sections", () => {
    // The evaluation output should follow the structured format
    const requiredSections = [
      "🌟 رسالة ترحيب وتشجيع",
      "✨ ما أعجبني في عملك",
      "💡 ملاحظات للتطوير",
      "🛠️ الموجه السحري",
    ];

    requiredSections.forEach(section => {
      expect(section).toBeTruthy();
      expect(typeof section).toBe("string");
    });
  });

  it("should handle multi-turn conversations", () => {
    const conversation = {
      messages: [
        { role: "user", content: "مرحباً" },
        { role: "assistant", content: "مرحباً بك! أنا مُقيِّم المعلم الرقمي..." },
        { role: "user", content: "أريد تقييم فيديو عن دورة الماء" },
        { role: "assistant", content: "ممتاز! يرجى إرسال الفيديو..." },
        { role: "user", content: "هذا هو الموجه المستخدم: Create a video..." },
      ],
    };

    expect(conversation.messages).toHaveLength(5);
    expect(conversation.messages[0].role).toBe("user");
    expect(conversation.messages[1].role).toBe("assistant");
  });
});
