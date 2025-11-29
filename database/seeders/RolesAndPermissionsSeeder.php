<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // Brand permissions
            'view-brands',
            'create-brand',
            'edit-brand',
            'delete-brand',

            // Product permissions
            'view-products',
            'create-product',
            'edit-product',
            'delete-product',

            // Category permissions
            'view-categories',
            'manage-categories',

            // Collection permissions
            'view-collections',
            'manage-collections',

            // Option permissions
            'view-options',
            'manage-options',

            // User permissions
            'view-users',
            'manage-users',

            // Order permissions (for future)
            'view-orders',
            'manage-orders',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions

        // Admin role - full access
        $adminRole = Role::create(['name' => 'admin']);
        $adminRole->givePermissionTo(Permission::all());

        // Brand Owner role - manage own brands and products
        $brandOwnerRole = Role::create(['name' => 'brand-owner']);
        $brandOwnerRole->givePermissionTo([
            'view-brands',
            'create-brand',
            'edit-brand',
            'view-products',
            'create-product',
            'edit-product',
            'delete-product',
            'view-categories',
            'view-collections',
            'view-options',
            'view-orders',
        ]);

        // Customer role - view products and manage own orders
        $customerRole = Role::create(['name' => 'customer']);
        $customerRole->givePermissionTo([
            'view-brands',
            'view-products',
            'view-categories',
            'view-collections',
            'view-orders',
        ]);

        // Moderator role - manage content but not users
        $moderatorRole = Role::create(['name' => 'moderator']);
        $moderatorRole->givePermissionTo([
            'view-brands',
            'edit-brand',
            'view-products',
            'edit-product',
            'delete-product',
            'view-categories',
            'manage-categories',
            'view-collections',
            'manage-collections',
            'view-options',
            'manage-options',
            'view-users',
            'view-orders',
            'manage-orders',
        ]);
    }
}
