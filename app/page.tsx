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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-2xl flex-col items-center justify-center py-20 px-4 bg-white dark:bg-black shadow-md rounded-xl gap-8">
        <h1 className="text-3xl font-bold text-center text-black dark:text-zinc-50 mb-6">AI-Референт</h1>
        <input
          type="text"
          placeholder="Вставьте URL англоязычной статьи"
          value={url}
          onChange={e => setUrl(e.target.value)}
          className="w-full p-3 mb-4 border border-zinc-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div className="flex flex-col sm:flex-row gap-4 w-full mb-4">
          <button
            onClick={() => handleClick("about")}
            className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg transition-colors hover:bg-blue-700 disabled:bg-blue-300"
            disabled={!url || loading}
          >О чем статья?</button>
          <button
            onClick={() => handleClick("thesis")}
            className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg transition-colors hover:bg-green-700 disabled:bg-green-300"
            disabled={!url || loading}
          >Тезисы</button>
          <button
            onClick={() => handleClick("telegram")}
            className="flex-1 py-3 bg-purple-600 text-white font-semibold rounded-lg transition-colors hover:bg-purple-700 disabled:bg-purple-300"
            disabled={!url || loading}
          >Пост для Telegram</button>
        </div>
        <div className="w-full min-h-[100px] p-4 border rounded-lg bg-zinc-100 dark:bg-zinc-900 text-black dark:text-zinc-100">
          {loading ? <span>Генерация...</span> : result }
        </div>
      </main>
    </div>
  );
}

