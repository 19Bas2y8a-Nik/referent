import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

// Указываем runtime для Node.js (требуется для cheerio)
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    let { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Нормализуем URL: добавляем протокол, если его нет
    url = url.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    // Валидация URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Получаем HTML страницы с полными заголовками браузера
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      const statusText = response.statusText || "Unknown error";
      let errorMessage = `Failed to fetch URL: ${statusText} (${response.status})`;
      
      if (response.status === 403) {
        errorMessage += ". Сайт блокирует запросы. Возможно, требуется авторизация или сайт защищен от парсинга.";
      } else if (response.status === 404) {
        errorMessage += ". Страница не найдена.";
      } else if (response.status >= 500) {
        errorMessage += ". Ошибка на стороне сервера.";
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const html = await response.text();
    
    // Используем cheerio для парсинга HTML
    const $ = cheerio.load(html);

    // Извлекаем заголовок
    let title = "";
    const titleSelectors = [
      "h1",
      "title",
      'meta[property="og:title"]',
      'meta[name="twitter:title"]',
      ".title",
      ".post-title",
      ".article-title",
      "[class*='title']",
    ];

    for (const selector of titleSelectors) {
      const element = $(selector).first();
      if (selector.startsWith("meta")) {
        title = element.attr("content") || "";
      } else {
        title = element.text().trim();
      }
      if (title) break;
    }

    // Извлекаем дату
    let date = "";
    const dateSelectors = [
      'time[datetime]',
      'time',
      '[class*="date"]',
      '[class*="published"]',
      '[class*="time"]',
      'meta[property="article:published_time"]',
      'meta[name="date"]',
      'meta[name="publishdate"]',
    ];

    for (const selector of dateSelectors) {
      const element = $(selector).first();
      if (selector.startsWith("meta")) {
        date = element.attr("content") || "";
      } else if (selector.includes("time[datetime]")) {
        date = element.attr("datetime") || element.text().trim();
      } else {
        date = element.text().trim();
      }
      if (date) break;
    }

    // Извлекаем основной контент
    let content = "";
    const contentSelectors = [
      "article",
      ".post",
      ".content",
      ".article-content",
      ".post-content",
      ".entry-content",
      "[class*='article']",
      "[class*='content']",
      "main",
    ];

    for (const selector of contentSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        // Удаляем скрипты, стили и другие ненужные элементы
        element.find("script, style, nav, header, footer, aside, .ad, .advertisement").remove();
        content = element.text().trim();
        if (content.length > 100) break; // Если контент достаточно длинный, используем его
      }
    }

    // Если контент не найден, пробуем body
    if (!content || content.length < 100) {
      const body = $("body");
      body.find("script, style, nav, header, footer, aside, .ad, .advertisement").remove();
      content = body.text().trim();
    }

    // Очищаем контент от лишних пробелов и переносов строк
    content = content.replace(/\s+/g, " ").trim();

    return NextResponse.json({
      date: date || "Не найдено",
      title: title || "Не найдено",
      content: content || "Не найдено",
    });
  } catch (error) {
    console.error("Error parsing HTML:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorName = error instanceof Error ? error.name : "Error";
    
    // Логируем детали ошибки для отладки
    console.error("Error name:", errorName);
    console.error("Error message:", errorMessage);
    if (errorStack) {
      console.error("Error stack:", errorStack);
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        errorName: errorName,
        details: process.env.NODE_ENV === "development" ? errorStack : undefined
      },
      { status: 500 }
    );
  }
}

