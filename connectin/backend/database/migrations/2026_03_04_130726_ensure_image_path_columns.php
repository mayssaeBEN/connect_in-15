<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // POSTS
        Schema::table('posts', function (Blueprint $table) {
            if (!Schema::hasColumn('posts', 'image_path')) {
                $table->string('image_path')->nullable()->after('content');
            }
        });

        // COMMENTS
        Schema::table('comments', function (Blueprint $table) {
            if (!Schema::hasColumn('comments', 'image_path')) {
                $table->string('image_path')->nullable()->after('content');
            }
        });
    }

    public function down(): void
    {
        // down safe (si la colonne existe)
        Schema::table('posts', function (Blueprint $table) {
            if (Schema::hasColumn('posts', 'image_path')) {
                $table->dropColumn('image_path');
            }
        });

        Schema::table('comments', function (Blueprint $table) {
            if (Schema::hasColumn('comments', 'image_path')) {
                $table->dropColumn('image_path');
            }
        });
    }
}; 