<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::statement("
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
                    CREATE TYPE task_priority AS ENUM ('low','medium','high');
                END IF;

                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
                    CREATE TYPE task_status AS ENUM ('pending','in_progress','completed','overdue');
                END IF;
            END
            $$;
        ");
    }

    public function down(): void
    {
        DB::statement("DROP TYPE task_status");
        DB::statement("DROP TYPE task_priority");
    }
};