// Single source of truth for personal info + site metadata.
// Change once here; Base, HeroPlate, Dock, ContactWindow all pick it up.

export const site = {
  name: 'Shivansh Jagga',
  role: 'Co-founder & CTO, Tanagram',
  tagline: 'built AI agent infra · shipped products that got revenue',

  email: 'shivujagga@gmail.com',
  phone: '+1 (646) 639-1770',
  github: 'https://github.com/ShivanshJ',
  linkedin: 'https://linkedin.com/in/ShivanshJ',
  behance: 'https://www.behance.net/ShivanshJ',

  themeColor: '#232323',

  // Cloudflare Worker that records hits and serves /stats.
  // Update this after `wrangler deploy` prints the live URL.
  analyticsEndpoint: 'https://portfolio-hits.portfolio-shivanshj.workers.dev',
} as const;

export const seo = {
  title: `${site.name} — ${site.role}`,
  description: `${site.tagline}.`,
} as const;
