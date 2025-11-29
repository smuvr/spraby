# Create Eloquent Models for Marketplace Database

## Description
Generate Eloquent models for all database tables based on existing migrations. Each model should include proper PHPDoc annotations (`@property` tags) for IDE autocomplete, define relationships, configure fillable/guarded fields, and set up appropriate casts and other model attributes.

## Todo List

### Core Models
- [x] Create `Brand` model
  - Properties: id, user_id, name, slug, logo, description, is_active, created_at, updated_at
  - Relationships: belongsTo User, hasMany Products, belongsToMany Categories
  - Fillable: user_id, name, slug, logo, description, is_active
  - Casts: is_active → boolean
  - Scopes: active

- [x] Create `Collection` model
  - Properties: id, name, slug, description, image, is_active, created_at, updated_at
  - Relationships: belongsToMany Categories (with position)
  - Fillable: name, slug, description, image, is_active
  - Casts: is_active → boolean
  - Scopes: active

- [x] Create `Category` model
  - Properties: id, name, slug, description, image, is_active, created_at, updated_at
  - Relationships: belongsToMany Collections, belongsToMany Options, belongsToMany Brands, hasMany Products
  - Fillable: name, slug, description, image, is_active
  - Casts: is_active → boolean
  - Scopes: active

- [x] Create `Option` model
  - Properties: id, name, internal_name, slug, type, created_at, updated_at
  - Relationships: belongsToMany Categories (with is_required, position)
  - Fillable: name, internal_name, slug, type

- [x] Create `Product` model
  - Properties: id, brand_id, category_id, name, slug, description, short_description, is_active, deleted_at, created_at, updated_at
  - Relationships: belongsTo Brand, belongsTo Category, hasMany Variants, belongsToMany Images
  - Fillable: brand_id, category_id, name, slug, description, short_description, is_active
  - Casts: is_active → boolean, deleted_at → datetime
  - Traits: SoftDeletes
  - Scopes: active, available

- [x] Create `Variant` model
  - Properties: id, product_id, sku, price, compare_price, cost_price, quantity, is_available, is_default, created_at, updated_at
  - Relationships: belongsTo Product, hasMany VariantValues, belongsToMany Images (through product_images)
  - Fillable: product_id, sku, price, compare_price, cost_price, quantity, is_available, is_default
  - Casts: price → decimal:2, compare_price → decimal:2, cost_price → decimal:2, quantity → integer, is_available → boolean, is_default → boolean
  - Scopes: available, default, inStock

- [x] Create `VariantValue` model
  - Properties: id, variant_id, option_id, value, created_at, updated_at
  - Relationships: belongsTo Variant, belongsTo Option
  - Fillable: variant_id, option_id, value

- [x] Create `Image` model
  - Properties: id, path, alt, description, created_at, updated_at
  - Relationships: belongsToMany Products (with variant_id, position, is_primary)
  - Fillable: path, alt, description

### Pivot Models (if needed for additional logic)
- [ ] Consider creating `CategoryCollection` pivot model (if custom methods needed) - Not needed for now
- [ ] Consider creating `CategoryOption` pivot model (for is_required field access) - Not needed for now
- [ ] Consider creating `BrandCategory` pivot model (if custom methods needed) - Not needed for now
- [x] Create `ProductImage` pivot model (for position, is_primary, variant_id) - Created

### Model Enhancements
- [ ] Add appropriate model events (creating, updating, deleting) if needed - Will add as needed
- [x] Add query scopes for common filters (active, available, etc.) - Added to relevant models
- [ ] Add accessors/mutators for formatted data if needed - Will add as needed
- [x] Ensure all foreign key relationships use correct onDelete behavior - Relationships defined correctly

## Implementation Guidelines

### PHPDoc Property Annotations
Each model must include complete `@property` annotations for all database columns:

```php
/**
 * @property int $id
 * @property int $brand_id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 *
 * @property-read Brand $brand
 * @property-read \Illuminate\Database\Eloquent\Collection<Variant> $variants
 */
```

### Relationship Definitions
Follow Laravel conventions:
- `belongsTo` - for foreign keys in current table
- `hasMany` / `hasOne` - for foreign keys in related table
- `belongsToMany` - for many-to-many via pivot tables
- Use explicit foreign key and owner key when non-standard

### Fillable vs Guarded
- Use `$fillable` for models with limited assignable fields
- Use `$guarded = []` only when all fields should be mass-assignable
- Never expose `id`, `created_at`, `updated_at` in fillable

### Casts Configuration
Ensure proper type casting:
- Boolean fields: `'is_active' => 'boolean'`
- Decimal fields: `'price' => 'decimal:2'`
- Integer fields: `'quantity' => 'integer'`
- Date fields: `'deleted_at' => 'datetime'` (if using SoftDeletes)

### Query Scopes
Add useful scopes for common queries:
```php
public function scopeActive($query)
{
    return $query->where('is_active', true);
}

public function scopeAvailable($query)
{
    return $query->where('is_available', true)->where('quantity', '>', 0);
}
```

### Pivot Table Attributes
For many-to-many relationships with extra fields:
```php
public function categories()
{
    return $this->belongsToMany(Category::class)
        ->withPivot('position')
        ->withTimestamps()
        ->orderBy('position');
}
```

## Reference Files
- Database schema: `.ai/docs/database-schema.md`
- Migrations: `database/migrations/`
- Existing User model: `app/Models/User.php` (as template)

## Expected Outcome
After completing this task:
1. ✅ All 8 main models exist in `app/Models/`
2. ✅ Each model has complete PHPDoc annotations
3. ✅ All relationships are properly defined
4. ✅ Proper fillable/casts/traits are configured
5. ✅ IDE autocomplete works for all model properties and relationships
6. ✅ Models follow Laravel and project conventions
7. ✅ User model updated with Brand relationship and PHPDoc annotations

## Notes
- Start with models that have no dependencies (Collection, Option)
- Then create models with single dependencies (Brand → User, Category)
- Finally create models with multiple dependencies (Product, Variant, etc.)
- Test each model's relationships in tinker after creation
- Consider adding accessor for primary image on Product model
- Consider adding accessor for formatted price on Variant model

---

## Результаты выполнения (29.11.2025)

### Созданные модели (10 файлов, 756 строк кода):

1. **Collection.php** (68 строк) - Коллекции товаров
2. **Option.php** (46 строк) - Опции вариантов (Цвет, Размер и т.д.)
3. **Brand.php** (88 строк) - Бренды продавцов
4. **Category.php** (100 строк) - Категории товаров
5. **Image.php** (44 строки) - Изображения
6. **Product.php** (126 строк) - Товары с SoftDeletes
7. **Variant.php** (116 строк) - Варианты товаров с ценами
8. **VariantValue.php** (50 строк) - Значения опций для вариантов
9. **ProductImage.php** (49 строк) - Pivot модель для product-image
10. **User.php** (обновлена, 69 строк) - Добавлена связь с Brand

### Что реализовано:

✅ Все модели с полными PHPDoc аннотациями (@property)
✅ Все связи (relationships) определены корректно
✅ Настроены fillable поля для mass assignment
✅ Правильные casts для всех типов данных
✅ Query scopes (active, available, default, inStock)
✅ Поддержка SoftDeletes в модели Product
✅ Pivot модель ProductImage с дополнительными полями
✅ Синтаксис PHP проверен - ошибок нет
✅ Модели успешно загружаются в tinker
✅ Создана документация: `.ai/docs/models-summary.md`

### Особенности реализации:

- **Product**: Включает scope `available()` для поиска товаров с доступными вариантами
- **Variant**: Три полезных scope (available, default, inStock) для фильтрации
- **Category**: Связи с Collection, Option, Brand включают pivot поля (position, is_required)
- **ProductImage**: Полноценная pivot модель с ID для расширяемости
- **Image**: Универсальное хранилище изображений с поддержкой привязки к вариантам

### Следующие шаги:

1. Создать seeders для заполнения тестовыми данными
2. Добавить factories для тестирования
3. Реализовать observers для автоматической обработки событий (например, автоматический slug)
4. Добавить accessors для форматированных данных (цена с валютой, полный URL изображения)
5. Создать API ресурсы для JSON-представления моделей