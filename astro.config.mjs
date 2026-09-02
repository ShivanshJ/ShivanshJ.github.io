import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';

export default defineConfig({
  output: 'static',
  integrations: [tailwind({ applyBaseStyles: false }), mdx()],
  site: 'https://shivanshj.github.io',
});