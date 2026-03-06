---
title: "从微信读书 API 抓取高清书籍封面"
description: "最近在做一些书籍的整理，发现封面很难找到高清的，发现微信阅读的封面还不错，还能自己改参数，之前学过一点Python 和 Rust, 想试试这几种语言，于是用它们做了一个自动化脚本。"
pubDate: 2026-01-26
author: "荣十一"
tags: [ "Python","NodeJs","Rust","折腾"]
---


## 🚀 核心逻辑
1. **API 请求**：访问 `https://weread.qq.com/api/store/search?keyword=书名`。
2. **数据解析**：定位 `results[0] -> books[0] -> bookInfo -> cover`。
3. **高清处理**：将封面 URL 中的 `/s_` 替换为 `/t9_` 获取高清大图。
4. **本地保存**：以书名命名并保存为 `.jpg`。

## 🐍 1. Python 实现（最简易）
Python 的代码最接近自然语言，适合快速原型开发。

**环境准备：** `pip install requests`

```python
import requests

def download_weread_cover(keyword):
    api_url = f"https://weread.qq.com/api/store/search?keyword={keyword}"
    
    try:
        response = requests.get(api_url)
        data = response.json()
        
        # 修正后的路径：results[0] -> books[0]
        # 使用 .get() 增加容错性
        results = data.get("results", [])
        if results and "books" in results[0]:
            books = results[0]["books"]
            
            # 3. 遍历书籍，找到阅读人数最多的书籍
            max_reading_count = 0
            best_book = None
            
            for book in books:
                book_info = book.get("bookInfo", {})
                title = book_info.get("title", "")
                
                if keyword in title:
                    reading_count = book.get("readingCount", 0)
                    if reading_count > max_reading_count:
                        max_reading_count = reading_count
                        best_book = book_info
            
            if best_book is None:
                # 如果没有找到包含关键词的书籍，使用第一本
                best_book = books[0]["bookInfo"]
                max_reading_count = books[0].get("readingCount", 0)
            
            print(f"[Python] 选择了阅读人数最多的书籍，阅读人数: {max_reading_count}")
            
            cover_url = best_book.get("cover")
            if cover_url:
                # 将 s_yuewen 替换为 t9_yuewen 以获取高清原图
                hd_url = cover_url.replace("/s_", "/t9_")
                img_data = requests.get(hd_url).content
                with open(f"{keyword}.jpg", "wb") as f:
                    f.write(img_data)
                print(f"[Python] 成功！已保存: {keyword}.jpg")
        else:
            print("未找到书籍数据")
            
    except Exception as e:
        print(f"发生错误: {e}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        book_name = sys.argv[1]
        download_weread_cover(book_name)
    else:
        print("请提供书名作为参数，如：python main.py 书名")
```

## 🟢 2. Node.js 实现（异步 I/O）
Node.js 使用可选链（Optional Chaining）处理深层 JSON 非常优雅。

**环境准备：** `npm install axios`

```javascript
const axios = require('axios');
const fs = require('fs');

async function download(keyword) {
    const url = `https://weread.qq.com/api/store/search?keyword=${encodeURIComponent(keyword)}`;
    
    try {
        const { data } = await axios.get(url);
        const books = data.results?.[0]?.books;

        if (!books || books.length === 0) {
            console.log("未找到相关书籍");
            return;
        }

        // 3. 遍历书籍，找到阅读人数最多的书籍
        let maxReadingCount = 0;
        let bestBook = null;

        for (const book of books) {
            const bookInfo = book.bookInfo;
            const title = bookInfo?.title || "";
            
            if (title.includes(keyword)) {
                const readingCount = book.readingCount || 0;
                if (readingCount > maxReadingCount) {
                    maxReadingCount = readingCount;
                    bestBook = bookInfo;
                }
            }
        }

        // 如果没有找到包含关键词的书籍，使用第一本
        if (!bestBook) {
            bestBook = books[0].bookInfo;
            maxReadingCount = books[0].readingCount || 0;
        }

        console.log(`[Node.js] 选择了阅读人数最多的书籍，阅读人数: ${maxReadingCount}`);

        if (!bestBook || !bestBook.cover) {
            console.log("未找到封面");
            return;
        }

        // 核心逻辑：替换为高清地址 t9_
        const hdCoverUrl = bestBook.cover.replace("/s_", "/t9_");

        const response = await axios({
            url: hdCoverUrl,
            method: 'GET',
            responseType: 'stream'
        });

        const fileName = `${keyword}.jpg`;
        const writer = fs.createWriteStream(fileName);
        response.data.pipe(writer);

        writer.on('finish', () => console.log(`[Node.js] 高清封面保存成功: ${fileName}`));
    } catch (err) {
        console.error(`[Node.js] 出错: ${err.message}`);
    }
}

// 获取命令行参数：node index.js 书名
const args = process.argv.slice(2);
if (args.length > 0) {
    download(args[0]);
} else {
    console.log("用法: node index.js <书名>");
}
```

## 🦀 3. Rust 实现（高性能与安全）
Rust 提供了极高的运行效率和类型安全，适合对性能有追求的场景。

项目配置 (Cargo.toml):

```Ini, TOML
[dependencies]
reqwest = { version = "0.11", features = ["json", "blocking"] }
serde_json = "1.0"
```

核心代码 (src/main.rs):

```rust
use std::env;
use std::fs::File;
use std::io::copy;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // 1. 获取命令行参数
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        println!("用法: cargo run <书名>");
        return Ok(());
    }
    let keyword = &args[1];

    let api_url = format!("https://weread.qq.com/api/store/search?keyword={}", keyword);

    // 2. 请求 API
    let resp = reqwest::blocking::get(api_url)?.json::<serde_json::Value>()?;
   
    // 3. 遍历书籍，找到阅读人数最多的书籍

    let mut max_reading_count = 0;
    let mut best_book_index = 0;

    for (i, book) in resp["results"][0]["books"].as_array().unwrap().iter().enumerate() {
        let book_info = &book["bookInfo"];
        if let Some(title) = book_info["title"].as_str() {
            if title.contains(keyword) {
                if let Some(reading_count) = book["readingCount"].as_u64() {
                    if reading_count > max_reading_count {
                        max_reading_count = reading_count;
                        best_book_index = i;
                    }
                }
            }
        }
    }
    
    println!("[Rust] 选择了阅读人数最多的书籍，阅读人数: {}", max_reading_count);
    // 4. 提取并替换 URL
    if let Some(cover_url) = resp["results"][0]["books"][best_book_index]["bookInfo"]["cover"].as_str() {
        // 核心逻辑：字符串替换
        let hd_url = cover_url.replace("/s_", "/t9_");
        
        // 5. 下载高清图
        let mut img_resp = reqwest::blocking::get(hd_url)?;
        let file_name = format!("{}.jpg", keyword);
        let mut dest = File::create(&file_name)?;
        
        copy(&mut img_resp, &mut dest)?;
        println!("[Rust] 高清封面保存成功: {}", file_name);
    } else {
        println!("[Rust] 未找到封面地址");
    }

    Ok(())
}
```