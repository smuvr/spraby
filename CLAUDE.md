р# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Marketplace Platform** built with Laravel 12 and Inertia.js React (TypeScript). The application supports multi-tenant brands, product catalogs with variants, configurable product options, and media management. It uses Laravel Breeze for authentication scaffolding.

## Stack

- **Backend**: Laravel 12 (PHP 8.2+)
- **Frontend**: React 18 with TypeScript
- **Inertia.js**: Server-side rendering bridge between Laravel and React
- **Styling**: Tailwind CSS v4
- **Build Tool**: Vite 7
- **Testing**: PHPUnit 11
- **Database**: SQLite (default), with Docker support for MySQL and Redis

## Common Development Commands

### Starting Development

```bash
# Quick start (runs all services concurrently)
composer dev

# This single command starts:
# - PHP development server (port 8000)
# - Queue worker
# - Laravel Pail (log viewer)
# - Vite dev server (port 5173)
```

### Individual Services

```bash
# PHP development server only
php artisan serve

# Frontend development server only
npm run dev

# Queue worker
php artisan queue:listen --tries=1

# Log viewer
php artisan pail --timeout=0
```

### Building

```bash
# Build frontend assets for production
npm run build

# Build with TypeScript compilation
npm run build  # Already includes tsc in the script
```

### Testing

```bash
# Run all tests
composer test
# Or directly:
php artisan test

# Run specific test suite
php artisan test --testsuite=Feature
php artisan test --testsuite=Unit

# Run a specific test file
php artisan test tests/Feature/ExampleTest.php
```

### Code Quality

```bash
# Format code with Laravel Pint
./vendor/bin/pint

# Format specific files or directories
./vendor/bin/pint app/Http/Controllers
```

### Docker Development (Laravel Sail)

```bash
# Start all Docker services
./vendor/bin/sail up -d

# Run artisan commands in Docker
./vendor/bin/sail artisan migrate

# Run npm commands in Docker
./vendor/bin/sail npm run dev
```

### Database

```bash
# Run migrations
php artisan migrate

# Fresh migration with seeding
php artisan migrate:fresh --seed

# Rollback last migration
php artisan migrate:rollback

# Create new migration
php artisan make:migration create_table_name
```

### Other Common Commands

```bash
# Clear application caches
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

# Generate application key (required on first setup)
php artisan key:generate

# Tinker (Laravel REPL)
php artisan tinker

# Create controller
php artisan make:controller ControllerName

# Create model with migration
php artisan make:model ModelName -m
```

## Architecture

### Frontend Structure

- **Entry Point**: `resources/js/app.tsx` - Bootstraps Inertia.js and sets up React
- **Pages**: `resources/js/Pages/` - Inertia page components
  - `Pages/Public/` - Public-facing pages (e.g., Home)
  - `Pages/Auth/` - Authentication pages (Login, Register, etc.)
  - `Pages/Profile/` - User profile management
  - `Pages/Dashboard.tsx` - Main authenticated dashboard
- **Components**: `resources/js/Components/` - Reusable UI components (buttons, inputs, modals, etc.)
- **Layouts**: `resources/js/Layouts/` - Page layout wrappers
  - `AuthenticatedLayout.tsx` - Layout for authenticated pages with navigation
  - `GuestLayout.tsx` - Simple layout for guest/auth pages
- **Types**: `resources/js/types/` - TypeScript type definitions

### Backend Structure

- **Routes**:
  - `routes/web.php` - Web routes (Inertia pages)
  - `routes/auth.php` - Authentication routes (included in web.php)
  - `routes/console.php` - Artisan commands
- **Controllers**: `app/Http/Controllers/` - Request handlers
  - `Controllers/Auth/` - Authentication controllers (Breeze scaffolding)
  - `ProfileController.php` - User profile management
- **Models**: `app/Models/` - Eloquent ORM models
- **Middleware**: `app/Http/Middleware/` - Request middleware
  - `HandleInertiaRequests.php` - Shares data with all Inertia requests
- **Providers**: `app/Providers/` - Service providers
- **Database**: `database/`
  - `migrations/` - Database schema migrations
  - `factories/` - Model factories for testing
  - `seeders/` - Database seeders

### TypeScript Path Aliases

The project uses path aliases defined in `tsconfig.json`:
- `@/*` maps to `resources/js/*`
- `ziggy-js` maps to the Ziggy route helper

Example:
```typescript
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { route } from 'ziggy-js';
```

### Inertia.js Pattern

Pages are rendered using Inertia from Laravel controllers:

```php
// In controller
return Inertia::render('PageName', [
    'prop' => $value,
]);
```

```typescript
// In React component (resources/js/Pages/PageName.tsx)
export default function PageName({ prop }: { prop: string }) {
    // Component code
}
```

### Component Files

The project contains both `.tsx` (TypeScript) and `.jsx` (JavaScript) versions of components and pages. When working on this project:
- **Prefer TypeScript** (`.tsx`) files for new components
- Both file types exist from the Breeze installation scaffolding
- The app is configured to use `.tsx` files (see `resources/js/app.tsx`)

### Database Architecture

**Critical**: This is a marketplace platform with a complex database schema. See `.ai/docs/database-schema.md` for complete documentation.

**High-level structure**:
- **Default DB**: SQLite (`database/database.sqlite`)
- **Docker**: MySQL and Redis available via `compose.yaml`
- **Migrations**: Located in `database/migrations/`

**Core Entities**:
1. **Users & Brands**: Multi-tenant system where users own multiple brands
2. **Catalog Hierarchy**: Collections → Categories → Products → Variants
3. **Product Options**: Configurable attributes (Color, Size, etc.) defined at category level
4. **Variant System**: Products have variants with unique SKUs, prices, and option combinations
5. **Media Management**: Shared image pool linked to products/variants via pivot table

**Key Tables** (9 main + 3 pivot):
- `brands` - Seller/brand information (owned by users)
- `collections` - Top-level categorization
- `categories` - Product categories with assigned options
- `options` - Global option types (Color, Size, Material, etc.)
- `products` - Product base info (no pricing)
- `variants` - SKU-level data with pricing and inventory
- `variant_values` - Option values for each variant
- `images` - Shared image storage
- `product_images` - Links images to products/variants

**Pivot Tables**:
- `category_collection` - Categories in collections (with position)
- `brand_category` - Categories assigned to brands (access control)
- `category_option` - Options available in categories (with is_required)

**Business Rules**:
- Brands can only create products in assigned categories
- Products inherit options from their category
- Variants must have values for all required category options
- Pricing exists only at variant level, not product level
- Each product must have at least one variant
- SKU must be globally unique
- Only one default variant per product
- Only one primary image per product

**Important Constraints**:
- `brand_id` → `user_id`: CASCADE delete (user deletion removes brands)
- `product_id` → `brand_id`: CASCADE delete (brand deletion soft-deletes products)
- `product_id` → `category_id`: RESTRICT delete (can't delete category with products)
- Products use soft deletes for recovery
- Check constraints on prices: `compare_price >= price`

### Authentication

Uses Laravel Breeze with Inertia React stack:
- Email verification supported
- Password reset functionality
- Profile management (update info, password, delete account)
- Middleware: `auth`, `verified`, `guest`

## Development Workflow

1. **Initial Setup**: Run `composer setup` to install dependencies, copy .env, generate key, run migrations, and build assets
2. **Daily Development**: Run `composer dev` to start all services at once
3. **Making Changes**:
   - Backend: Edit PHP files, changes are immediate (no restart needed)
   - Frontend: Edit React/TypeScript files, Vite hot-reloads automatically
4. **Database Changes**: Create migrations, run `php artisan migrate`
5. **Testing**: Write tests in `tests/`, run with `php artisan test`

## Task Management

When working on complex features or issues, use the `.ai/tasks/` directory to track progress:

### Creating Tasks

1. **Create a task file**: `.ai/tasks/task-name.md`
2. **Language**: Write all task files in Russian (все файлы задач пишутся на русском языке)
3. **Structure the task file**:
   ```markdown
   # Название задачи

   ## Описание
   Краткое описание того, что нужно сделать.

   ## Список задач

   - [ ] Первая подзадача
   - [ ] Вторая подзадача
   - [ ] Третья подзадача

   ## Заметки
   Дополнительный контекст, принятые решения или важная информация.
   ```

### Working with Tasks

- **Mark completed items**: Change `- [ ]` to `- [x]` when a todo item is done
- **Update as you work**: Add new todos if you discover additional work needed
- **Keep tasks focused**: One task file per feature/issue
- **Reference in commits**: Mention task file in commit messages for traceability
- **Language**: All task descriptions, todos, and notes must be written in Russian
- **No automatic test creation**: When creating and executing tasks, DO NOT create tests unless explicitly requested by the user

### Task File Naming

Use descriptive kebab-case names:
- `create-marketplace-database-structure.md`
- `implement-variant-creation-ui.md`
- `fix-image-upload-bug.md`

### Example Task File

```markdown
# Создание вариантов товаров

## Описание
Добавить UI и бэкенд логику для создания вариантов товаров с настраиваемыми опциями.

## Список задач

- [x] Создать миграцию для таблицы variants
- [x] Создать модель Variant с отношениями
- [ ] Построить компонент формы создания варианта
- [ ] Добавить валидацию уникальности SKU
- [ ] Реализовать UI выбора значений опций
- [ ] Добавить тесты для создания вариантов
- [ ] Обновить страницу деталей товара для отображения вариантов

## Заметки
- Варианты должны иметь хотя бы одно значение опции
- SKU должен быть глобально уникальным для всех товаров
- Требуется вариант по умолчанию для каждого товара
```

## Important Notes

- **Route Helpers**: Use Ziggy for type-safe routing in React: `route('route.name', params)`
- **Shared Data**: Global props (like auth user) are shared via `HandleInertiaRequests` middleware
- **Forms**: Use Inertia's form helper for form handling with CSRF protection and validation
- **Flash Messages**: Session flash data is automatically shared with Inertia pages
- **Assets**: Reference public assets using Vite's asset helper or the `/` public path

## Marketplace-Specific Patterns

### Working with Products and Variants

**Key Concept**: Products are containers, Variants hold actual inventory/pricing.

```php
// Product has no price field
$product = Product::create([
    'brand_id' => $brandId,
    'category_id' => $categoryId,
    'name' => 'T-Shirt',
    'slug' => 'cool-tshirt',
]);

// Variants contain SKU, price, quantity
$variant = $product->variants()->create([
    'sku' => 'TSHIRT-RED-XL',
    'price' => 29.99,
    'quantity' => 100,
    'is_default' => true,
]);

// Variant values define the options (Red, XL)
$variant->variantValues()->create([
    'option_id' => $colorOptionId,
    'value' => 'Red',
]);
```

### Brand-Category Access Control

Before creating a product, verify brand has access to the category:

```php
// Check access
if (!$brand->categories()->where('category_id', $categoryId)->exists()) {
    abort(403, 'Brand cannot create products in this category');
}

// Get available categories for brand
$availableCategories = $brand->categories;
```

### Category Options Flow

Categories define which options products can use:

```php
// Get category with its options
$category = Category::with('options')->find($categoryId);

// Required options must be present in all variants
$requiredOptions = $category->options()
    ->wherePivot('is_required', true)
    ->get();

// When creating variants, ensure all required options have values
```

### Loading Products Efficiently

```php
// Full product data with relationships
Product::with([
    'brand',
    'category',
    'variants' => fn($q) => $q->where('is_available', true),
    'variants.variantValues.option',
    'images' => fn($q) => $q->orderBy('position'),
])
->where('slug', $slug)
->firstOrFail();

// Active products by brand
Brand::find($brandId)
    ->products()
    ->where('is_active', true)
    ->whereNull('deleted_at')
    ->get();
```

### Image Management

Images are shared and linked via pivot table:

```php
// Attach image to product
$product->images()->attach($imageId, [
    'position' => 1,
    'is_primary' => true,
    'variant_id' => null, // null = all variants, or specific variant ID
]);

// Get product's primary image
$primaryImage = $product->images()
    ->wherePivot('is_primary', true)
    ->first();

// Get images for specific variant
$variantImages = $product->images()
    ->wherePivot('variant_id', $variantId)
    ->orderBy('position')
    ->get();
```

## Project Documentation

- **Database Schema**: `.ai/docs/database-schema.md` - Complete table structure, relationships, constraints, and query examples
- **Task Specifications**: `.ai/tasks/` - Implementation tasks and requirements
- **Current Task**: `.ai/tasks/create-marketplace-database-structure.md` - Database structure specification