import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function GET(context: any) {
    const posts = await getCollection('blog');

    // Filter out drafts and sort by date descending
    const filteredPosts = posts
        .filter((post: any) => !post.data.draft)
        .sort(
            (a: any, b: any) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
        );

    return rss({
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        site: context.site || 'https://liujinrong.cn',
        items: filteredPosts.map((post: any) => ({
            title: post.data.title,
            pubDate: post.data.pubDate,
            description: post.data.description,
            link: `/blog/${post.slug}/`,
            // You can add content and custom data if needed
        })),
        customData: '<language>zh-cn</language>',
        stylesheet: '/rss/styles.xsl',
    });
}
