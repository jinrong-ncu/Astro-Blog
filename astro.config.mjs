// @ts-check
import { defineConfig } from 'astro/config';

import UnoCSS from '@unocss/astro';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

import sitemap from '@astrojs/sitemap';
import rehypePrettyCode from 'rehype-pretty-code';

// https://astro.build/config
export default defineConfig({
  site: 'https://liujinrong.cn',
  vite: {
    plugins: []
  },
  markdown: {
    rehypePlugins: [
      [rehypePrettyCode, { theme: 'vitesse-dark', keepBackground: true }]
    ]
  },

  integrations: [react(), mdx(), sitemap(), UnoCSS({ injectReset: true })]
});