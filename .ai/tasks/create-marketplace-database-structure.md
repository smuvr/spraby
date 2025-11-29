# Создание структуры базы данных для маркетплейса

## Цель
Создать полную структуру таблиц для маркетплейса с поддержкой брендов, продуктов, вариантов, категорий и коллекций.

## Структура таблиц

### 1. brands
Таблица для брендов (поставщиков/продавцов)

**Поля:**
- `id` - bigint unsigned primary key auto_increment
- `user_id` - bigint unsigned, foreign key to users, indexed
- `name` - string(255), название бренда
- `slug` - string(255), уникальный URL-slug, unique index
- `description` - text nullable, описание бренда
- `logo` - string(255) nullable, путь к логотипу
- `is_active` - boolean default true, активен ли бренд
- `created_at` - timestamp nullable
- `updated_at` - timestamp nullable

**Индексы:**
- Primary key на `id`
- Unique index на `slug`
- Index на `user_id`
- Index на `is_active` (для фильтрации активных брендов)
- Composite index на (`user_id`, `is_active`) для запросов "активные бренды пользователя"

**Foreign Keys:**
- `user_id` references `users(id)` ON DELETE CASCADE

**Связи:**
- Принадлежит одному User (`belongsTo`)
- Имеет множество Products (`hasMany`)
- Имеет множество Categories через промежуточную таблицу (`belongsToMany`)

### 2. collections
Таблица для коллекций (верхний уровень категоризации)

**Поля:**
- `id` - bigint unsigned primary key auto_increment
- `name` - string(255), название коллекции
- `slug` - string(255), уникальный URL-slug, unique index
- `description` - text nullable, описание
- `image` - string(255) nullable, путь к изображению
- `is_active` - boolean default true
- `created_at` - timestamp nullable
- `updated_at` - timestamp nullable

**Индексы:**
- Primary key на `id`
- Unique index на `slug`
- Index на `is_active`

**Связи:**
- Имеет множество Categories через промежуточную таблицу (`belongsToMany`)

### 3. categories
Таблица для категорий продуктов

**Поля:**
- `id` - bigint unsigned primary key auto_increment
- `name` - string(255), название категории
- `slug` - string(255), уникальный URL-slug, unique index
- `description` - text nullable
- `image` - string(255) nullable, путь к изображению
- `is_active` - boolean default true
- `created_at` - timestamp nullable
- `updated_at` - timestamp nullable

**Индексы:**
- Primary key на `id`
- Unique index на `slug`
- Index на `is_active`

**Связи:**
- Принадлежит множеству Collections через промежуточную таблицу (`belongsToMany`)
- Имеет множество Products (`hasMany`)
- Имеет множество Options через промежуточную таблицу (`belongsToMany`)
- Имеет множество Brands через промежуточную таблицу (`belongsToMany`)

### 4. options
Таблица для типов опций (Цвет, Размер, Материал и т.д.)

**Поля:**
- `id` - bigint unsigned primary key auto_increment
- `name` - string(255), название опции (например: "Цвет", "Размер")
- `internal_name` - string(255), внутреннее название для использования в системе
- `slug` - string(255), уникальный URL-slug, unique index
- `type` - enum('select', 'color', 'text') default 'select', тип отображения
- `created_at` - timestamp nullable
- `updated_at` - timestamp nullable

**Индексы:**
- Primary key на `id`
- Unique index на `slug`
- Index на `internal_name` (для быстрого поиска по внутреннему имени)

**Связи:**
- Имеет множество Categories через промежуточную таблицу (`belongsToMany`)
- Имеет множество VariantValues (`hasMany`)

### 5. products
Таблица для продуктов

**Поля:**
- `id` - bigint unsigned primary key auto_increment
- `brand_id` - bigint unsigned, foreign key to brands, indexed
- `category_id` - bigint unsigned, foreign key to categories, indexed
- `name` - string(255), название продукта
- `slug` - string(255), уникальный URL-slug, unique index
- `description` - text nullable, полное описание
- `short_description` - text nullable
- `is_active` - boolean default true
- `created_at` - timestamp nullable
- `updated_at` - timestamp nullable
- `deleted_at` - timestamp nullable (soft deletes)

**Индексы:**
- Primary key на `id`
- Unique index на `slug`
- Index на `brand_id`
- Index на `category_id`
- Index на `is_active`
- Index на `deleted_at` (для soft deletes)
- Composite index на (`brand_id`, `is_active`, `deleted_at`) для запросов активных товаров бренда
- Composite index на (`category_id`, `is_active`, `deleted_at`) для запросов активных товаров категории

**Foreign Keys:**
- `brand_id` references `brands(id)` ON DELETE CASCADE
- `category_id` references `categories(id)` ON DELETE RESTRICT

**Связи:**
- Принадлежит одному Brand (`belongsTo`)
- Принадлежит одной Category (`belongsTo`)
- Имеет множество Variants (`hasMany`)
- Имеет множество Images через промежуточную таблицу product_images (`belongsToMany`)

### 6. variants
Таблица для вариантов продуктов (уникальные комбинации опций)

**Поля:**
- `id` - bigint unsigned primary key auto_increment
- `product_id` - bigint unsigned, foreign key to products, indexed
- `sku` - string(255), артикул варианта, unique index
- `price` - decimal(12,2) unsigned, цена варианта (макс 9,999,999,999.99)
- `compare_price` - decimal(12,2) unsigned nullable, цена до скидки
- `cost_price` - decimal(12,2) unsigned nullable, себестоимость
- `quantity` - integer unsigned default 0, количество на складе
- `is_available` - boolean default true
- `is_default` - boolean default false, является ли вариантом по умолчанию
- `created_at` - timestamp nullable
- `updated_at` - timestamp nullable

**Индексы:**
- Primary key на `id`
- Unique index на `sku`
- Index на `product_id`
- Index на `is_available`
- Index на `quantity` (для фильтрации по наличию)
- Composite index на (`product_id`, `is_default`) для быстрого поиска дефолтного варианта
- Composite index на (`product_id`, `is_available`) для запросов доступных вариантов

**Foreign Keys:**
- `product_id` references `products(id)` ON DELETE CASCADE

**Дополнительные ограничения:**
- Constraint: только один `is_default = true` на каждый `product_id` (реализуется через unique partial index или триггер)
- Check constraint: `price >= 0`
- Check constraint: `compare_price IS NULL OR compare_price >= price`
- Check constraint: `quantity >= 0`

**Связи:**
- Принадлежит одному Product (`belongsTo`)
- Имеет множество VariantValues (`hasMany`)

### 7. variant_values
Таблица для значений опций конкретного варианта

**Поля:**
- `id` - bigint unsigned primary key auto_increment
- `variant_id` - bigint unsigned, foreign key to variants, indexed
- `option_id` - bigint unsigned, foreign key to options, indexed
- `value` - string(255), значение опции (например: "Красный", "XL", "Хлопок")
- `created_at` - timestamp nullable
- `updated_at` - timestamp nullable

**Индексы:**
- Primary key на `id`
- Unique composite index на (`variant_id`, `option_id`) - один вариант не может иметь две одинаковые опции
- Index на `option_id`
- Index на `value` (для поиска по значению)
- Composite index на (`option_id`, `value`) для фильтрации по опциям

**Foreign Keys:**
- `variant_id` references `variants(id)` ON DELETE CASCADE
- `option_id` references `options(id)` ON DELETE RESTRICT

**Связи:**
- Принадлежит одному Variant (`belongsTo`)
- Принадлежит одной Option (`belongsTo`)

### 8. images
Таблица для хранения изображений

**Поля:**
- `id` - bigint unsigned primary key auto_increment
- `path` - string(500), путь к файлу, unique index
- `alt` - string(255) nullable, альтернативный текст для accessibility
- `description` - text nullable, описание изображения
- `created_at` - timestamp nullable
- `updated_at` - timestamp nullable

**Индексы:**
- Primary key на `id`
- Unique index на `path` (предотвращает дубликаты)

**Связи:**
- Имеет множество Products через промежуточную таблицу product_images (`belongsToMany`)

### 9. product_images (pivot table)
Промежуточная таблица для связи продуктов и изображений

**Поля:**
- `id` - bigint unsigned primary key auto_increment
- `product_id` - bigint unsigned, foreign key to products
- `image_id` - bigint unsigned, foreign key to images
- `variant_id` - bigint unsigned nullable, foreign key to variants
- `position` - integer unsigned default 0, порядок отображения
- `is_primary` - boolean default false, главное изображение
- `created_at` - timestamp nullable
- `updated_at` - timestamp nullable

**Индексы:**
- Primary key на `id`
- Unique composite index на (`product_id`, `image_id`) - одно изображение не может дублироваться для одного продукта
- Index на `product_id`
- Index на `image_id`
- Index на `variant_id`
- Composite index на (`product_id`, `position`) для сортировки
- Composite index на (`product_id`, `is_primary`) для быстрого поиска главного изображения
- Composite index на (`variant_id`, `position`) для изображений варианта

**Foreign Keys:**
- `product_id` references `products(id)` ON DELETE CASCADE
- `image_id` references `images(id)` ON DELETE CASCADE
- `variant_id` references `variants(id)` ON DELETE CASCADE

**Дополнительные ограничения:**
- Constraint: только один `is_primary = true` на каждый `product_id` (реализуется через unique partial index или триггер)
- Constraint: если указан `variant_id`, он должен принадлежать соответствующему `product_id`

### Промежуточные таблицы для many-to-many связей

#### category_collection
**Поля:**
- `category_id` - bigint unsigned, foreign key to categories
- `collection_id` - bigint unsigned, foreign key to collections
- `position` - integer unsigned default 0, порядок категории в коллекции
- `created_at` - timestamp nullable
- `updated_at` - timestamp nullable

**Индексы:**
- Composite primary key на (`category_id`, `collection_id`)
- Index на `collection_id`
- Composite index на (`collection_id`, `position`) для сортировки категорий в коллекции

**Foreign Keys:**
- `category_id` references `categories(id)` ON DELETE CASCADE
- `collection_id` references `collections(id)` ON DELETE CASCADE

#### brand_category
**Поля:**
- `brand_id` - bigint unsigned, foreign key to brands
- `category_id` - bigint unsigned, foreign key to categories
- `created_at` - timestamp nullable
- `updated_at` - timestamp nullable

**Индексы:**
- Composite primary key на (`brand_id`, `category_id`)
- Index на `category_id`

**Foreign Keys:**
- `brand_id` references `brands(id)` ON DELETE CASCADE
- `category_id` references `categories(id)` ON DELETE CASCADE

#### category_option
**Поля:**
- `category_id` - bigint unsigned, foreign key to categories
- `option_id` - bigint unsigned, foreign key to options
- `is_required` - boolean default false, обязательна ли опция для этой категории
- `position` - integer unsigned default 0, порядок отображения
- `created_at` - timestamp nullable
- `updated_at` - timestamp nullable

**Индексы:**
- Composite primary key на (`category_id`, `option_id`)
- Index на `option_id`
- Composite index на (`category_id`, `position`) для сортировки опций

**Foreign Keys:**
- `category_id` references `categories(id)` ON DELETE CASCADE
- `option_id` references `options(id)` ON DELETE RESTRICT

## Бизнес-логика и правила

1. **User → Brands**: Один пользователь может иметь несколько брендов
2. **Brand → Products**: Бренд может создавать только продукты из назначенных ему категорий
3. **Product → Category**: Продукт принадлежит одной категории и наследует её опции
4. **Product → Variants**: На основе опций категории создаются варианты продукта
5. **Variant → Variant Values**: Каждый вариант имеет уникальный набор значений опций
6. **Collections → Categories**: Иерархия: Коллекция → Категория → Продукт
7. **Images**: Общая таблица изображений с гибкой связью через product_images

## Задачи

### Backend (Laravel)

1. **Создать миграции** для всех таблиц в правильном порядке (с учетом зависимостей)
2. **Создать модели** для всех сущностей с правильными связями
3. **Создать фабрики** для тестовых данных
4. **Создать сидер** с примерами данных
5. **Добавить валидацию** на уровне моделей (Eloquent events)
6. **Создать политики доступа** (Policies) для проверки прав:
   - Бренд может создавать продукты только из своих категорий
   - Пользователь может управлять только своими брендами

### Frontend (опционально, на следующем этапе)

1. Создать страницы для управления брендами
2. Создать страницы для создания и редактирования продуктов
3. Создать UI для управления вариантами и опциями
4. Создать галерею изображений с drag-and-drop сортировкой

## Best Practices применённые в структуре

### Производительность и индексы
1. **Составные индексы** для часто используемых запросов (например, `brand_id`, `is_active`, `deleted_at`)
2. **Unique индексы** на `slug` и `sku` для предотвращения дубликатов
3. **Индексы на foreign keys** для ускорения JOIN операций
4. **Индексы на boolean поля** для фильтрации (is_active, is_available)
5. **Partial/Conditional индексы** для уникальности is_default и is_primary

### Целостность данных
1. **Foreign key constraints** с правильными ON DELETE стратегиями:
   - `CASCADE` - для зависимых данных (например, products при удалении brand)
   - `RESTRICT` - для справочных данных (categories, options)
2. **Check constraints** для валидации цен и количества
3. **Unique constraints** на бизнес-ключи (slug, sku, path)
4. **Soft deletes** только для products (восстановление удалённых товаров)
5. **Default values** для избежания NULL где это не требуется

### Типы данных
1. **bigint unsigned** для ID - поддержка больших объёмов данных
2. **decimal(12,2)** для цен - точность денежных операций
3. **unsigned** для количественных полей - только положительные значения
4. **enum** с default для type - контроль допустимых значений
5. **string размеры** оптимизированы под реальное использование

### Масштабируемость
1. **Нормализация** - правильное разделение данных по таблицам
2. **Денормализация** где нужно (position в pivot таблицах)
3. **Полиморфные связи избегнуты** - использованы явные связи для производительности
4. **Оптимизация для чтения** - индексы на часто запрашиваемые комбинации
5. **Разделение media** - отдельная таблица images с pivot таблицей

### Безопасность и валидация
1. **Ограничение длины строк** предотвращает атаки
2. **Unsigned типы** предотвращают отрицательные значения
3. **ON DELETE стратегии** предотвращают orphaned records
4. **Уникальные ключи** предотвращают дубликаты на уровне БД

### Laravel специфика
1. **Соглашения именования** Laravel (timestamps, snake_case)
2. **Soft deletes** только там где нужно
3. **Pivot таблицы** с id для расширяемости
4. **Timestamps** на всех таблицах для аудита

## Примечания по реализации

- Использовать миграции Laravel с явным указанием типов через методы Schema Builder
- Добавить Model Observers для автоматической генерации slug из name
- Использовать Laravel Storage для хранения изображений с автоматической оптимизацией
- Реализовать Queue jobs для обработки изображений (resize, thumbnails)
- Добавить Model Casts для автоматического преобразования типов
- Использовать Eloquent Scopes для частых запросов (active(), available())
- Добавить Database Transactions для операций создания продуктов с вариантами
- Реализовать Model Events для каскадных операций и бизнес-логики
- Использовать Laravel Validation Rules для проверки на уровне приложения
- Добавить Database Seeders с использованием Factory для тестовых данных

## Порядок создания миграций

1. `create_collections_table`
2. `create_categories_table`
3. `create_category_collection_table` (pivot)
4. `create_options_table`
5. `create_category_option_table` (pivot)
6. `create_brands_table`
7. `create_brand_category_table` (pivot)
8. `create_products_table`
9. `create_variants_table`
10. `create_variant_values_table`
11. `create_images_table`
12. `create_product_images_table` (pivot)