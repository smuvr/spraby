<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $product_id
 * @property string $sku
 * @property float $price
 * @property float|null $compare_price
 * @property float|null $cost_price
 * @property int $quantity
 * @property bool $is_available
 * @property bool $is_default
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 *
 * @property-read \App\Models\Product $product
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\VariantValue> $variantValues
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Image> $images
 */
class Variant extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'product_id',
        'sku',
        'price',
        'compare_price',
        'cost_price',
        'quantity',
        'is_available',
        'is_default',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'compare_price' => 'decimal:2',
            'cost_price' => 'decimal:2',
            'quantity' => 'integer',
            'is_available' => 'boolean',
            'is_default' => 'boolean',
        ];
    }

    /**
     * Get the product that owns this variant.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the variant values for this variant.
     */
    public function variantValues(): HasMany
    {
        return $this->hasMany(VariantValue::class);
    }

    /**
     * Get the images for this variant through product_images.
     */
    public function images(): BelongsToMany
    {
        return $this->belongsToMany(Image::class, 'product_images')
            ->wherePivot('variant_id', $this->id)
            ->withPivot('position', 'is_primary')
            ->withTimestamps()
            ->orderBy('position');
    }

    /**
     * Scope a query to only include available variants.
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true)->where('quantity', '>', 0);
    }

    /**
     * Scope a query to only include default variants.
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Scope a query to only include in-stock variants.
     */
    public function scopeInStock($query)
    {
        return $query->where('quantity', '>', 0);
    }
}
