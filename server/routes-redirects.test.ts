import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Routes & Redirects", () => {
  const appTsxPath = path.resolve(__dirname, "../client/src/App.tsx");
  const appContent = fs.readFileSync(appTsxPath, "utf-8");

  it("should have /certificates redirect to /my-certificates", () => {
    expect(appContent).toContain('path="/certificates"');
    expect(appContent).toContain('to="/my-certificates"');
  });

  it("should have /career redirect to /jobs", () => {
    expect(appContent).toContain('path="/career"');
    expect(appContent).toContain('to="/jobs"');
  });

  it("should have /management redirect to /managerial-dashboard", () => {
    expect(appContent).toContain('path="/management"');
    expect(appContent).toContain('to="/managerial-dashboard"');
  });

  it("should have /about route defined", () => {
    expect(appContent).toContain('path="/about"');
    expect(appContent).toContain("About");
  });

  it("should have a catch-all NotFound route", () => {
    expect(appContent).toContain("<Route component={NotFound} />");
  });

  it("should import Redirect component", () => {
    expect(appContent).toContain('import Redirect from');
  });
});

describe("About Page", () => {
  const aboutPath = path.resolve(__dirname, "../client/src/pages/About.tsx");

  it("should exist as a file", () => {
    expect(fs.existsSync(aboutPath)).toBe(true);
  });

  it("should contain Arabic content about Leader Academy", () => {
    const content = fs.readFileSync(aboutPath, "utf-8");
    expect(content).toContain("Leader Academy");
    expect(content).toContain("علي سعدالله");
    expect(content).toContain("الذكاء الاصطناعي");
    expect(content).toContain("تونس");
  });

  it("should have a link back to home", () => {
    const content = fs.readFileSync(aboutPath, "utf-8");
    expect(content).toContain('href="/"');
  });

  it("should export a default component", () => {
    const content = fs.readFileSync(aboutPath, "utf-8");
    expect(content).toContain("export default function About");
  });
});

describe("NotFound (404) Page", () => {
  const notFoundPath = path.resolve(__dirname, "../client/src/pages/NotFound.tsx");

  it("should exist as a file", () => {
    expect(fs.existsSync(notFoundPath)).toBe(true);
  });

  it("should contain the required Arabic 404 message", () => {
    const content = fs.readFileSync(notFoundPath, "utf-8");
    expect(content).toContain("عذراً، هذه الصفحة غير موجودة في المنهج!");
  });

  it("should mention the Tunisian curriculum", () => {
    const content = fs.readFileSync(notFoundPath, "utf-8");
    expect(content).toContain("البرامج الرسمية التونسية");
  });

  it("should have a button to go home", () => {
    const content = fs.readFileSync(notFoundPath, "utf-8");
    expect(content).toContain("العودة للصفحة الرئيسية");
  });

  it("should display 404 prominently", () => {
    const content = fs.readFileSync(notFoundPath, "utf-8");
    expect(content).toContain("404");
  });

  it("should export a default component", () => {
    const content = fs.readFileSync(notFoundPath, "utf-8");
    expect(content).toContain("export default function NotFound");
  });
});

describe("Redirect Component", () => {
  const redirectPath = path.resolve(__dirname, "../client/src/components/Redirect.tsx");

  it("should exist as a file", () => {
    expect(fs.existsSync(redirectPath)).toBe(true);
  });

  it("should use wouter's useLocation for navigation", () => {
    const content = fs.readFileSync(redirectPath, "utf-8");
    expect(content).toContain("useLocation");
    expect(content).toContain("setLocation");
  });

  it("should accept a 'to' prop", () => {
    const content = fs.readFileSync(redirectPath, "utf-8");
    expect(content).toContain("to");
    expect(content).toContain("replace: true");
  });
});

describe("Navigation Links", () => {
  const homePath = path.resolve(__dirname, "../client/src/pages/Home.tsx");
  const homeContent = fs.readFileSync(homePath, "utf-8");

  it("should have About link pointing to /about", () => {
    expect(homeContent).toContain('href: "/about"');
    expect(homeContent).toContain("عن الأكاديمية");
  });
});
