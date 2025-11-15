<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('project_copy_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('original_project_id')->constrained('projects');
            $table->foreignId('copied_by_user_id')->constrained('users');
            $table->foreignId('new_project_id')->constrained('projects');
            $table->timestampTz('copied_at');
            $table->softDeletesTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_copy_log');
    }
};