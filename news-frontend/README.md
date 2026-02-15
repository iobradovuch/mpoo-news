# Чернівецька міська організація Профспілки працівників освіти і науки України - Frontend

Фронтенд новинного порталу. React + Vite + TypeScript + Tailwind CSS.

## Технології

- **React 18** + TypeScript
- **Vite** - збірка
- **Tailwind CSS** - стилізація
- **React Router 7** - маршрутизація
- **Axios** - HTTP запити
- **Lucide React** - іконки
- **Framer Motion** - анімації

## Структура

```
src/
├── components/
│   ├── layout/      # Layout, AdminLayout
│   └── auth/        # ProtectedRoute
├── pages/
│   ├── admin/       # Адмін-панель (10 сторінок)
│   ├── HomePage     # Головна
│   ├── NewsPage     # Новини
│   ├── AboutPage    # Про нас
│   └── ...          # Інші сторінки
├── services/        # API сервіс
├── contexts/        # AuthContext
├── hooks/           # useDebounce
├── types/           # TypeScript типи
└── lib/             # Утиліти
```

## Запуск

```bash
npm install
npm run dev      # Розробка (http://localhost:3000)
npm run build    # Продакшен збірка
```

## Docker

```bash
docker compose up --build
```
