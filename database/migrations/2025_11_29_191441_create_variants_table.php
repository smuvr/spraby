<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('sku')->unique();
            $table->decimal('price', 12, 2)->unsigned();
            $table->decimal('compare_price', 12, 2)->unsigned()->nullable();
            $table->decimal('cost_price', 12, 2)->unsigned()->nullable();
            $table->unsignedInteger('quantity')->default(0);
            $table->boolean('is_available')->default(true);
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            // Indexes
            $table->index('product_id');
            $table->index('is_available');
            $table->index('quantity');
            $table->index(['product_id', 'is_default']);
            $table->index(['product_id', 'is_available']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('variants');
    }
};
