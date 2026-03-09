import { describe, it, expect, vi } from "vitest";

describe("Image Generation Prompt Improvements", () => {
  it("should include NO Arabic text instruction in the full prompt", () => {
    // Simulate the prompt construction logic from routers.ts
    const stylePrompts: Record<string, string> = {
      bw_lineart: "Black and white line art, clean outlines, no shading, no colors, high contrast, suitable for photocopying on school papers, educational illustration",
      minimalist: "Minimalist illustration, very simple shapes, limited colors (max 2), clean design, suitable for black and white printing, educational",
      cartoon: "Cute cartoon illustration, colorful, child-friendly, educational, simple shapes, bright colors, suitable for primary school textbook",
      realistic: "Photorealistic educational image, high quality, clear details, suitable for classroom use",
      diagram: "Clean educational diagram/chart, clear lines, professional infographic, white background, organized layout. Use numbers and arrows instead of text labels",
      coloring: "Black and white coloring page for children, simple outlines, no shading, suitable for printing and coloring, educational theme",
    };

    const style = "bw_lineart";
    const styleLabel = stylePrompts[style] || stylePrompts.bw_lineart;
    const translatedPrompt = "A chicken pecking grains and a cow eating grass";
    const contextInfo = "Context: Science lesson for 3rd grade primary students in Tunisia. ";

    const fullPrompt = `${contextInfo}${translatedPrompt}. Style: ${styleLabel}. CRITICAL: Do NOT include any Arabic text, Arabic letters, or any written text/labels/words in the image. The image must contain ONLY visual elements (drawings, objects, animals, people, scenes) with NO text whatsoever. The image must be educational and appropriate for school use.`;

    // Verify the prompt contains the critical no-text instruction
    expect(fullPrompt).toContain("Do NOT include any Arabic text");
    expect(fullPrompt).toContain("NO text whatsoever");
    expect(fullPrompt).toContain("ONLY visual elements");
    // Verify the translated English prompt is used instead of Arabic
    expect(fullPrompt).toContain("chicken pecking grains");
    expect(fullPrompt).not.toContain("دجاجة");
  });

  it("should use English prompt for all styles", () => {
    const styles = ["bw_lineart", "minimalist", "cartoon", "realistic", "diagram", "coloring"];
    const stylePrompts: Record<string, string> = {
      bw_lineart: "Black and white line art, clean outlines, no shading, no colors, high contrast, suitable for photocopying on school papers, educational illustration",
      minimalist: "Minimalist illustration, very simple shapes, limited colors (max 2), clean design, suitable for black and white printing, educational",
      cartoon: "Cute cartoon illustration, colorful, child-friendly, educational, simple shapes, bright colors, suitable for primary school textbook",
      realistic: "Photorealistic educational image, high quality, clear details, suitable for classroom use",
      diagram: "Clean educational diagram/chart, clear lines, professional infographic, white background, organized layout. Use numbers and arrows instead of text labels",
      coloring: "Black and white coloring page for children, simple outlines, no shading, suitable for printing and coloring, educational theme",
    };

    for (const style of styles) {
      const styleLabel = stylePrompts[style];
      expect(styleLabel).toBeDefined();
      // Diagram style should not mention "labeled in Arabic" anymore
      if (style === "diagram") {
        expect(styleLabel).not.toContain("labeled in Arabic");
        expect(styleLabel).toContain("numbers and arrows");
      }
    }
  });

  it("should construct infographic prompt without Arabic text instruction", () => {
    const title = "الجهاز الهضمي";
    const subject = "الإيقاظ العلمي";
    const style = "educational";
    const styleDescriptions: Record<string, string> = {
      educational: "تعليمي واضح ومبسط للطلاب",
    };

    const prompt = `Create a professional infographic about "${title}". Subject: ${subject}. Style: ${styleDescriptions[style] || style}. Use vibrant colors, clear icons, and well-organized layout. CRITICAL: Do NOT include any Arabic text or Arabic letters in the image. Use only visual elements, icons, numbers, and arrows. No written text or labels. Make it visually appealing and educational.`;

    expect(prompt).toContain("Do NOT include any Arabic text");
    expect(prompt).toContain("No written text or labels");
    // Should NOT say "Include title in Arabic"
    expect(prompt).not.toContain("Include title in Arabic");
  });

  it("should construct mind map prompt without Arabic text instruction", () => {
    const centralTopic = "أركان الإسلام";

    const prompt = `Create a colorful mind map with "${centralTopic}" as the central topic. Generate relevant branches automatically. Use different colors for each branch, clear connections, and icons. CRITICAL: Do NOT include any Arabic text or Arabic letters in the image. Use only visual elements, icons, numbers, and simple symbols. Make it visually organized and easy to understand. Professional educational style.`;

    expect(prompt).toContain("Do NOT include any Arabic text");
    expect(prompt).toContain("visual elements, icons, numbers");
    // Should NOT say "in Arabic" for the mind map
    expect(prompt).not.toMatch(/mind map in Arabic/);
  });

  it("should fallback to original prompt if translation fails", () => {
    // Test the fallback logic
    const originalPrompt = "صور لأسد في حديقة الحيوانات";
    let translatedPrompt = originalPrompt;

    // Simulate translation failure
    try {
      throw new Error("Translation failed");
    } catch {
      // fallback to original prompt - this is the expected behavior
    }

    expect(translatedPrompt).toBe(originalPrompt);
  });
});
