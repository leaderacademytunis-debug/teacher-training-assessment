import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

// Read the UltimateStudio component source for structural validation
const componentSource = readFileSync(
  join(__dirname, "../client/src/pages/UltimateStudio.tsx"),
  "utf-8"
);

describe("Ultimate Studio Mobile Responsive Layout", () => {
  describe("Mobile Tab Navigation", () => {
    it("should have a mobile tab navigation bar hidden on desktop (md:hidden)", () => {
      expect(componentSource).toContain("md:hidden");
      expect(componentSource).toContain("mobileTab");
    });

    it("should define three mobile tabs: source, pipeline, storyboard", () => {
      expect(componentSource).toContain('"source" as MobileTab');
      expect(componentSource).toContain('"pipeline" as MobileTab');
      expect(componentSource).toContain('"storyboard" as MobileTab');
    });

    it("should have MobileTab type defined", () => {
      expect(componentSource).toContain('type MobileTab = "source" | "pipeline" | "storyboard"');
    });

    it("should have mobileTab state initialized to source", () => {
      expect(componentSource).toContain('useState<MobileTab>("source")');
    });

    it("should have setMobileTab onClick handler for tabs", () => {
      expect(componentSource).toContain("setMobileTab(tab.key)");
    });
  });

  describe("Responsive Column Layout", () => {
    it("should use flex-col on mobile and flex-row on desktop for main layout", () => {
      expect(componentSource).toContain("flex flex-col md:flex-row");
    });

    it("should have Column 1 (Source) with w-full on mobile and w-[30%] on desktop", () => {
      expect(componentSource).toContain("w-full md:w-[30%]");
    });

    it("should have Column 3 (Storyboard) with w-full on mobile and w-[40%] on desktop", () => {
      expect(componentSource).toContain("w-full md:w-[40%]");
    });

    it("should conditionally hide columns based on mobileTab state", () => {
      // Column 1 hidden when not source
      expect(componentSource).toContain('mobileTab !== "source" ? "hidden md:flex" : "flex"');
      // Column 2 hidden when not pipeline
      expect(componentSource).toContain('mobileTab !== "pipeline" ? "hidden md:flex" : "flex"');
      // Column 3 hidden when not storyboard
      expect(componentSource).toContain('mobileTab !== "storyboard" ? "hidden md:flex" : "flex"');
    });
  });

  describe("Responsive Top Bar", () => {
    it("should have responsive padding in top bar", () => {
      expect(componentSource).toContain("px-2 sm:px-4");
      expect(componentSource).toContain("py-2 sm:py-3");
    });

    it("should hide button labels on mobile (hidden sm:inline)", () => {
      expect(componentSource).toContain('className="hidden sm:inline"');
    });

    it("should have responsive icon sizes in top bar", () => {
      expect(componentSource).toContain("w-8 h-8 sm:w-10 sm:h-10");
    });

    it("should hide export buttons on mobile (hidden md:flex)", () => {
      expect(componentSource).toContain("hidden md:flex");
    });

    it("should hide greeting on small screens", () => {
      expect(componentSource).toContain("hidden lg:inline");
    });
  });

  describe("Responsive Column Headers", () => {
    it("should hide source column header on mobile", () => {
      expect(componentSource).toContain("hidden md:flex items-center gap-2 mb-2");
    });

    it("should hide pipeline header on mobile", () => {
      expect(componentSource).toContain("hidden md:block");
    });

    it("should hide storyboard header title on mobile", () => {
      expect(componentSource).toContain("hidden md:flex items-center gap-2");
    });
  });

  describe("Mobile Export Buttons", () => {
    it("should have mobile-only export buttons in storyboard (md:hidden)", () => {
      // Mobile export section
      const mobileExportMatch = componentSource.match(/mt-2 md:hidden/);
      expect(mobileExportMatch).not.toBeNull();
    });
  });

  describe("Responsive Image Style Grid", () => {
    it("should use 2 columns on mobile and 3 on desktop for style grid", () => {
      expect(componentSource).toContain("grid-cols-2 sm:grid-cols-3");
    });
  });

  describe("Responsive Scene Card Images", () => {
    it("should have responsive image height in scene cards", () => {
      expect(componentSource).toContain("h-48 sm:h-40");
    });
  });

  describe("Mobile Height Calculation", () => {
    it("should have different height calc for mobile and desktop", () => {
      expect(componentSource).toContain("h-[calc(100vh-82px)] md:h-[calc(100vh-57px)]");
    });
  });
});
