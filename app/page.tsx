"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [urlError, setUrlError] = useState("");
  const [copied, setCopied] = useState(false);
  const [processStatus, setProcessStatus] = useState("");

  // Валидация URL
  const validateUrl = (urlString: string): boolean => {
    if (!urlString.trim()) {
      setUrlError("");
      return false;
    }

    try {
      // Нормализуем URL: добавляем протокол, если его нет
      let normalizedUrl = urlString.trim();
      if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
        normalizedUrl = "https://" + normalizedUrl;
      }
      
      new URL(normalizedUrl);
      setUrlError("");
      return true;
    } catch {
      setUrlError("Неверный формат URL. Введите корректный адрес статьи.");
      return false;
    }
  };

  // Копирование результата в буфер обмена
  const copyToClipboard = async () => {
    if (!result) return;
    
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Ошибка копирования:", err);
    }
  };

  const handleClick = async (action: string) => {
    // Валидация URL перед отправкой
    if (!validateUrl(url)) {
      return;
    }

    setLoading(true);
    setResult("");
    setUrlError("");
    setProcessStatus("Загружаю статью…");

    try {
      // Парсим HTML страницы
      const parseResponse = await fetch("/api/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!parseResponse.ok) {
        const errorData = await parseResponse.json().catch(() => ({ error: parseResponse.statusText }));
        throw new Error(errorData.error || `Ошибка парсинга: ${parseResponse.statusText}`);
      }

      const parsedData = await parseResponse.json();
      
      // Проверяем, есть ли ошибка в ответе
      if (parsedData.error) {
        throw new Error(parsedData.error);
      }

      // Проверяем, что есть контент для обработки
      if (!parsedData.content || parsedData.content === "Не найдено") {
        throw new Error("Не удалось извлечь содержимое статьи. Попробуйте другую ссылку.");
      }

      // Обновляем статус процесса
      const actionNames: { [key: string]: string } = {
        "about": "Анализирую статью…",
        "thesis": "Создаю тезисы…",
        "telegram": "Формирую пост для Telegram…"
      };
      setProcessStatus(actionNames[action] || "Обрабатываю…");

      // Отправляем данные в API для генерации ответа через AI
      const generateResponse = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: parsedData.title,
          content: parsedData.content,
          action: action,
          url: url,
        }),
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json().catch(() => ({ error: generateResponse.statusText }));
        throw new Error(errorData.error || `Ошибка генерации: ${generateResponse.statusText}`);
      }

      const generateData = await generateResponse.json();
      
      // Проверяем, есть ли ошибка в ответе
      if (generateData.error) {
        throw new Error(generateData.error);
      }
      
      // Выводим результат генерации
      setResult(generateData.result || "Результат не получен");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка";
      setResult(`Ошибка: ${errorMessage}`);
    } finally {
      setLoading(false);
      setProcessStatus("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900 font-sans">
      <main className="min-h-screen w-full max-w-5xl mx-auto flex flex-col items-center justify-center py-12 px-4 gap-8">
        <div className="w-full bg-white dark:bg-zinc-950 shadow-xl rounded-2xl p-8 border border-zinc-200 dark:border-zinc-800">
          <h1 className="text-4xl font-bold text-center text-black dark:text-zinc-50 mb-8">Референт - переводчик с ИИ-обработкой</h1>
          <p className="text-lg font-semibold text-black dark:text-zinc-50 mb-4">Ссылка на статью:</p>
          <input
            type="text"
            placeholder="Введите URL статьи, например: https://example.com/article"
            value={url}
            onChange={e => {
              setUrl(e.target.value);
              validateUrl(e.target.value);
            }}
            onBlur={() => validateUrl(url)}
            className={`w-full p-4 mb-2 border-2 rounded-xl text-base bg-white dark:bg-zinc-900 text-black dark:text-zinc-100 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
              urlError 
                ? "border-red-500 focus:ring-red-500" 
                : "border-zinc-300 dark:border-zinc-700 focus:ring-blue-500"
            }`}
          />
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Укажите ссылку на англоязычную статью</p>
          {urlError && (
            <p className="text-red-500 text-sm mb-4">{urlError}</p>
          )}
          <p className="text-lg font-semibold text-black dark:text-zinc-50 mb-4">Выберите действие:</p>
          <div className="flex flex-col sm:flex-row gap-4 w-full mb-6">
            <button
              onClick={() => handleClick("about")}
              className="flex-1 py-3.5 bg-blue-600 text-white font-semibold rounded-xl transition-all hover:bg-blue-700 hover:shadow-lg disabled:bg-blue-300 disabled:cursor-not-allowed disabled:hover:shadow-none"
              disabled={!url || loading}
              title="Получить краткое объяснение содержания статьи (2-3 предложения)"
            >О чем статья?</button>
            <button
              onClick={() => handleClick("thesis")}
              className="flex-1 py-3.5 bg-green-600 text-white font-semibold rounded-xl transition-all hover:bg-green-700 hover:shadow-lg disabled:bg-green-300 disabled:cursor-not-allowed disabled:hover:shadow-none"
              disabled={!url || loading}
              title="Создать список основных тезисов статьи (5-7 пунктов)"
            >Тезисы</button>
            <button
              onClick={() => handleClick("telegram")}
              className="flex-1 py-3.5 bg-purple-600 text-white font-semibold rounded-xl transition-all hover:bg-purple-700 hover:shadow-lg disabled:bg-purple-300 disabled:cursor-not-allowed disabled:hover:shadow-none"
              disabled={!url || loading}
              title="Создать пост для Telegram с эмодзи и ссылкой на источник"
            >Пост для Telegram</button>
          </div>
          {processStatus && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">{processStatus}</p>
            </div>
          )}
          <div className="flex items-center justify-between mb-4">
            <p className="text-lg font-semibold text-black dark:text-zinc-50">Результат:</p>
            {result && !loading && (
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 text-sm bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-all flex items-center gap-2"
                title="Копировать результат"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Скопировано!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Копировать</span>
                  </>
                )}
              </button>
            )}
          </div>
          <div className="w-full min-h-[150px] p-6 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-black dark:text-zinc-100 relative">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 border-4 border-zinc-200 dark:border-zinc-700 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-600 dark:border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <span className="text-zinc-500 dark:text-zinc-400">Генерация...</span>
              </div>
            ) : (
              <div className="whitespace-pre-wrap font-normal text-left">{result || <span className="text-zinc-400 dark:text-zinc-600 font-normal block text-center">Результат появится здесь после выбора действия</span>}</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

