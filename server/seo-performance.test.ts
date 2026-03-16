import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const INDEX_HTML = fs.readFileSync(
  path.join(PROJECT_ROOT, "client", "index.html"),
  "utf-8"
);

describe("SEO: index.html meta tags", () => {
  it("has the correct title", () => {
    expect(INDEX_HTML).toContain(
      "<title>Leader Academy - منصة التعليم الذكي والمساعد البيداغوجي في تونس</title>"
    );
  });

  it("has Arabic meta description", () => {
    expect(INDEX_HTML).toContain(
      'المنصة التونسية الأولى للذكاء الاصطناعي في التعليم'
    );
    expect(INDEX_HTML).toContain('أعدّ جذاذاتك في دقائق');
  });

  it("has French meta description", () => {
    expect(INDEX_HTML).toContain(
      "La première plateforme tunisienne d'IA éducative"
    );
  });

  it("has canonical URL pointing to leaderacademy.school", () => {
    expect(INDEX_HTML).toContain(
      '<link rel="canonical" href="https://leaderacademy.school"'
    );
  });

  it("has robots meta tag allowing indexing", () => {
    expect(INDEX_HTML).toContain('name="robots" content="index, follow"');
  });
});

describe("SEO: Open Graph tags", () => {
  it("has og:title", () => {
    expect(INDEX_HTML).toContain('property="og:title"');
    expect(INDEX_HTML).toContain("Leader Academy");
  });

  it("has og:description", () => {
    expect(INDEX_HTML).toContain('property="og:description"');
  });

  it("has og:image", () => {
    expect(INDEX_HTML).toContain('property="og:image"');
  });

  it("has og:url pointing to leaderacademy.school", () => {
    expect(INDEX_HTML).toContain(
      'property="og:url" content="https://leaderacademy.school"'
    );
  });

  it("has og:locale for ar_TN", () => {
    expect(INDEX_HTML).toContain('content="ar_TN"');
  });

  it("has og:locale:alternate for fr_FR", () => {
    expect(INDEX_HTML).toContain('content="fr_FR"');
  });

  it("has og:locale:alternate for en_US", () => {
    expect(INDEX_HTML).toContain('content="en_US"');
  });

  it("has og:site_name", () => {
    expect(INDEX_HTML).toContain(
      'property="og:site_name" content="Leader Academy"'
    );
  });
});

describe("SEO: Twitter Card tags", () => {
  it("has twitter:card", () => {
    expect(INDEX_HTML).toContain('name="twitter:card" content="summary_large_image"');
  });

  it("has twitter:title", () => {
    expect(INDEX_HTML).toContain('name="twitter:title"');
  });

  it("has twitter:description", () => {
    expect(INDEX_HTML).toContain('name="twitter:description"');
  });

  it("has twitter:image", () => {
    expect(INDEX_HTML).toContain('name="twitter:image"');
  });
});

describe("SEO: Structured Data (JSON-LD)", () => {
  it("has JSON-LD script tag", () => {
    expect(INDEX_HTML).toContain('type="application/ld+json"');
  });

  it("has EducationalOrganization schema type", () => {
    expect(INDEX_HTML).toContain('"@type": "EducationalOrganization"');
  });

  it("references leaderacademy.school as URL", () => {
    expect(INDEX_HTML).toContain('"url": "https://leaderacademy.school"');
  });

  it("includes founder name", () => {
    expect(INDEX_HTML).toContain('"name": "علي سعدالله"');
  });
});

describe("Google Analytics GA4 placeholder", () => {
  it("has gtag.js script tag", () => {
    expect(INDEX_HTML).toContain("googletagmanager.com/gtag/js");
  });

  it("has GA_MEASUREMENT_ID placeholder", () => {
    expect(INDEX_HTML).toContain("GA_MEASUREMENT_ID");
  });

  it("has dataLayer initialization", () => {
    expect(INDEX_HTML).toContain("window.dataLayer = window.dataLayer || []");
  });
});

describe("Performance: Vite code splitting config", () => {
  const viteConfig = fs.readFileSync(
    path.join(PROJECT_ROOT, "vite.config.ts"),
    "utf-8"
  );

  it("has manualChunks configuration", () => {
    expect(viteConfig).toContain("manualChunks");
  });

  it("splits React into vendor-react chunk", () => {
    expect(viteConfig).toContain("vendor-react");
    expect(viteConfig).toContain("node_modules/react/");
  });

  it("splits Radix UI into vendor-radix chunk", () => {
    expect(viteConfig).toContain("vendor-radix");
    expect(viteConfig).toContain("@radix-ui/");
  });

  it("splits tRPC/TanStack into vendor-trpc chunk", () => {
    expect(viteConfig).toContain("vendor-trpc");
    expect(viteConfig).toContain("@trpc/");
  });

  it("splits Lucide icons into vendor-icons chunk", () => {
    expect(viteConfig).toContain("vendor-icons");
    expect(viteConfig).toContain("lucide-react");
  });

  it("splits charts into vendor-charts chunk", () => {
    expect(viteConfig).toContain("vendor-charts");
    expect(viteConfig).toContain("recharts");
  });
});

describe("Performance: React.lazy usage in App.tsx", () => {
  const appTsx = fs.readFileSync(
    path.join(PROJECT_ROOT, "client", "src", "App.tsx"),
    "utf-8"
  );

  it("uses React.lazy for EduGPT", () => {
    expect(appTsx).toMatch(/lazy\(\(\) => import\(.*EduGPT/);
  });

  it("uses React.lazy for Marketplace", () => {
    expect(appTsx).toMatch(/lazy\(\(\) => import\(.*Marketplace/);
  });

  it("uses React.lazy for Dashboard", () => {
    expect(appTsx).toMatch(/lazy\(\(\) => import\(.*Dashboard/);
  });

  it("wraps routes in Suspense", () => {
    expect(appTsx).toContain("<Suspense");
  });

  it("has a PageLoader fallback", () => {
    expect(appTsx).toContain("PageLoader");
  });
});

describe("SEOHead component exists", () => {
  const seoHead = fs.readFileSync(
    path.join(PROJECT_ROOT, "client", "src", "components", "SEOHead.tsx"),
    "utf-8"
  );

  it("exports a default function", () => {
    expect(seoHead).toContain("export default function SEOHead");
  });

  it("uses react-helmet-async Helmet", () => {
    expect(seoHead).toContain('from "react-helmet-async"');
    expect(seoHead).toContain("<Helmet>");
  });

  it("supports title prop", () => {
    expect(seoHead).toContain("title?:");
  });

  it("supports description prop", () => {
    expect(seoHead).toContain("description?:");
  });

  it("supports noIndex prop", () => {
    expect(seoHead).toContain("noIndex?:");
  });

  it("includes og:locale for ar_TN by default", () => {
    expect(seoHead).toContain("ar_TN");
  });
});

describe("HelmetProvider is wired in main.tsx", () => {
  const mainTsx = fs.readFileSync(
    path.join(PROJECT_ROOT, "client", "src", "main.tsx"),
    "utf-8"
  );

  it("imports HelmetProvider", () => {
    expect(mainTsx).toContain("HelmetProvider");
    expect(mainTsx).toContain('from "react-helmet-async"');
  });

  it("wraps App with HelmetProvider", () => {
    expect(mainTsx).toContain("<HelmetProvider>");
    expect(mainTsx).toContain("</HelmetProvider>");
  });
});

describe("SEOHead is used in key pages", () => {
  const pages = ["Home.tsx", "EduGPT.tsx", "Pricing.tsx", "About.tsx", "Marketplace.tsx", "NotFound.tsx"];

  for (const page of pages) {
    it(`${page} imports SEOHead`, () => {
      const content = fs.readFileSync(
        path.join(PROJECT_ROOT, "client", "src", "pages", page),
        "utf-8"
      );
      expect(content).toContain("SEOHead");
    });
  }

  it("NotFound page uses noIndex", () => {
    const content = fs.readFileSync(
      path.join(PROJECT_ROOT, "client", "src", "pages", "NotFound.tsx"),
      "utf-8"
    );
    expect(content).toContain("noIndex");
  });
});

describe("Sitemap: sitemap.xml", () => {
  const sitemap = fs.readFileSync(
    path.join(PROJECT_ROOT, "client", "public", "sitemap.xml"),
    "utf-8"
  );

  it("is valid XML with urlset namespace", () => {
    expect(sitemap).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  });

  it("includes homepage", () => {
    expect(sitemap).toContain("<loc>https://leaderacademy.school/</loc>");
  });

  it("includes /about page", () => {
    expect(sitemap).toContain("<loc>https://leaderacademy.school/about</loc>");
  });

  it("includes /edugpt page", () => {
    expect(sitemap).toContain("<loc>https://leaderacademy.school/edugpt</loc>");
  });

  it("includes /pricing page", () => {
    expect(sitemap).toContain("<loc>https://leaderacademy.school/pricing</loc>");
  });

  it("includes /marketplace page", () => {
    expect(sitemap).toContain("<loc>https://leaderacademy.school/marketplace</loc>");
  });

  it("includes /my-certificates page", () => {
    expect(sitemap).toContain("<loc>https://leaderacademy.school/my-certificates</loc>");
  });

  it("includes /jobs page", () => {
    expect(sitemap).toContain("<loc>https://leaderacademy.school/jobs</loc>");
  });

  it("has priority values", () => {
    expect(sitemap).toContain("<priority>");
  });

  it("has changefreq values", () => {
    expect(sitemap).toContain("<changefreq>");
  });
});

describe("Robots.txt", () => {
  const robots = fs.readFileSync(
    path.join(PROJECT_ROOT, "client", "public", "robots.txt"),
    "utf-8"
  );

  it("allows all user agents", () => {
    expect(robots).toContain("User-agent: *");
  });

  it("allows root", () => {
    expect(robots).toContain("Allow: /");
  });

  it("disallows /api/", () => {
    expect(robots).toContain("Disallow: /api/");
  });

  it("references sitemap with leaderacademy.school domain", () => {
    expect(robots).toContain("Sitemap: https://leaderacademy.school/sitemap.xml");
  });
});

describe("OG Image: updated in index.html", () => {
  it("og:image points to the new OG image (not apple-touch-icon)", () => {
    expect(INDEX_HTML).toContain('property="og:image" content="https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/og-image-');
  });

  it("has og:image:width of 1200", () => {
    expect(INDEX_HTML).toContain('property="og:image:width" content="1200"');
  });

  it("has og:image:height of 630", () => {
    expect(INDEX_HTML).toContain('property="og:image:height" content="630"');
  });

  it("twitter:image also uses the new OG image", () => {
    expect(INDEX_HTML).toContain('name="twitter:image" content="https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/og-image-');
  });
});
