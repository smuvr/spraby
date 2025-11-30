<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\User;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get first user or create one
        $user = User::first();

        if (!$user) {
            $user = User::create([
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]);
        }

        // Create sample brands
        $brands = [
            [
                'name' => 'Nike',
                'slug' => 'nike',
                'description' => 'Just Do It - Leading sports brand',
                'is_active' => true,
            ],
            [
                'name' => 'Adidas',
                'slug' => 'adidas',
                'description' => 'Impossible is Nothing - German sports brand',
                'is_active' => true,
            ],
            [
                'name' => 'Puma',
                'slug' => 'puma',
                'description' => 'Forever Faster - Athletic apparel brand',
                'is_active' => true,
            ],
            [
                'name' => 'Reebok',
                'slug' => 'reebok',
                'description' => 'Be More Human - Fitness brand',
                'is_active' => false,
            ],
        ];

        foreach ($brands as $brandData) {
            Brand::create([
                'user_id' => $user->id,
                'name' => $brandData['name'],
                'slug' => $brandData['slug'],
                'description' => $brandData['description'],
                'is_active' => $brandData['is_active'],
            ]);
        }
    }
}
