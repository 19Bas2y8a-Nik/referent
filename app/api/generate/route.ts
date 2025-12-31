import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, action } = body;
    
    console.log("Generate request received:", { 
      hasTitle: !!title, 
      hasContent: !!content, 
      contentLength: content?.length,
      action 
    });

    if (!title || !content || !action) {
      return NextResponse.json(
        { error: "Title, content, and action are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Выбираем модель и параметры в зависимости от действия
    let model = "openai/gpt-4o-mini";
    let maxTokens = 1000;
    let maxContentLength = 12000;
    
    if (action === "translate") {
      model = "deepseek/deepseek-chat";
      maxTokens = 4000; // Для перевода нужно больше токенов
      maxContentLength = 16000; // Для перевода можно передать больше контента
    }

    // Ограничиваем длину контента для API
    const truncatedContent = content.length > maxContentLength 
      ? content.substring(0, maxContentLength) + "..."
      : content;

    // Определяем промпт в зависимости от действия (используем уже обрезанный контент)
    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "about":
        systemPrompt = "Ты помощник, который кратко объясняет содержание статей. Отвечай на русском языке в дружелюбном тоне.";
        userPrompt = `О чем эта статья?\n\nЗаголовок: ${title}\n\nСодержание:\n${truncatedContent}\n\nДай краткое объяснение (2-3 предложения) о чем эта статья.`;
        break;
      case "thesis":
        systemPrompt = "Ты помощник, который создает тезисы из статей. Отвечай на русском языке. Форматируй тезисы в виде списка с четкими пунктами.";
        userPrompt = `Создай тезисы на основе этой статьи:\n\nЗаголовок: ${title}\n\nСодержание:\n${truncatedContent}\n\nСоздай список основных тезисов (5-7 пунктов).`;
        break;
      case "telegram":
        systemPrompt = "Ты помощник, который создает посты для Telegram на основе статей. Отвечай на русском языке. Используй эмодзи, короткие абзацы и привлекательный стиль для социальных сетей.";
        userPrompt = `Создай пост для Telegram на основе этой статьи:\n\nЗаголовок: ${title}\n\nСодержание:\n${truncatedContent}\n\nСоздай интересный пост для Telegram с эмодзи, который кратко рассказывает о статье и привлекает внимание.`;
        break;
      case "translate":
        systemPrompt = "Ты профессиональный переводчик. Переводи статьи с английского языка на русский язык. Сохраняй структуру текста, форматирование и смысл оригинала. Переводи точно и естественно.";
        userPrompt = `Переведи эту статью на русский язык:\n\nЗаголовок: ${title}\n\nСодержание:\n${truncatedContent}\n\nПереведи весь текст статьи, включая заголовок, на русский язык. Сохрани структуру и форматирование.`;
        break;
      default:
        return NextResponse.json(
          { error: "Invalid action. Use 'about', 'thesis', 'telegram', or 'translate'" },
          { status: 400 }
        );
    }

    // Вызываем OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Referent App",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenRouter API error:", errorData);
      return NextResponse.json(
        { error: `OpenRouter API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return NextResponse.json(
        { error: "Invalid response from OpenRouter API" },
        { status: 500 }
      );
    }

    const generatedText = data.choices[0].message.content;

    return NextResponse.json({
      result: generatedText,
    });
  } catch (error) {
    console.error("Error generating text:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorName = error instanceof Error ? error.name : "Error";
    
    console.error("Error details:", {
      name: errorName,
      message: errorMessage,
      stack: errorStack
    });
    
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

