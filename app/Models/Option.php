<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * @property int $id
 * @property string $name
 * @property string $internal_name
 * @property string $slug
 * @property string $type
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 *
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Category> $categories
 */
class Option extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'internal_name',
        'slug',
        'type',
    ];

    /**
     * Get the categories that use this option.
     */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'category_option')
            ->withPivot('is_required', 'position')
            ->withTimestamps()
            ->orderBy('position');
    }
}
