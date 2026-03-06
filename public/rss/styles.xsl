<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title><xsl:value-of select="/rss/channel/title"/> - Web Feed</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
        <style type="text/css">
          :root {
            --bg-color: #fafafa;
            --text-color: #18181b;
            --muted: #a1a1aa;
            --card-bg: rgba(255,255,255,0.7);
            --card-border: rgba(0,0,0,0.05);
            --glass-shadow: 0 8px 32px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.6);
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --bg-color: #09090b;
              --text-color: #f4f4f5;
              --muted: #a1a1aa;
              --card-bg: rgba(24,24,27,0.5);
              --card-border: rgba(255,255,255,0.05);
              --glass-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
            }
          }
          body {
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: var(--text-color);
            background-color: var(--bg-color);
            line-height: 1.6;
            margin: 0;
            padding: 2rem 1rem;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 680px;
            margin: 0 auto;
          }
          .header {
            margin-bottom: 3rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid var(--card-border);
          }
          h1 {
            font-size: 2rem;
            font-weight: 700;
            margin: 0 0 0.5rem 0;
            letter-spacing: -0.025em;
          }
          .description {
            color: var(--muted);
            font-size: 1rem;
            margin: 0 0 1.5rem 0;
          }
          .notice {
            background-color: var(--card-bg);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid var(--card-border);
            padding: 1rem 1.5rem;
            border-radius: 16px;
            font-size: 0.875rem;
            color: var(--muted);
            box-shadow: var(--glass-shadow);
            margin-bottom: 2rem;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .notice svg {
            width: 20px;
            height: 20px;
            color: #10b981;
            flex-shrink: 0;
          }
          a {
            color: var(--text-color);
            text-decoration: none;
            transition: opacity 0.2s ease;
          }
          a:hover {
            opacity: 0.7;
          }
          .post {
            margin-bottom: 2rem;
            padding: 1.5rem;
            background-color: var(--card-bg);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid var(--card-border);
            border-radius: 20px;
            box-shadow: var(--glass-shadow);
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          .post:hover {
            transform: translateY(-2px);
          }
          .post-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 0 0 0.5rem 0;
            line-height: 1.4;
          }
          .post-meta {
            font-size: 0.875rem;
            color: var(--muted);
            margin-bottom: 1rem;
          }
          .post-desc {
            font-size: 1rem;
            color: var(--text-color);
            opacity: 0.8;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="notice">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>
            <div>
              <strong>这是一个 RSS 订阅源。</strong><br/>你可以将此网址添加到 RSS 阅读器（如 NetNewsWire, Reeder 等）以获取最新文章更新。
            </div>
          </div>
          
          <div class="header">
            <h1><xsl:value-of select="/rss/channel/title"/></h1>
            <p class="description"><xsl:value-of select="/rss/channel/description"/></p>
            <a href="{/rss/channel/link}">← 访问博客首页</a>
          </div>

          <div class="posts">
            <xsl:for-each select="/rss/channel/item">
              <div class="post">
                <a href="{link}" target="_blank">
                  <h2 class="post-title"><xsl:value-of select="title"/></h2>
                </a>
                <div class="post-meta">
                  <xsl:value-of select="substring(pubDate, 5, 12)"/>
                </div>
                <p class="post-desc"><xsl:value-of select="description"/></p>
              </div>
            </xsl:for-each>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
