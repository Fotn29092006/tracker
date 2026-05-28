# Трекер

Личный трекер на каждый день: **задачи, финансы, тренировки, заметки, профиль**. PWA + десктоп.

## Стек
- **Next.js 16** (App Router) · React 19 · TypeScript
- **Supabase** — Postgres + Auth + Storage (RLS owner-only)
- **Tailwind v4** · Framer Motion · lucide-react · Geist
- **TanStack Query** + IndexedDB persist — offline-first
- PWA (manifest + service worker), без Capacitor

## Модули
| Раздел | Что умеет |
|---|---|
| **Задачи** | Задачи со сроком и напоминанием (в приложении); просроченные подсвечиваются. Цели — набор шагов в несколько заходов, с прогрессом. |
| **Финансы** | Свои счета (Kaspi, Halyk…) с балансом. Доход/расход привязан к счёту. Долги с направлением (мне должны / я должен). Копилки. |
| **Тренировки** | Недельный план по дням. Кнопка «Готово» засчитывает по плановым подходам. Карта мышц считает нагрузку. Вес + фото прогресса. |
| **Заметки** | Быстрые заметки, закрепление. |
| **Профиль** | Имя, рост, история веса, фото прогресса, тема. |

## Запуск
```bash
npm install
cp .env.example .env.local   # вписать NEXT_PUBLIC_SUPABASE_URL и ANON_KEY
npm run dev
```

## База данных
Применить миграции из `supabase/migrations/` к проекту Supabase:
- `0001_init.sql` — схема, RLS, авто-создание профиля, bucket `progress`
- `0002_seed_exercises.sql` — каталог упражнений (~58)

## Сборка
```bash
npm run build
```
