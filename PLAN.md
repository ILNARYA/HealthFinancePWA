# PLAN.md — «Здоровье и Медицинские Финансы 2-в-1» PWA

## Визуальная концепция (по референсам)
- **Цветовая палитра:** фиолетовый градиент (#7C3AED → #A855F7 → #C084FC → #E9D5FF), белые/серые карточки, тёмные акценты
- **Типографика:** крупные числовые показатели (font-bold), мелкий вспомогательный текст
- **Карточки биомаркеров:** значение + единица измерения + индикатор нормы (In-Range / Below / Above) с цветовой полосой
- **Графики:** Radar-chart (Score Breakdown: Calorie, BMI, BPM, Hydration, Sleep, Steps), линейные графики динамики, переключатели периодов (1d, 1w, 1m, 1y, All)
- **Общий health-score:** крупное число (напр. 88.2) + подпись

---

## Архитектура проекта

```
src/
├── main.tsx
├── App.tsx
├── index.css                 # Tailwind + custom vars
├── vite-env.d.ts
├── components/
│   ├── layout/
│   │   ├── BottomNav.tsx      # нижняя панель навигации (4 вкладки)
│   │   └── MobileShell.tsx    # обёртка 390px + safe-area
│   ├── dashboard/
│   │   ├── HealthIndex.tsx    # radar-chart + score
│   │   ├── BiomarkerCard.tsx  # карточка биомаркера с индикатором нормы
│   │   ├── SpendingSummary.tsx # карточка расходов за месяц
│   │   └── PeriodSelector.tsx # переключатель 1d/1w/1m/1y/All
│   ├── analyses/
│   │   ├── UploadArea.tsx     # drag-and-drop / кнопка загрузки
│   │   ├── AnalysisResult.tsx # результат разбора + дисклеймер
│   │   └── BiomarkerTable.tsx # таблица биомаркеров с отклонениями
│   ├── finances/
│   │   ├── ExpenseList.tsx    # список расходов
│   │   ├── ExpenseForm.tsx    # форма добавления
│   │   ├── CategoryChart.tsx  # круговая/столбчатая диаграмма по категориям
│   │   └── DoctorCard.tsx     # карточка врача с расходами
│   └── settings/
│       ├── GoogleConnect.tsx  # подключение Google Sheets / Drive
│       ├── ExportImport.tsx   # экспорт/импорт данных
│       └── ThemeToggle.tsx    # тёмная/светлая тема
├── pages/
│   ├── DashboardPage.tsx
│   ├── AnalysesPage.tsx
│   ├── FinancesPage.tsx
│   └── SettingsPage.tsx
├── data/
│   └── demo.ts               # демонстрационные данные
├── types/
│   └── index.ts              # TypeScript-типы
└── utils/
    └── analysisEngine.ts     # имитация ИИ-анализа биомаркеров
```

---

## Стек и зависимости

| Пакет | Назначение |
|-------|-----------|
| react, react-dom | UI-библиотека |
| vite | Сборщик |
| typescript | Типизация |
| tailwindcss | Стили |
| @tailwindcss/vite | Tailwind v4 Vite plugin |
| vite-plugin-pwa | PWA (manifest, service worker, offline) |
| recharts | Графики (radar, line, bar, pie) |
| lucide-react | Иконки |
| react-router-dom | Навигация между вкладками |

---

## Этапы реализации

### Этап 1: Инициализация проекта
- [x] Создать Vite + React + TypeScript проект
- [x] Установить зависимости (tailwind, recharts, lucide-react, vite-plugin-pwa, react-router-dom)
- [x] Настроить Tailwind CSS с кастомной палитрой
- [x] Настроить PWA (manifest.json, мета-теги, service-worker)
- [x] Настроить index.html (viewport, theme-color, apple-touch-icon)

### Этап 2: Каркас приложения
- [x] MobileShell (max-w-[390px], safe-area)
- [x] BottomNav (4 вкладки: Дашборд, Анализы, Финансы, Настройки)
- [x] React Router (маршрутизация между страницами)

### Этап 3: Дашборд
- [x] HealthIndex — radar-chart (Recharts RadarChart), общий score 88.2
- [x] BiomarkerCard — 3-4 карточки (eGFR, Creatinine, Glucose, Cholesterol) с индикатором нормы
- [x] SpendingSummary — карточка трат за месяц
- [x] PeriodSelector — кнопки 1d/1w/1m/1y/All

### Этап 4: Анализы и ИИ-разбор
- [x] UploadArea — загрузка фото/PDF
- [x] AnalysisResult — имитация разбора с задержкой
- [x] BiomarkerTable — таблица с цветовой маркировкой отклонений
- [x] Медицинский дисклеймер

### Этап 5: Финансы и врачи
- [x] ExpenseList — список расходов по категориям
- [x] ExpenseForm — форма добавления (модальное окно)
- [x] CategoryChart — диаграмма расходов
- [x] DoctorCard — карточки врачей

### Этап 6: Настройки
- [x] GoogleConnect — интерфейс подключения к Google Sheets / Drive
- [x] ExportImport — кнопки экспорта/импорта
- [x] ThemeToggle — переключатель темы (опционально)

### Этап 7: Демо-данные и тестирование
- [x] Наполнить demo.ts реалистичными данными
- [x] Запустить dev-сервер
- [x] Проверить все 4 экрана в мобильном разрешении 390×844
- [x] Скриншоты всех экранов

---

## Демо-данные (demo.ts)

### Биомаркеры
- eGFR: 4.2 mL/min (In-Range)
- Creatinine: 0.64 mg/dL (Below Range)
- Glucose: 5.1 mmol/L (In-Range)
- Cholesterol: 6.8 mmol/L (Above Range)

### Health Score
- Wellness: 85, Sleep: 90, Endurance: 78, Calorie: 72, BMI: 88, BPM: 82, Hydration: 76, Steps: 91
- Общий индекс: 88.2

### Финансовые записи (за ноябрь 2026)
- Терапевт — 3 500 ₽
- Анализ крови — 2 800 ₽
- Кардиолог — 5 000 ₽
- Лекарства — 1 200 ₽
- МРТ — 8 500 ₽
- Стоматолог — 7 000 ₽
- Итого: ~28 000 ₽
