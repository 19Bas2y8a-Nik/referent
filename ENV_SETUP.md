# Настройка переменных окружения

## Обзор
Этот документ описывает настройку переменных окружения для работы приложения "Референт".

---

## Быстрый старт

1. Скопируйте файл `.env.example` в `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Откройте `.env.local` и заполните необходимые переменные

3. Перезапустите dev сервер (если он запущен)

---

## Переменные окружения

### OPENROUTER_API_KEY (обязательная)

**Описание**: API ключ для доступа к OpenRouter API, который используется для генерации контента через AI.

**Как получить**:
1. Зарегистрируйтесь на [OpenRouter.ai](https://openrouter.ai/)
2. Перейдите в раздел "Keys" в вашем профиле
3. Создайте новый API ключ
4. Скопируйте ключ

**Формат**: 
```
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Где используется**:
- `app/api/generate/route.ts` - для авторизации запросов к OpenRouter API

**Безопасность**:
- ⚠️ **НИКОГДА** не коммитьте `.env.local` в git
- Файл `.env.local` уже добавлен в `.gitignore`
- Не делитесь ключом публично

---

### NEXT_PUBLIC_APP_URL (опциональная)

**Описание**: URL вашего приложения, используется в HTTP-Referer заголовке для OpenRouter API.

**Значение по умолчанию**: `http://localhost:3000`

**Примеры**:
- Для локальной разработки: `http://localhost:3000`
- Для production: `https://yourdomain.com`
- Для Vercel: `https://your-app.vercel.app`

**Где используется**:
- `app/api/generate/route.ts` - в заголовке `HTTP-Referer` при запросах к OpenRouter

**Примечание**: 
- Переменные с префиксом `NEXT_PUBLIC_` доступны в браузере
- Для серверных переменных используйте префикс без `NEXT_PUBLIC_`

---

## Создание .env.local

### Windows (PowerShell)
```powershell
Copy-Item .env.example .env.local
```

### Windows (CMD)
```cmd
copy .env.example .env.local
```

### Linux / macOS
```bash
cp .env.example .env.local
```

---

## Проверка настройки

После настройки переменных окружения:

1. Убедитесь, что файл `.env.local` существует в корне проекта
2. Проверьте, что переменные заполнены (без `your_..._here`)
3. Перезапустите dev сервер:
   ```bash
   npm run dev
   # или
   pnpm dev
   ```

4. Попробуйте использовать приложение - если `OPENROUTER_API_KEY` не настроен, вы увидите ошибку:
   ```
   OPENROUTER_API_KEY is not configured. Please check your .env.local file.
   ```

---

## Структура файла .env.local

```env
# Обязательная переменная
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Опциональная переменная (можно не указывать)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Troubleshooting

### Ошибка: "OPENROUTER_API_KEY is not configured"

**Причины**:
- Файл `.env.local` не существует
- Переменная `OPENROUTER_API_KEY` не заполнена
- Dev сервер не был перезапущен после создания `.env.local`

**Решение**:
1. Убедитесь, что файл `.env.local` существует в корне проекта
2. Проверьте, что переменная заполнена (не содержит `your_openrouter_api_key_here`)
3. Перезапустите dev сервер

### Переменные не загружаются

**Причины**:
- Файл находится не в корне проекта
- Неправильное имя файла (должно быть `.env.local`, не `.env.local.txt`)
- Dev сервер не был перезапущен

**Решение**:
1. Убедитесь, что файл находится в корне проекта (рядом с `package.json`)
2. Проверьте имя файла (должно начинаться с точки)
3. Перезапустите dev сервер

---

## Безопасность

### ✅ Что делать:
- Используйте `.env.local` для локальной разработки
- Добавляйте `.env.local` в `.gitignore` (уже сделано)
- Используйте разные ключи для development и production
- Регулярно ротируйте API ключи

### ❌ Чего НЕ делать:
- НЕ коммитьте `.env.local` в git
- НЕ делитесь ключами публично
- НЕ используйте production ключи в development
- НЕ храните ключи в коде

---

## Production настройка

Для production (Vercel, Netlify и т.д.):

1. Добавьте переменные окружения в настройках вашего хостинга
2. Для Vercel: Settings → Environment Variables
3. Для Netlify: Site settings → Environment variables

**Важно**: В production используйте реальный URL в `NEXT_PUBLIC_APP_URL`

---

## Дополнительная информация

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [OpenRouter Documentation](https://openrouter.ai/docs)
- [OpenRouter API Keys](https://openrouter.ai/keys)

