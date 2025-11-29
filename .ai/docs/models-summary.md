# Модели Eloquent - Краткая справка

Все основные модели созданы в `app/Models/`. Каждая модель включает:
- Полные PHPDoc аннотации для автодополнения IDE
- Определенные связи (relationships)
- Настроенные fillable поля
- Правильные casts для типов данных
- Query scopes для частых запросов

## Список моделей

### 1. Collection (`app/Models/Collection.php`)
**Свойства:**
- id, name, slug, description, image, is_active, timestamps

**Связи:**
- `belongsToMany(Category)` - категории в коллекции (с pivot: position)

**Scopes:**
- `active()` - только активные коллекции

---

### 2. Option (`app/Models/Option.php`)
**Свойства:**
- id, name, internal_name, slug, type, timestamps

**Связи:**
- `belongsToMany(Category)` - категории, использующие опцию (с pivot: is_required, position)

---

### 3. Brand (`app/Models/Brand.php`)
**Свойства:**
- id, user_id, name, slug, description, logo, is_active, timestamps

**Связи:**
- `belongsTo(User)` - владелец бренда
- `hasMany(Product)` - товары бренда
- `belongsToMany(Category)` - назначенные категории

**Scopes:**
- `active()` - только активные бренды

---

### 4. Category (`app/Models/Category.php`)
**Свойства:**
- id, name, slug, description, image, is_active, timestamps

**Связи:**
- `belongsToMany(Collection)` - коллекции (с pivot: position)
- `belongsToMany(Option)` - доступные опции (с pivot: is_required, position)
- `belongsToMany(Brand)` - бренды с доступом
- `hasMany(Product)` - товары в категории

**Scopes:**
- `active()` - только активные категории

---

### 5. Image (`app/Models/Image.php`)
**Свойства:**
- id, path, alt, description, timestamps

**Связи:**
- `belongsToMany(Product)` - товары (с pivot: variant_id, position, is_primary)

---

### 6. Product (`app/Models/Product.php`)
**Свойства:**
- id, brand_id, category_id, name, slug, description, short_description, is_active, deleted_at, timestamps

**Traits:**
- `SoftDeletes` - мягкое удаление

**Связи:**
- `belongsTo(Brand)` - бренд товара
- `belongsTo(Category)` - категория товара
- `hasMany(Variant)` - варианты товара
- `belongsToMany(Image)` - изображения (с pivot: variant_id, position, is_primary)

**Scopes:**
- `active()` - только активные товары
- `available()` - товары с доступными вариантами

---

### 7. Variant (`app/Models/Variant.php`)
**Свойства:**
- id, product_id, sku, price, compare_price, cost_price, quantity, is_available, is_default, timestamps

**Casts:**
- price, compare_price, cost_price → decimal:2
- quantity → integer
- is_available, is_default → boolean

**Связи:**
- `belongsTo(Product)` - товар
- `hasMany(VariantValue)` - значения опций
- `belongsToMany(Image)` - изображения варианта (через product_images)

**Scopes:**
- `available()` - доступные варианты (is_available = true, quantity > 0)
- `default()` - варианты по умолчанию
- `inStock()` - в наличии (quantity > 0)

---

### 8. VariantValue (`app/Models/VariantValue.php`)
**Свойства:**
- id, variant_id, option_id, value, timestamps

**Связи:**
- `belongsTo(Variant)` - вариант
- `belongsTo(Option)` - опция

---

### 9. ProductImage (Pivot) (`app/Models/ProductImage.php`)
**Свойства:**
- id, product_id, image_id, variant_id, position, is_primary, timestamps

**Примечание:**
Расширяет `Pivot` для дополнительной функциональности связи product-image.

---

### 10. User (`app/Models/User.php`) - Обновлена
**Добавлены:**
- PHPDoc аннотации для всех свойств
- Связь `hasMany(Brand)` - бренды пользователя

## Примеры использования

### Получение товаров с вариантами и изображениями
```php
$products = Product::with([
    'brand',
    'category',
    'variants' => fn($q) => $q->where('is_available', true),
    'variants.variantValues.option',
    'images' => fn($q) => $q->orderBy('position'),
])
->active()
->get();
```

### Проверка доступа бренда к категории
```php
$hasAccess = $brand->categories()->where('category_id', $categoryId)->exists();
```

### Получение обязательных опций категории
```php
$requiredOptions = $category->options()
    ->wherePivot('is_required', true)
    ->get();
```

### Получение первичного изображения товара
```php
$primaryImage = $product->images()
    ->wherePivot('is_primary', true)
    ->first();
```

### Получение доступных товаров бренда
```php
$availableProducts = Brand::find($brandId)
    ->products()
    ->active()
    ->available()
    ->get();
```

## Проверка работоспособности

Все модели успешно прошли проверку:
- ✅ Синтаксис PHP без ошибок
- ✅ Модели успешно загружаются в tinker
- ✅ Все связи определены корректно
- ✅ PHPDoc аннотации добавлены для IDE autocomplete

## Дальнейшие улучшения

По мере развития проекта можно добавить:
- Model events (observers) для автоматической обработки
- Accessors/Mutators для форматированных данных
- Дополнительные query scopes
- Validation rules прямо в моделях (через traits)
