export const BLOG_CATEGORIES = [
  "student-benefits",
  "ai-tools",
  "mac-iphone",
  "websites-seo",
  "software-files",
  "esim-overseas",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const CATEGORY_META: Record<
  BlogCategory,
  { label: string; description: string }
> = {
  "student-benefits": {
    label: "学生权益",
    description: "核对教育资格、申请学生计划，并处理认证、续期和毕业后的迁移。",
  },
  "ai-tools": {
    label: "AI 工具",
    description: "按官方支持范围配置 AI 产品，并定位设备、账号、语言与地区问题。",
  },
  "mac-iphone": {
    label: "Mac 与 iPhone",
    description: "解决 Apple 设备上的软件配置、网络定位和兼容性问题。",
  },
  "websites-seo": {
    label: "建站与 SEO",
    description: "从作品集、部署到索引检查，完成个人网站的发布与维护。",
  },
  "software-files": {
    label: "软件与文件",
    description: "整理、备份、迁移和恢复学习资料与日常文件。",
  },
  "esim-overseas": {
    label: "eSIM 与出境服务",
    description: "在购买前核对设备、地区、实名、漫游和短信限制。",
  },
};

export function getCategoryMeta(category: BlogCategory) {
  return CATEGORY_META[category];
}
