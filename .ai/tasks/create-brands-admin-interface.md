# Создание интерфейса администрирования брендов

## Описание
Создание полнофункциональной админ-панели для управления брендами с использованием HeroUI React компонентов.

## Список задач

- [x] Установить и настроить HeroUI библиотеку
- [x] Добавить HeroUIProvider в приложение
- [x] Настроить Tailwind для работы с HeroUI
- [x] Создать контроллер Admin/BrandController с полным CRUD функционалом
- [x] Добавить маршруты для админки брендов
- [x] Создать страницу списка брендов (Admin/Brands/Index.tsx) с HeroUI Table
- [x] Создать страницу создания бренда (Admin/Brands/Create.tsx) с HeroUI формами
- [x] Создать страницу редактирования бренда (Admin/Brands/Edit.tsx) с HeroUI формами
- [x] Добавить навигацию к админке в AuthenticatedLayout

## Реализованные возможности

### Backend
- **Контроллер**: `app/Http/Controllers/Admin/BrandController.php`
  - `index()` - список всех брендов с данными владельца
  - `create()` - форма создания бренда
  - `store()` - сохранение нового бренда с валидацией
  - `edit()` - форма редактирования бренда
  - `update()` - обновление бренда с валидацией
  - `destroy()` - удаление бренда

- **Маршруты**: Префикс `admin/brands`
  - GET `/admin/brands` - список брендов
  - GET `/admin/brands/create` - форма создания
  - POST `/admin/brands` - создание бренда
  - GET `/admin/brands/{brand}/edit` - форма редактирования
  - PUT/PATCH `/admin/brands/{brand}` - обновление бренда
  - DELETE `/admin/brands/{brand}` - удаление бренда

### Frontend

#### Страница списка брендов (`resources/js/Pages/Admin/Brands/Index.tsx`)
- HeroUI Table с колонками:
  - Название бренда
  - Slug
  - Владелец (имя пользователя)
  - Статус (активный/неактивный) с цветными Chip компонентами
  - Дата создания
  - Действия (Edit/Delete кнопки)
- Кнопка создания нового бренда
- Подтверждение при удалении

#### Страница создания бренда (`resources/js/Pages/Admin/Brands/Create.tsx`)
- HeroUI компоненты форм:
  - Input для названия бренда (обязательное поле)
  - Input для slug (автогенерация если пусто)
  - Textarea для описания
  - Input для URL логотипа
  - Switch для активации/деактивации бренда
- Валидация с отображением ошибок
- Кнопки Submit и Cancel

#### Страница редактирования (`resources/js/Pages/Admin/Brands/Edit.tsx`)
- Те же компоненты что и в Create
- Предзаполнение данными существующего бренда
- PUT метод для обновления

#### Навигация
- Добавлена ссылка "Brands" в основную навигацию
- Поддержка desktop и mobile меню
- Активное состояние для всех маршрутов `admin.brands.*`

## Технические детали

### HeroUI компоненты использованные
- `Table`, `TableHeader`, `TableColumn`, `TableBody`, `TableRow`, `TableCell` - для таблиц
- `Button` - кнопки с различными вариантами (primary, light, danger)
- `Input` - текстовые поля
- `Textarea` - многострочные текстовые поля
- `Switch` - переключатель вкл/выкл
- `Chip` - цветные метки статуса
- `Tooltip` - всплывающие подсказки
- `Card`, `CardBody` - карточки контента

### Валидация
Все формы включают:
- Клиентскую валидацию через Inertia useForm
- Серверную валидацию в контроллере
- Отображение ошибок под каждым полем
- Визуальные индикаторы невалидных полей

### Особенности реализации
- Автоматическая генерация slug из названия если поле пустое
- Soft deletes не используются (прямое удаление)
- User ID автоматически берется из текущего пользователя
- Статус по умолчанию - активный (is_active = true)
- Использование Inertia.js для SPA навигации
- TypeScript типизация всех компонентов

## Заметки
- HeroUI установлен с флагом `--legacy-peer-deps` для совместимости с Vite 7
- Все команды выполняются через `./vendor/bin/sail` (Docker)
- Проект использует только React компоненты из HeroUI (не Vue/Svelte)

## Решение проблем

### Ошибка "Failed to resolve import 'ziggy-js'"

**Проблема**: Vite не может найти модуль `ziggy-js`

**Решение**:
1. Установить пакет: `npm install ziggy-js --legacy-peer-deps`
2. Убрать импорты `import { route } from 'ziggy-js'` из компонентов
3. Функция `route` доступна глобально через `resources/js/types/global.d.ts`
4. Инициализация в `resources/js/bootstrap.ts`: `window.route = ziggyRoute`
5. Директива `@routes` в `app.blade.php` генерирует маршруты

**Сидер для тестовых данных**:
- Создан `database/seeders/BrandSeeder.php`
- Добавляет 4 тестовых бренда (Nike, Adidas, Puma, Reebok)
- Запуск: `./vendor/bin/sail artisan db:seed --class=BrandSeeder`
