<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * @property int $id
 * @property string $path
 * @property string|null $alt
 * @property string|null $description
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 *
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Product> $products
 */
class Image extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'path',
        'alt',
        'description',
    ];

    /**
     * Get the products that use this image.
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_images')
            ->withPivot('variant_id', 'position', 'is_primary')
            ->withTimestamps()
            ->orderBy('position');
    }
}
