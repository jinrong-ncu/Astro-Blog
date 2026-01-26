import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';

const entries = await getCollection('blog');
const pages = Object.fromEntries(entries.map((post) => [post.slug, post]));

const { getStaticPaths, GET } = await OGImageRoute({
    param: 'slug',
    pages: pages,
    getImageOptions: (path, page: any) => ({
        title: page.data.title,
        description: page.data.description,
        bgGradient: [[24, 24, 27]], // Zinc-900
        border: { color: [63, 63, 70], width: 20 }, // Zinc-700
        font: {
            title: { size: 60, color: [255, 255, 255], families: ['Noto Sans SC'] },
            description: { size: 30, color: [161, 161, 170], families: ['Noto Sans SC'] },
        },
        fonts: [
            './fonts/NotoSansSC-Bold.ttf',
        ],
    }),
});

export { getStaticPaths, GET };
