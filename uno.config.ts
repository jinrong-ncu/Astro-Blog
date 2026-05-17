import {
  defineConfig,
  presetUno,
  presetAttributify,
  presetIcons,
  presetTypography,
  transformerDirectives,
} from 'unocss';

export default defineConfig({
  content: {
    pipeline: {
      include: [
        // the default
        /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
        // include markdown files
        'src/content/blog/**/*.{md,mdx}',
      ],
    },
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
    presetTypography(),
  ],
  transformers: [
    transformerDirectives(),
  ],
  theme: {
    fontFamily: {
      sans: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
    animation: {
      keyframes: {
        'orb-float-1': '{0%, 100% {transform: translate(0, 0) scale(1);} 33% {transform: translate(30%, 20%) scale(1.1);} 66% {transform: translate(-20%, 40%) scale(0.9);}}',
        'orb-float-2': '{0%, 100% {transform: translate(0, 0) scale(1);} 33% {transform: translate(-30%, -20%) scale(1.2);} 66% {transform: translate(20%, -40%) scale(0.8);}}',
        'orb-float-3': '{0%, 100% {transform: translate(0, 0) scale(1);} 33% {transform: translate(40%, -30%) scale(0.9);} 66% {transform: translate(-30%, 20%) scale(1.1);}}',
      },
      durations: {
        'orb-1': '20s',
        'orb-2': '25s',
        'orb-3': '22s',
      },
      timingFns: {
        'orb-1': 'ease-in-out',
        'orb-2': 'ease-in-out',
        'orb-3': 'ease-in-out',
      },
      counts: {
        'orb-1': 'infinite',
        'orb-2': 'infinite',
        'orb-3': 'infinite',
      },
    },
  },
  rules: [
    ['animate-orb-1', { animation: 'orb-float-1 20s ease-in-out infinite' }],
    ['animate-orb-2', { animation: 'orb-float-2 25s ease-in-out infinite' }],
    ['animate-orb-3', { animation: 'orb-float-3 22s ease-in-out infinite' }],
  ],
  shortcuts: [
    ['transition-spring', 'transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]'],
    ['glass-card', 'relative overflow-hidden bg-white/40 dark:bg-white/5 backdrop-blur-xl saturate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_4px_24px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_24px_rgba(0,0,0,0.2)] transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.8)] dark:hover:shadow-[0_20px_40px_-10px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.2)]'],
    ['project-card', 'relative flex flex-col rounded-3xl overflow-hidden bg-white/40 dark:bg-white/5 backdrop-blur-2xl saturate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_4px_24px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_24px_rgba(0,0,0,0.2)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-2 hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.8)] dark:hover:shadow-[0_24px_48px_-12px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.2)]'],
    ['glass-tag', 'bg-zinc-900/5 dark:bg-white/5 backdrop-blur-md saturate-150 border border-solid border-zinc-900/10 dark:border-white/10'],
  ],
});
