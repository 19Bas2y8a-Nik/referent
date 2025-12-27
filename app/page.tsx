"use client";
import { useState, useRef } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = (action: string) => {
    setLoading(true);
    setResult("");
    setTimeout(() => {
      switch (action) {
        case "about":
          setResult("Пример: Эта статья о роли искусственного интеллекта в образовании.");
          break;
        case "thesis":
          setResult("Пример: 1. ИИ помогает учиться быстрее. 2. Технологии меняют подходы к обучению. 3. Важно адаптироваться к новым реалиям.");
          break;
        case "telegram":
          setResult("Пример: Интересная статья про ИИ и обучение! Кратко и по делу👇");
          break;
      }
      setLoading(false);
    }, 900);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-blue-100 dark:from-black dark:to-zinc-900 font-sans p-2">
      <div className="w-full max-w-2xl bg-white/90 dark:bg-zinc-900/80 shadow-2xl rounded-2xl p-6 sm:p-10 flex flex-col gap-7">
        <div className="w-full flex justify-center pt-4 pb-7">
          <span className="text-xl sm:text-2xl font-extrabold text-blue-700 dark:text-zinc-100 tracking-wide select-none uppercase">
            Референт - переводчик с ИИ-обработкой
          </span>
        </div>
        <label htmlFor="url" className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Ссылка на статью</label>
        <div className="flex items-center relative">
          <input
            id="url"
            ref={inputRef}
            type="url"
            placeholder="Вставьте URL англоязычной статьи..."
            value={url}
            autoFocus
            onChange={e => setUrl(e.target.value)}
            className="peer w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-2 border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-300 font-medium text-base transition-all"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 8.25V6a3.75 3.75 0 10-7.5 0v2.25m11.25 4.5v2.25a3.75 3.75 0 01-3.75 3.75H8.25A3.75 3.75 0 014.5 15V12.75m11.25-6v2.25m0 7.5H8.25m7.5 0V8.25A3.75 3.75 0 008.25 8.25v7.5" /></svg>
          </span>
        </div>
        <div className="w-full text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-1 text-left pl-1">Выберите действие:</div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => handleClick("about")}
            className="flex-1 py-3 rounded-xl font-bold text-base bg-blue-600 hover:bg-blue-700 transition disabled:bg-blue-300 text-white shadow-sm"
            disabled={!url || loading}
          >О чем статья?</button>
          <button
            onClick={() => handleClick("thesis")}
            className="flex-1 py-3 rounded-xl font-bold text-base bg-green-600 hover:bg-green-700 transition disabled:bg-green-300 text-white shadow-sm"
            disabled={!url || loading}
          >Тезисы</button>
          <button
            onClick={() => handleClick("telegram")}
            className="flex-1 py-3 rounded-xl font-bold text-base bg-purple-600 hover:bg-purple-700 transition disabled:bg-purple-300 text-white shadow-sm"
            disabled={!url || loading}
          >Пост для Telegram</button>
        </div>
        <div className="w-full text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-1 text-left pl-1">Результат:</div>
        <div className="min-h-[110px] px-5 py-4 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 text-lg font-normal whitespace-pre-line transition-all">
          {loading 
            ? <span className="opacity-70">Генерация...</span>
            : result
              ? result
              : <span className="text-base font-normal text-zinc-500 dark:text-zinc-400">Результат появится здесь после выбора действия</span>
          }
        </div>
      </div>
    </div>
  );
}

