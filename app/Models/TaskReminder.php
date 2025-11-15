<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaskReminder extends Model
{
    protected $fillable = ['task_id', 'remind_at', 'is_sent', 'sent_at'];

    public function task() {
        return $this->belongsTo(Task::class);
    }
}