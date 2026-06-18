import { Helmet } from 'react-helmet-async';

const BASE = 'https://wakuwaku-island.pages.dev';

export default function GameSEO({ route, name, desc, category }) {
  const url = `${BASE}${route}`;
  const title = `${name}｜わくわくアイランド`;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name,
    description: desc,
    url,
    genre: category,
    inLanguage: 'ja',
    applicationCategory: 'Game',
    operatingSystem: 'Web Browser',
    gamePlatform: 'Web Browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
    audience: { '@type': 'PeopleAudience', suggestedMinAge: 4, suggestedMaxAge: 12 },
    isAccessibleForFree: true,
    publisher: { '@type': 'Organization', name: 'わくわくアイランド' },
  };
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
    </Helmet>
  );
}
