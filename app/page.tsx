"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClick = (action: string) => {
    setLoading(true);
    setResult("");
    // Здесь будет интеграция c AI, пока – только эмуляция
    setTimeout(() => {
      switch (action) {
        case "about":
          setResult("Пример: Эта статья о роли AI в образовании.");
          break;
        case "thesis":
          setResult("Пример: 1. AI помогает учиться. 2. Технологии изменяют образование. 3. Важно адаптироваться.");
          break;
        case "telegram":
          setResult("Пример: Интересная статья про AI в обучении! Вот основные идеи...");
          break;
      }
      setLoading(false);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900 font-sans">
      <main className="min-h-screen w-full max-w-5xl mx-auto flex flex-col items-center justify-center py-12 px-4 gap-8">
        <div className="w-full bg-white dark:bg-zinc-950 shadow-xl rounded-2xl p-8 border border-zinc-200 dark:border-zinc-800">
          <h1 className="text-4xl font-bold text-center text-black dark:text-zinc-50 mb-8">Референт - переводчик с ИИ-обработкой</h1>
          <p className="text-lg font-semibold text-black dark:text-zinc-50 mb-4">Ссылка на статью:</p>
          <input
            type="text"
            placeholder="Вставьте URL англоязычной статьи"
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="w-full p-4 mb-6 border-2 border-zinc-300 dark:border-zinc-700 rounded-xl text-base bg-white dark:bg-zinc-900 text-black dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <p className="text-lg font-semibold text-black dark:text-zinc-50 mb-4">Выберите действие:</p>
          <div className="flex flex-col sm:flex-row gap-4 w-full mb-6">
            <button
              onClick={() => handleClick("about")}
              className="flex-1 py-3.5 bg-blue-600 text-white font-semibold rounded-xl transition-all hover:bg-blue-700 hover:shadow-lg disabled:bg-blue-300 disabled:cursor-not-allowed disabled:hover:shadow-none"
              disabled={!url || loading}
            >О чем статья?</button>
            <button
              onClick={() => handleClick("thesis")}
              className="flex-1 py-3.5 bg-green-600 text-white font-semibold rounded-xl transition-all hover:bg-green-700 hover:shadow-lg disabled:bg-green-300 disabled:cursor-not-allowed disabled:hover:shadow-none"
              disabled={!url || loading}
            >Тезисы</button>
            <button
              onClick={() => handleClick("telegram")}
              className="flex-1 py-3.5 bg-purple-600 text-white font-semibold rounded-xl transition-all hover:bg-purple-700 hover:shadow-lg disabled:bg-purple-300 disabled:cursor-not-allowed disabled:hover:shadow-none"
              disabled={!url || loading}
            >Пост для Telegram</button>
          </div>
          <p className="text-lg font-semibold text-black dark:text-zinc-50 mb-4">Результат:</p>
          <div className="w-full min-h-[150px] p-6 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-black dark:text-zinc-100">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <span className="text-zinc-500 dark:text-zinc-400">Генерация...</span>
              </div>
            ) : (
              <div className="whitespace-pre-wrap font-normal flex items-center justify-center h-full text-center">{result || <span className="text-zinc-400 dark:text-zinc-600 font-normal">Результат появится здесь после выбора действия</span>}</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

