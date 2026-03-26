import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("PWA Configuration", () => {
  const publicDir = path.join(__dirname, "../client/public");

  describe("manifest.json", () => {
    it("should exist in public directory", () => {
      const manifestPath = path.join(publicDir, "manifest.json");
      expect(fs.existsSync(manifestPath)).toBe(true);
    });

    it("should be valid JSON", () => {
      const manifestPath = path.join(publicDir, "manifest.json");
      const content = fs.readFileSync(manifestPath, "utf-8");
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it("should have required PWA fields", () => {
      const manifestPath = path.join(publicDir, "manifest.json");
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

      expect(manifest.name).toBeDefined();
      expect(manifest.short_name).toBeDefined();
      expect(manifest.start_url).toBe("/");
      expect(manifest.display).toBe("standalone");
      expect(manifest.background_color).toBeDefined();
      expect(manifest.theme_color).toBeDefined();
      expect(manifest.icons).toBeDefined();
      expect(Array.isArray(manifest.icons)).toBe(true);
    });

    it("should have correct name and short_name", () => {
      const manifestPath = path.join(publicDir, "manifest.json");
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

      expect(manifest.short_name).toBe("Leader Academy");
      expect(manifest.name).toContain("Leader Academy");
    });

    it("should have RTL direction and Arabic language", () => {
      const manifestPath = path.join(publicDir, "manifest.json");
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

      expect(manifest.dir).toBe("rtl");
      expect(manifest.lang).toBe("ar");
    });

    it("should have icons with required sizes (192x192 and 512x512)", () => {
      const manifestPath = path.join(publicDir, "manifest.json");
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

      const sizes = manifest.icons.map((icon: any) => icon.sizes);
      expect(sizes).toContain("192x192");
      expect(sizes).toContain("512x512");
    });

    it("should have maskable icons", () => {
      const manifestPath = path.join(publicDir, "manifest.json");
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

      const maskableIcons = manifest.icons.filter(
        (icon: any) => icon.purpose === "maskable"
      );
      expect(maskableIcons.length).toBeGreaterThanOrEqual(1);
    });

    it("should have valid icon URLs (CDN)", () => {
      const manifestPath = path.join(publicDir, "manifest.json");
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

      manifest.icons.forEach((icon: any) => {
        expect(icon.src).toMatch(/^https:\/\//);
        expect(icon.type).toBe("image/png");
      });
    });

    it("should have education category", () => {
      const manifestPath = path.join(publicDir, "manifest.json");
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

      expect(manifest.categories).toContain("education");
    });
  });

  describe("Service Worker (sw.js)", () => {
    it("should exist in public directory", () => {
      const swPath = path.join(publicDir, "sw.js");
      expect(fs.existsSync(swPath)).toBe(true);
    });

    it("should contain install event listener", () => {
      const swPath = path.join(publicDir, "sw.js");
      const content = fs.readFileSync(swPath, "utf-8");
      expect(content).toContain("addEventListener('install'");
    });

    it("should contain activate event listener", () => {
      const swPath = path.join(publicDir, "sw.js");
      const content = fs.readFileSync(swPath, "utf-8");
      expect(content).toContain("addEventListener('activate'");
    });

    it("should contain fetch event listener", () => {
      const swPath = path.join(publicDir, "sw.js");
      const content = fs.readFileSync(swPath, "utf-8");
      expect(content).toContain("addEventListener('fetch'");
    });

    it("should skip API requests from caching", () => {
      const swPath = path.join(publicDir, "sw.js");
      const content = fs.readFileSync(swPath, "utf-8");
      expect(content).toContain("/api/");
    });

    it("should have push notification handler", () => {
      const swPath = path.join(publicDir, "sw.js");
      const content = fs.readFileSync(swPath, "utf-8");
      expect(content).toContain("addEventListener('push'");
    });

    it("should have notification click handler", () => {
      const swPath = path.join(publicDir, "sw.js");
      const content = fs.readFileSync(swPath, "utf-8");
      expect(content).toContain("addEventListener('notificationclick'");
    });

    it("should define a cache name", () => {
      const swPath = path.join(publicDir, "sw.js");
      const content = fs.readFileSync(swPath, "utf-8");
      expect(content).toMatch(/CACHE_NAME\s*=\s*['"]leader-academy/);
    });
  });

  describe("Offline page", () => {
    it("should exist in public directory", () => {
      const offlinePath = path.join(publicDir, "offline.html");
      expect(fs.existsSync(offlinePath)).toBe(true);
    });

    it("should be valid HTML with Arabic content", () => {
      const offlinePath = path.join(publicDir, "offline.html");
      const content = fs.readFileSync(offlinePath, "utf-8");
      expect(content).toContain("<!DOCTYPE html>");
      expect(content).toContain('dir="rtl"');
      expect(content).toContain('lang="ar"');
    });

    it("should have a retry button", () => {
      const offlinePath = path.join(publicDir, "offline.html");
      const content = fs.readFileSync(offlinePath, "utf-8");
      expect(content).toContain("reload()");
    });
  });

  describe("index.html PWA integration", () => {
    it("should link to manifest.json", () => {
      const indexPath = path.join(publicDir, "../index.html");
      const content = fs.readFileSync(indexPath, "utf-8");
      expect(content).toContain('rel="manifest"');
      expect(content).toContain("manifest.json");
    });

    it("should have theme-color meta tag", () => {
      const indexPath = path.join(publicDir, "../index.html");
      const content = fs.readFileSync(indexPath, "utf-8");
      expect(content).toContain('name="theme-color"');
    });

    it("should have apple-mobile-web-app-capable meta tag", () => {
      const indexPath = path.join(publicDir, "../index.html");
      const content = fs.readFileSync(indexPath, "utf-8");
      expect(content).toContain('name="apple-mobile-web-app-capable"');
    });

    it("should have apple-touch-icon with 180x180 size", () => {
      const indexPath = path.join(publicDir, "../index.html");
      const content = fs.readFileSync(indexPath, "utf-8");
      expect(content).toContain('sizes="180x180"');
    });
  });

  describe("Service Worker registration in main.tsx", () => {
    it("should register service worker in main.tsx", () => {
      const mainPath = path.join(__dirname, "../client/src/main.tsx");
      const content = fs.readFileSync(mainPath, "utf-8");
      expect(content).toContain("serviceWorker");
      expect(content).toContain("register('/sw.js')");
    });
  });
});
