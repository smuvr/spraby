# Database Schema Documentation

This document describes the complete database structure for the marketplace application.

## Overview

The marketplace database consists of 13 main tables and 6 pivot tables that manage:
- **Users and Brands**: Multi-tenant system where users own brands
- **Roles and Permissions**: Fine-grained access control using Spatie Laravel Permission
- **Product Catalog**: Collections → Categories → Products → Variants
- **Product Options**: Configurable attributes for variants (Color, Size, etc.)
- **Media Management**: Images linked to products and variants

## Entity Relationship Summary

```
users (N) ←→ (N) roles [via model_has_roles]
users (N) ←→ (N) permissions [via model_has_permissions]
roles (N) ←→ (N) permissions [via role_has_permissions]
users (1) ─→ (N) brands
brands (N) ←→ (N) categories [via brand_category]
collections (N) ←→ (N) categories [via category_collection]
categories (N) ←→ (N) options [via category_option]
categories (1) ─→ (N) products
brands (1) ─→ (N) products
products (1) ─→ (N) variants
variants (1) ─→ (N) variant_values
options (1) ─→ (N) variant_values
products (N) ←→ (N) images [via product_images]
```

## Tables

### 1. brands

**Purpose**: Stores brand/seller information. Each user can own multiple brands.

**Fields**:
- `id` bigint unsigned PRIMARY KEY
- `user_id` bigint unsigned NOT NULL → users.id
- `name` varchar(255) NOT NULL
- `slug` varchar(255) NOT NULL UNIQUE
- `description` text NULL
- `logo` varchar(255) NULL
- `is_active` boolean NOT NULL DEFAULT true
- `created_at` timestamp NULL
- `updated_at` timestamp NULL

**Indexes**:
- PRIMARY KEY (`id`)
- UNIQUE (`slug`)
- INDEX (`user_id`)
- INDEX (`is_active`)
- INDEX (`user_id`, `is_active`)

**Foreign Keys**:
- `user_id` REFERENCES `users(id)` ON DELETE CASCADE

**Relationships**:
- belongsTo: User
- hasMany: Product
- belongsToMany: Category (via brand_category)

**Business Rules**:
- Brand can only create products in assigned categories
- Deleting user cascades to delete all their brands
- Brand slug must be globally unique

---

### 2. collections

**Purpose**: Top-level product categorization (e.g., "Men's Fashion", "Electronics").

**Fields**:
- `id` bigint unsigned PRIMARY KEY
- `name` varchar(255) NOT NULL
- `slug` varchar(255) NOT NULL UNIQUE
- `description` text NULL
- `image` varchar(255) NULL
- `is_active` boolean NOT NULL DEFAULT true
- `created_at` timestamp NULL
- `updated_at` timestamp NULL

**Indexes**:
- PRIMARY KEY (`id`)
- UNIQUE (`slug`)
- INDEX (`is_active`)

**Relationships**:
- belongsToMany: Category (via category_collection)

**Business Rules**:
- Collections are admin-managed
- Categories can belong to multiple collections
- Inactive collections are hidden from frontend

---

### 3. categories

**Purpose**: Product categories that define available options for products.

**Fields**:
- `id` bigint unsigned PRIMARY KEY
- `name` varchar(255) NOT NULL
- `slug` varchar(255) NOT NULL UNIQUE
- `description` text NULL
- `image` varchar(255) NULL
- `is_active` boolean NOT NULL DEFAULT true
- `created_at` timestamp NULL
- `updated_at` timestamp NULL

**Indexes**:
- PRIMARY KEY (`id`)
- UNIQUE (`slug`)
- INDEX (`is_active`)

**Relationships**:
- belongsToMany: Collection (via category_collection)
- belongsToMany: Brand (via brand_category)
- belongsToMany: Option (via category_option)
- hasMany: Product

**Business Rules**:
- Category can belong to multiple collections
- Category defines which options are available for its products
- Categories are assigned to brands to control what they can sell
- Products inherit category's options for variant creation

---

### 4. options

**Purpose**: Option types that can be used for product variants (Color, Size, Material, etc.).

**Fields**:
- `id` bigint unsigned PRIMARY KEY
- `name` varchar(255) NOT NULL - Display name
- `internal_name` varchar(255) NOT NULL - Internal system name
- `slug` varchar(255) NOT NULL UNIQUE
- `type` enum('select', 'color', 'text') NOT NULL DEFAULT 'select'
- `created_at` timestamp NULL
- `updated_at` timestamp NULL

**Indexes**:
- PRIMARY KEY (`id`)
- UNIQUE (`slug`)
- INDEX (`internal_name`)

**Relationships**:
- belongsToMany: Category (via category_option)
- hasMany: VariantValue

**Business Rules**:
- Options are global and admin-managed
- `internal_name` is used for programmatic access (e.g., "color", "size")
- `name` is user-facing (e.g., "Цвет", "Размер")
- `type` determines UI rendering:
  - `select`: dropdown
  - `color`: color picker
  - `text`: text input

---

### 5. products

**Purpose**: Main product entity. Contains general product information without pricing.

**Fields**:
- `id` bigint unsigned PRIMARY KEY
- `brand_id` bigint unsigned NOT NULL → brands.id
- `category_id` bigint unsigned NOT NULL → categories.id
- `name` varchar(255) NOT NULL
- `slug` varchar(255) NOT NULL UNIQUE
- `description` text NULL
- `short_description` text NULL
- `is_active` boolean NOT NULL DEFAULT true
- `created_at` timestamp NULL
- `updated_at` timestamp NULL
- `deleted_at` timestamp NULL - Soft delete

**Indexes**:
- PRIMARY KEY (`id`)
- UNIQUE (`slug`)
- INDEX (`brand_id`)
- INDEX (`category_id`)
- INDEX (`is_active`)
- INDEX (`deleted_at`)
- INDEX (`brand_id`, `is_active`, `deleted_at`)
- INDEX (`category_id`, `is_active`, `deleted_at`)

**Foreign Keys**:
- `brand_id` REFERENCES `brands(id)` ON DELETE CASCADE
- `category_id` REFERENCES `categories(id)` ON DELETE RESTRICT

**Relationships**:
- belongsTo: Brand
- belongsTo: Category
- hasMany: Variant
- belongsToMany: Image (via product_images)

**Business Rules**:
- Product must belong to one of the brand's assigned categories
- Deleting brand cascades to soft-delete products
- Cannot delete category if products exist (RESTRICT)
- Pricing is stored at variant level only
- Soft deletes allow product recovery

---

### 6. variants

**Purpose**: Product variants with unique option combinations. Contains pricing and inventory.

**Fields**:
- `id` bigint unsigned PRIMARY KEY
- `product_id` bigint unsigned NOT NULL → products.id
- `sku` varchar(255) NOT NULL UNIQUE
- `price` decimal(12,2) unsigned NOT NULL
- `compare_price` decimal(12,2) unsigned NULL - Original price before discount
- `cost_price` decimal(12,2) unsigned NULL - Cost for profit calculation
- `quantity` int unsigned NOT NULL DEFAULT 0
- `is_available` boolean NOT NULL DEFAULT true
- `is_default` boolean NOT NULL DEFAULT false
- `created_at` timestamp NULL
- `updated_at` timestamp NULL

**Indexes**:
- PRIMARY KEY (`id`)
- UNIQUE (`sku`)
- INDEX (`product_id`)
- INDEX (`is_available`)
- INDEX (`quantity`)
- INDEX (`product_id`, `is_default`)
- INDEX (`product_id`, `is_available`)

**Foreign Keys**:
- `product_id` REFERENCES `products(id)` ON DELETE CASCADE

**Constraints**:
- CHECK: `price >= 0`
- CHECK: `compare_price IS NULL OR compare_price >= price`
- CHECK: `quantity >= 0`
- UNIQUE partial: Only one `is_default = true` per `product_id`

**Relationships**:
- belongsTo: Product
- hasMany: VariantValue

**Business Rules**:
- Each product must have at least one variant
- SKU must be globally unique
- Only one variant can be marked as default per product
- `compare_price` should be >= `price` (for showing discounts)
- `is_available` can be false even with quantity > 0 (manual control)

---

### 7. variant_values

**Purpose**: Stores option values for each variant (e.g., variant #1: Color=Red, Size=XL).

**Fields**:
- `id` bigint unsigned PRIMARY KEY
- `variant_id` bigint unsigned NOT NULL → variants.id
- `option_id` bigint unsigned NOT NULL → options.id
- `value` varchar(255) NOT NULL
- `created_at` timestamp NULL
- `updated_at` timestamp NULL

**Indexes**:
- PRIMARY KEY (`id`)
- UNIQUE (`variant_id`, `option_id`) - Variant can't have duplicate options
- INDEX (`option_id`)
- INDEX (`value`)
- INDEX (`option_id`, `value`)

**Foreign Keys**:
- `variant_id` REFERENCES `variants(id)` ON DELETE CASCADE
- `option_id` REFERENCES `options(id)` ON DELETE RESTRICT

**Relationships**:
- belongsTo: Variant
- belongsTo: Option

**Business Rules**:
- Each variant must have values for all required options of its product's category
- One variant cannot have multiple values for the same option
- Deleting variant cascades to delete its values
- Cannot delete option if variant values exist (RESTRICT)

---

### 8. images

**Purpose**: Stores image files used across the system.

**Fields**:
- `id` bigint unsigned PRIMARY KEY
- `path` varchar(500) NOT NULL UNIQUE
- `alt` varchar(255) NULL - Alt text for accessibility/SEO
- `description` text NULL - Image description
- `created_at` timestamp NULL
- `updated_at` timestamp NULL

**Indexes**:
- PRIMARY KEY (`id`)
- UNIQUE (`path`)

**Relationships**:
- belongsToMany: Product (via product_images)

**Business Rules**:
- Image path must be unique (prevents duplicates)
- Images can be reused across multiple products
- `alt` is important for SEO and accessibility

---

### 9. product_images (Pivot Table)

**Purpose**: Links images to products with additional metadata (order, primary flag, variant assignment).

**Fields**:
- `id` bigint unsigned PRIMARY KEY
- `product_id` bigint unsigned NOT NULL → products.id
- `image_id` bigint unsigned NOT NULL → images.id
- `variant_id` bigint unsigned NULL → variants.id
- `position` int unsigned NOT NULL DEFAULT 0
- `is_primary` boolean NOT NULL DEFAULT false
- `created_at` timestamp NULL
- `updated_at` timestamp NULL

**Indexes**:
- PRIMARY KEY (`id`)
- UNIQUE (`product_id`, `image_id`)
- INDEX (`product_id`)
- INDEX (`image_id`)
- INDEX (`variant_id`)
- INDEX (`product_id`, `position`)
- INDEX (`product_id`, `is_primary`)
- INDEX (`variant_id`, `position`)

**Foreign Keys**:
- `product_id` REFERENCES `products(id)` ON DELETE CASCADE
- `image_id` REFERENCES `images(id)` ON DELETE CASCADE
- `variant_id` REFERENCES `variants(id)` ON DELETE CASCADE

**Constraints**:
- UNIQUE partial: Only one `is_primary = true` per `product_id`
- CHECK: If `variant_id` is set, it must belong to the `product_id`

**Business Rules**:
- Same image cannot be attached to product multiple times
- Each product must have exactly one primary image
- Images can be variant-specific (e.g., red variant shows red product images)
- `position` controls display order
- Deleting product/image/variant cascades to remove links

---

### 10. permissions

**Purpose**: Stores permission definitions for access control (using Spatie Laravel Permission).

**Fields**:
- `id` bigint unsigned PRIMARY KEY
- `name` varchar(255) NOT NULL - Permission name (e.g., 'create-product', 'edit-brand')
- `guard_name` varchar(255) NOT NULL - Guard name (typically 'web')
- `created_at` timestamp NULL
- `updated_at` timestamp NULL

**Indexes**:
- PRIMARY KEY (`id`)
- UNIQUE (`name`, `guard_name`)

**Relationships**:
- belongsToMany: Role (via role_has_permissions)
- morphedByMany: User (via model_has_permissions)

**Business Rules**:
- Permission names should follow pattern: `{action}-{resource}` (e.g., 'create-product', 'view-brands')
- Permissions are typically assigned to roles, not directly to users
- Guard name allows different permission sets for different auth guards

---

### 11. roles

**Purpose**: Stores role definitions for grouping permissions (using Spatie Laravel Permission).

**Fields**:
- `id` bigint unsigned PRIMARY KEY
- `name` varchar(255) NOT NULL - Role name (e.g., 'admin', 'brand-owner', 'customer')
- `guard_name` varchar(255) NOT NULL - Guard name (typically 'web')
- `created_at` timestamp NULL
- `updated_at` timestamp NULL

**Indexes**:
- PRIMARY KEY (`id`)
- UNIQUE (`name`, `guard_name`)

**Relationships**:
- belongsToMany: Permission (via role_has_permissions)
- morphedByMany: User (via model_has_roles)

**Business Rules**:
- Users can have multiple roles simultaneously
- Roles group related permissions
- Default roles: `admin`, `brand-owner`, `customer`, `moderator`

---

### 12. model_has_permissions (Polymorphic Pivot)

**Purpose**: Direct permission assignments to models (typically used for exceptions).

**Fields**:
- `permission_id` bigint unsigned NOT NULL → permissions.id
- `model_type` varchar(255) NOT NULL - Polymorphic type (e.g., 'App\Models\User')
- `model_id` bigint unsigned NOT NULL - Model ID

**Indexes**:
- PRIMARY KEY (`permission_id`, `model_id`, `model_type`)
- INDEX (`model_id`, `model_type`)

**Foreign Keys**:
- `permission_id` REFERENCES `permissions(id)` ON DELETE CASCADE

**Business Rules**:
- Rarely used - permissions usually assigned via roles
- Use for one-off permission grants
- Model can be any Eloquent model with HasRoles trait

---

### 13. model_has_roles (Polymorphic Pivot)

**Purpose**: Assigns roles to models (users).

**Fields**:
- `role_id` bigint unsigned NOT NULL → roles.id
- `model_type` varchar(255) NOT NULL - Polymorphic type (e.g., 'App\Models\User')
- `model_id` bigint unsigned NOT NULL - Model ID

**Indexes**:
- PRIMARY KEY (`role_id`, `model_id`, `model_type`)
- INDEX (`model_id`, `model_type`)

**Foreign Keys**:
- `role_id` REFERENCES `roles(id)` ON DELETE CASCADE

**Business Rules**:
- Users can have multiple roles
- Deleting role removes all assignments
- Model can be any Eloquent model with HasRoles trait

---

## Pivot Tables (Many-to-Many)

### category_collection

**Purpose**: Links categories to collections (many-to-many).

**Fields**:
- `category_id` bigint unsigned NOT NULL → categories.id
- `collection_id` bigint unsigned NOT NULL → collections.id
- `position` int unsigned NOT NULL DEFAULT 0 - Display order within collection
- `created_at` timestamp NULL
- `updated_at` timestamp NULL

**Indexes**:
- PRIMARY KEY (`category_id`, `collection_id`)
- INDEX (`collection_id`)
- INDEX (`collection_id`, `position`)

**Foreign Keys**:
- `category_id` REFERENCES `categories(id)` ON DELETE CASCADE
- `collection_id` REFERENCES `collections(id)` ON DELETE CASCADE

---

### brand_category

**Purpose**: Defines which categories a brand can create products in.

**Fields**:
- `brand_id` bigint unsigned NOT NULL → brands.id
- `category_id` bigint unsigned NOT NULL → categories.id
- `created_at` timestamp NULL
- `updated_at` timestamp NULL

**Indexes**:
- PRIMARY KEY (`brand_id`, `category_id`)
- INDEX (`category_id`)

**Foreign Keys**:
- `brand_id` REFERENCES `brands(id)` ON DELETE CASCADE
- `category_id` REFERENCES `categories(id)` ON DELETE CASCADE

**Business Rules**:
- Admin assigns categories to brands
- Brand can only create products in assigned categories
- This controls marketplace permissions

---

### category_option

**Purpose**: Defines which options are available for a category's products.

**Fields**:
- `category_id` bigint unsigned NOT NULL → categories.id
- `option_id` bigint unsigned NOT NULL → options.id
- `is_required` boolean NOT NULL DEFAULT false
- `position` int unsigned NOT NULL DEFAULT 0 - Display order
- `created_at` timestamp NULL
- `updated_at` timestamp NULL

**Indexes**:
- PRIMARY KEY (`category_id`, `option_id`)
- INDEX (`option_id`)
- INDEX (`category_id`, `position`)

**Foreign Keys**:
- `category_id` REFERENCES `categories(id)` ON DELETE CASCADE
- `option_id` REFERENCES `options(id)` ON DELETE RESTRICT

**Business Rules**:
- When creating product in category, variants must use these options
- `is_required`: if true, all variants must have this option value
- `position`: controls option display order in UI

---

## Data Flow Examples

### Creating a Product with Variants

1. **Select Brand** → Check brand has access to desired category (brand_category)
2. **Select Category** → Get available options from category_option
3. **Create Product** → Insert into products table
4. **Create Variants**:
   - For each variant combination of option values
   - Insert into variants table
   - Insert option values into variant_values table
5. **Upload Images**:
   - Insert into images table
   - Link to product via product_images (set one as primary)
   - Optionally link specific images to variants

### Displaying Products in Collection

1. **Query Collection** → Get collection by slug
2. **Get Categories** → Join via category_collection, order by position
3. **Get Products** → Filter by category_id, is_active=true, deleted_at IS NULL
4. **Get Default Variant** → Join variants where is_default=true
5. **Get Primary Image** → Join product_images where is_primary=true

### Filtering Products by Options

1. **User selects**: Color=Red, Size=XL
2. **Query**:
   ```sql
   SELECT DISTINCT products.*
   FROM products
   JOIN variants ON variants.product_id = products.id
   JOIN variant_values vv1 ON vv1.variant_id = variants.id
   JOIN variant_values vv2 ON vv2.variant_id = variants.id
   WHERE vv1.option_id = [color_option_id] AND vv1.value = 'Red'
     AND vv2.option_id = [size_option_id] AND vv2.value = 'XL'
     AND variants.is_available = true
     AND products.is_active = true
   ```

---

## Performance Considerations

### Indexed Queries (Fast)
- Get active products by brand: Uses (`brand_id`, `is_active`, `deleted_at`)
- Get available variants: Uses (`product_id`, `is_available`)
- Find product by slug: Uses UNIQUE (`slug`)
- Get primary image: Uses (`product_id`, `is_primary`)

### Queries Requiring Optimization
- Filter products by multiple option values: Consider denormalization or search engine
- Count products in category: Consider cache/materialized view
- Complex variant searches: Consider Elasticsearch/Algolia

### Caching Recommendations
- Collections list (rarely changes)
- Category tree (rarely changes)
- Product counts per category
- Available option values per category

---

## Validation Rules

### At Database Level
- UNIQUE constraints on slug, sku, path
- CHECK constraints on prices and quantities
- FOREIGN KEY constraints with appropriate ON DELETE actions
- NOT NULL constraints on required fields

### At Application Level (Laravel)
- Brand can only create products in assigned categories
- Product variants must have values for all required category options
- Only one is_default variant per product
- Only one is_primary image per product
- SKU uniqueness validation
- Slug auto-generation and uniqueness

---

## Migration Order

Must be created in this order due to foreign key dependencies:

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

---

## Common Queries Reference

### Get product with all data
```php
Product::with([
    'brand',
    'category',
    'variants.variantValues.option',
    'images' => fn($q) => $q->orderBy('position')
])->where('slug', $slug)->firstOrFail();
```

### Get available products in category
```php
Product::where('category_id', $categoryId)
    ->where('is_active', true)
    ->whereNull('deleted_at')
    ->whereHas('variants', fn($q) => $q->where('is_available', true))
    ->get();
```

### Get products by brand
```php
Brand::find($brandId)
    ->products()
    ->where('is_active', true)
    ->whereNull('deleted_at')
    ->with('variants', 'images')
    ->get();
```

### Check if brand can create product in category
```php
$brand->categories()->where('category_id', $categoryId)->exists();
```

### Roles and Permissions

```php
// Assign role to user
$user->assignRole('brand-owner');

// Assign multiple roles
$user->assignRole(['brand-owner', 'customer']);

// Check if user has role
if ($user->hasRole('admin')) {
    // User is admin
}

// Check if user has any of the roles
if ($user->hasAnyRole(['admin', 'moderator'])) {
    // User is admin or moderator
}

// Check if user has all roles
if ($user->hasAllRoles(['brand-owner', 'customer'])) {
    // User has both roles
}

// Check permission
if ($user->can('create-product')) {
    // User can create products
}

// Check multiple permissions
if ($user->hasAllPermissions(['create-product', 'edit-product'])) {
    // User has both permissions
}

// Give permission directly to user (rare)
$user->givePermissionTo('delete-brand');

// Remove role from user
$user->removeRole('customer');

// Get user's permissions
$permissions = $user->getAllPermissions();

// Get user's roles
$roles = $user->getRoleNames();

// Sync roles (replace all current roles)
$user->syncRoles(['brand-owner']);

// In Blade templates
@role('admin')
    <a href="/admin">Admin Panel</a>
@endrole

@can('edit-product')
    <button>Edit Product</button>
@endcan

// In controllers with middleware
Route::middleware(['role:admin'])->group(function () {
    // Admin only routes
});

Route::middleware(['permission:create-product'])->post('/products', [ProductController::class, 'store']);

// Get users with specific role
$admins = User::role('admin')->get();

// Get users with specific permission
$editors = User::permission('edit-product')->get();
```
