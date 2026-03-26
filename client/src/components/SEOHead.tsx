import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  titleSuffix?: boolean;
  description?: string;
  descriptionFr?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  noIndex?: boolean;
}

const DEFAULT_TITLE = "Leader Academy - منصة التعليم الذكي والمساعد البيداغوجي في تونس";
const DEFAULT_DESCRIPTION = "المنصة التونسية الأولى للذكاء الاصطناعي في التعليم. أعدّ جذاذاتك في دقائق، قيّم تلاميذك بذكاء، وطوّر مهاراتك المهنية.";
const DEFAULT_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/apple-touch-icon_abd3e008.png";
const SITE_URL = "https://leaderacademy.school";

function setMetaTag(attr: string, attrValue: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${attrValue}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export default function SEOHead({
  title,
  titleSuffix = true,
  description = DEFAULT_DESCRIPTION,
  descriptionFr,
  ogImage = DEFAULT_IMAGE,
  ogUrl,
  ogType = "website",
  noIndex = false,
}: SEOHeadProps) {
  const fullTitle = title
    ? titleSuffix
      ? `${title} | Leader Academy`
      : title
    : DEFAULT_TITLE;

  const fullUrl = ogUrl ? `${SITE_URL}${ogUrl}` : SITE_URL;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update meta tags
    setMetaTag("name", "description", description);
    if (descriptionFr) {
      setMetaTag("name", "description-fr", descriptionFr);
    }

    // Open Graph
    setMetaTag("property", "og:type", ogType);
    setMetaTag("property", "og:url", fullUrl);
    setMetaTag("property", "og:title", fullTitle);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:image", ogImage);
    setMetaTag("property", "og:locale", "ar_TN");
    setMetaTag("property", "og:site_name", "Leader Academy");

    // Twitter Card
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", fullTitle);
    setMetaTag("name", "twitter:description", description);
    setMetaTag("name", "twitter:image", ogImage);

    // Robots
    if (noIndex) {
      setMetaTag("name", "robots", "noindex, nofollow");
    } else {
      const robotsMeta = document.querySelector('meta[name="robots"]');
      if (robotsMeta && robotsMeta.getAttribute("content") === "noindex, nofollow") {
        robotsMeta.remove();
      }
    }

    // Cleanup: restore defaults on unmount
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [fullTitle, description, descriptionFr, ogImage, fullUrl, ogType, noIndex]);

  return null;
}
