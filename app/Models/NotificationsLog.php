<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationsLog extends Model
{
    protected $fillable = ['user_id', 'task_id', 'reminder_id', 'status', 'message', 'sent_at'];
}