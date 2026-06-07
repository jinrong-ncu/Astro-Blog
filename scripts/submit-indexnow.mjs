import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const site = (process.env.SITE_URL || "https://liujinrong.cn").replace(/\/$/, "");
const host = new URL(site).host;
const key = process.env.INDEXNOW_KEY || "87439ac3c9b9970b21a081db9f960898";
const keyLocation = `${site}/${key}.txt`;
const endpoint = process.env.INDEXNOW_ENDPOINT || "https://api.indexnow.org/IndexNow";
const distDir = join(process.cwd(), "dist");

const readXml = async (file) => readFile(join(distDir, file), "utf8");
const extractLocs = (xml) =>
  [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].trim());

if (!existsSync(distDir)) {
  throw new Error("dist directory not found. Run `npm run build` before submitting IndexNow URLs.");
}

const sitemapIndex = await readXml("sitemap-index.xml");
const sitemapUrls = extractLocs(sitemapIndex);
const sitemapFiles = sitemapUrls
  .map((url) => new URL(url).pathname.replace(/^\//, ""))
  .filter((path) => path.endsWith(".xml"));

const urlList = (
  await Promise.all(sitemapFiles.map(async (file) => extractLocs(await readXml(file))))
)
  .flat()
  .filter((url) => new URL(url).host === host);

if (urlList.length === 0) {
  throw new Error("No URLs found in generated sitemap files.");
}

const response = await fetch(endpoint, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host,
    key,
    keyLocation,
    urlList,
  }),
});

const body = await response.text();

if (!response.ok) {
  throw new Error(`IndexNow submission failed: ${response.status} ${body}`);
}

console.log(`Submitted ${urlList.length} URLs to IndexNow for ${host}.`);
