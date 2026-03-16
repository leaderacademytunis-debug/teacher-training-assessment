import { Helmet } from "react-helmet-async";

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
const DEFAULT_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310693302/7KYbbDR94nK6ykUvdjLGsp/apple-touch-icon_ecd511e1.png";
const SITE_URL = "https://leaderacademy.school";

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

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {descriptionFr && <meta name="description" lang="fr" content={descriptionFr} />}

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="ar_TN" />
      <meta property="og:locale:alternate" content="fr_FR" />
      <meta property="og:locale:alternate" content="en_US" />
      <meta property="og:site_name" content="Leader Academy" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {noIndex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
}
