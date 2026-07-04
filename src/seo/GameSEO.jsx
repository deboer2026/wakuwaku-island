import { Helmet } from 'react-helmet-async';

const BASE = 'https://wakuwakuislands.com';

export default function GameSEO({ route, name, desc, category, intro, faq, ageMin = 4, ageMax = 12 }) {
  const url = `${BASE}${route}`;
  const title = `${name}｜わくわくアイランド`;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name,
    description: intro || desc,
    url,
    genre: category,
    inLanguage: 'ja',
    applicationCategory: 'Game',
    operatingSystem: 'Web Browser',
    gamePlatform: 'Web Browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
    audience: { '@type': 'PeopleAudience', suggestedMinAge: ageMin, suggestedMaxAge: ageMax },
    isAccessibleForFree: true,
    publisher: { '@type': 'Organization', name: 'わくわくアイランド' },
  };
  const faqLd = faq && faq.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  } : null;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={`${BASE}/og-image.png`} />
      <script type="application/ld+json">{JSON.stringify(ld)}</script>
      {faqLd && <script type="application/ld+json">{JSON.stringify(faqLd)}</script>}
    </Helmet>
  );
}
