// @ts-check
import { defineConfig } from 'astro/config';

import UnoCSS from '@unocss/astro';
import react from '@astrojs/react';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://liujinrong.cn',
  redirects: {
    '/blog/wechat-open': '/blog/wechat-open-pro/',
    '/blog/student-knowledge-base-setup': '/blog/student-file-backup-guide/',
  },
  vite: {
    plugins: []
  },
  markdown: {
    shikiConfig: {
      theme: 'vitesse-dark'
    }
  },

  integrations: [react(), sitemap(), UnoCSS({ injectReset: true })]
});
