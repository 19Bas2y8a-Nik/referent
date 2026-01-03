"use client";

import { useState, useRef, useEffect } from "react";
import { Alert, AlertDescription, AlertIcon } from "./components/ui/alert";

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [urlError, setUrlError] = useState("");
  const [copied, setCopied] = useState(false);
  const [processStatus, setProcessStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

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

  // Функция для очистки всех состояний
  const handleClear = () => {
    setUrl("");
    setResult("");
    setUrlError("");
    setError(null);
    setProcessStatus("");
    setCopied(false);
    setLoading(false);
  };

  // Автоматическая прокрутка к результатам после успешной генерации
  useEffect(() => {
    if (result && !loading && resultRef.current) {
      // Небольшая задержка для завершения рендеринга
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ 
          behavior: "smooth", 
          block: "start" 
        });
      }, 100);
    }
  }, [result, loading]);

  // Функция для получения дружественного сообщения об ошибке
  const getFriendlyErrorMessage = (error: unknown, response?: Response): string => {
    // Если это ошибка сети или таймаут
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return "Не удалось загрузить статью по этой ссылке.";
    }

    // Если есть response, проверяем статус код
    if (response) {
      if (response.status === 404) {
        return "Не удалось загрузить статью по этой ссылке.";
      }
      if (response.status === 403) {
        return "Не удалось загрузить статью по этой ссылке.";
      }
      if (response.status >= 500) {
        return "Не удалось загрузить статью по этой ссылке.";
      }
      if (response.status === 408 || response.status === 504) {
        return "Не удалось загрузить статью по этой ссылке.";
      }
    }

    // Если это Error с сообщением, проверяем его содержимое
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      // Ошибки загрузки статьи
      if (errorMessage.includes("failed to fetch") || 
          errorMessage.includes("network") ||
          errorMessage.includes("timeout") ||
          errorMessage.includes("404") ||
          errorMessage.includes("500") ||
          errorMessage.includes("403") ||
          errorMessage.includes("парсинга")) {
        return "Не удалось загрузить статью по этой ссылке.";
      }

      // Ошибки извлечения контента
      if (errorMessage.includes("не удалось извлечь") || 
          errorMessage.includes("не найдено")) {
        return "Не удалось извлечь содержимое статьи. Попробуйте другую ссылку.";
      }

      // Ошибки генерации
      if (errorMessage.includes("генерации") || 
          errorMessage.includes("openrouter") ||
          errorMessage.includes("api key")) {
        return "Произошла ошибка при обработке статьи. Попробуйте позже.";
      }
    }

    // Общая ошибка
    return "Произошла ошибка. Попробуйте еще раз.";
  };

  const handleClick = async (action: string) => {
    // Валидация URL перед отправкой
    if (!validateUrl(url)) {
      return;
    }

    setLoading(true);
    setResult("");
    setUrlError("");
    setError(null);
    setProcessStatus("Загружаю статью…");

    try {
      // Парсим HTML страницы
      let parseResponse: Response;
      try {
        parseResponse = await fetch("/api/parse", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        });
      } catch (fetchError) {
        // Ошибка сети или таймаут
        const friendlyMessage = getFriendlyErrorMessage(fetchError);
        setError(friendlyMessage);
        setResult("");
        return;
      }

      if (!parseResponse.ok) {
        const friendlyMessage = getFriendlyErrorMessage(null, parseResponse);
        setError(friendlyMessage);
        setResult("");
        return;
      }

      const parsedData = await parseResponse.json();
      
      // Проверяем, есть ли ошибка в ответе
      if (parsedData.error) {
        const friendlyMessage = getFriendlyErrorMessage(new Error(parsedData.error), parseResponse);
        setError(friendlyMessage);
        setResult("");
        return;
      }

      // Проверяем, что есть контент для обработки
      if (!parsedData.content || parsedData.content === "Не найдено") {
        setError("Не удалось извлечь содержимое статьи. Попробуйте другую ссылку.");
        setResult("");
        return;
      }

      // Обновляем статус процесса
      const actionNames: { [key: string]: string } = {
        "about": "Анализирую статью…",
        "thesis": "Создаю тезисы…",
        "telegram": "Формирую пост для Telegram…"
      };
      setProcessStatus(actionNames[action] || "Обрабатываю…");

      // Отправляем данные в API для генерации ответа через AI
      let generateResponse: Response;
      try {
        generateResponse = await fetch("/api/generate", {
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
      } catch (fetchError) {
        // Ошибка сети при генерации
        const friendlyMessage = getFriendlyErrorMessage(fetchError);
        setError(friendlyMessage);
        setResult("");
        return;
      }

      if (!generateResponse.ok) {
        const friendlyMessage = getFriendlyErrorMessage(null, generateResponse);
        setError(friendlyMessage);
        setResult("");
        return;
      }

      const generateData = await generateResponse.json();
      
      // Проверяем, есть ли ошибка в ответе
      if (generateData.error) {
        const friendlyMessage = getFriendlyErrorMessage(new Error(generateData.error));
        setError(friendlyMessage);
        setResult("");
        return;
      }
      
      // Выводим результат генерации
      setResult(generateData.result || "Результат не получен");
      setError(null);
    } catch (error) {
      // Общая обработка неожиданных ошибок
      const friendlyMessage = getFriendlyErrorMessage(error);
      setError(friendlyMessage);
      setResult("");
    } finally {
      setLoading(false);
      setProcessStatus("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900 font-sans">
      <main className="min-h-screen w-full max-w-5xl mx-auto flex flex-col items-center justify-center py-6 sm:py-12 px-4 gap-4 sm:gap-8">
        <div className="w-full bg-white dark:bg-zinc-950 shadow-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-zinc-200 dark:border-zinc-800">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-black dark:text-zinc-50 mb-4 sm:mb-6 md:mb-8 break-words">Референт - переводчик с ИИ-обработкой</h1>
          <p className="text-base sm:text-lg font-semibold text-black dark:text-zinc-50 mb-3 sm:mb-4">Ссылка на статью:</p>
          <input
            type="text"
            placeholder="Введите URL статьи, например: https://example.com/article"
            value={url}
            onChange={e => {
              setUrl(e.target.value);
              validateUrl(e.target.value);
              // Очищаем ошибку при изменении URL
              if (error) {
                setError(null);
              }
            }}
            onBlur={() => validateUrl(url)}
            className={`w-full p-3 sm:p-4 mb-2 border-2 rounded-lg sm:rounded-xl text-sm sm:text-base bg-white dark:bg-zinc-900 text-black dark:text-zinc-100 focus:outline-none focus:ring-2 focus:border-transparent transition-all break-all ${
              urlError 
                ? "border-red-500 focus:ring-red-500" 
                : "border-zinc-300 dark:border-zinc-700 focus:ring-blue-500"
            }`}
          />
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-3 sm:mb-4 break-words">Укажите ссылку на англоязычную статью</p>
          {urlError && (
            <p className="text-red-500 text-xs sm:text-sm mb-3 sm:mb-4 break-words">{urlError}</p>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
            <p className="text-base sm:text-lg font-semibold text-black dark:text-zinc-50">Выберите действие:</p>
            <button
              onClick={handleClear}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-all flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto"
              title="Очистить все поля и результаты"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Очистить</span>
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full mb-4 sm:mb-6">
            <button
              onClick={() => handleClick("about")}
              className="flex-1 py-3 sm:py-3.5 bg-blue-600 text-white text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl transition-all hover:bg-blue-700 hover:shadow-lg disabled:bg-blue-300 disabled:cursor-not-allowed disabled:hover:shadow-none break-words"
              disabled={!url || loading}
              title="Получить краткое объяснение содержания статьи (2-3 предложения)"
            >О чем статья?</button>
            <button
              onClick={() => handleClick("thesis")}
              className="flex-1 py-3 sm:py-3.5 bg-green-600 text-white text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl transition-all hover:bg-green-700 hover:shadow-lg disabled:bg-green-300 disabled:cursor-not-allowed disabled:hover:shadow-none break-words"
              disabled={!url || loading}
              title="Создать список основных тезисов статьи (5-7 пунктов)"
            >Тезисы</button>
            <button
              onClick={() => handleClick("telegram")}
              className="flex-1 py-3 sm:py-3.5 bg-purple-600 text-white text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl transition-all hover:bg-purple-700 hover:shadow-lg disabled:bg-purple-300 disabled:cursor-not-allowed disabled:hover:shadow-none break-words"
              disabled={!url || loading}
              title="Создать пост для Telegram с эмодзи и ссылкой на источник"
            >Пост для Telegram</button>
          </div>
          {processStatus && (
            <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 break-words">{processStatus}</p>
            </div>
          )}
          {error && (
            <Alert variant="destructive" className="mb-3 sm:mb-4">
              <AlertDescription className="flex items-start gap-2">
                <div className="mt-0.5 flex-shrink-0">
                  <AlertIcon variant="destructive" />
                </div>
                <span className="text-xs sm:text-sm break-words">{error}</span>
              </AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
            <p className="text-base sm:text-lg font-semibold text-black dark:text-zinc-50">Результат:</p>
            {result && !loading && (
              <button
                onClick={copyToClipboard}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-all flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto"
                title="Копировать результат"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Скопировано!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Копировать</span>
                  </>
                )}
              </button>
            )}
          </div>
          <div 
            ref={resultRef}
            className="w-full min-h-[150px] p-4 sm:p-6 border-2 border-zinc-200 dark:border-zinc-700 rounded-lg sm:rounded-xl bg-zinc-50 dark:bg-zinc-900 text-black dark:text-zinc-100 relative overflow-wrap break-words"
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 border-4 border-zinc-200 dark:border-zinc-700 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-600 dark:border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <span className="text-zinc-500 dark:text-zinc-400">Генерация...</span>
              </div>
            ) : (
              <div className="whitespace-pre-wrap font-normal text-left text-sm sm:text-base break-words overflow-wrap">{result || <span className="text-zinc-400 dark:text-zinc-600 font-normal block text-center text-xs sm:text-sm">Результат появится здесь после выбора действия</span>}</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

