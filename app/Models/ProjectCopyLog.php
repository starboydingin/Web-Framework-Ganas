<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectCopyLog extends Model
{
    protected $fillable = ['original_project_id', 'copied_by_user_id', 'new_project_id', 'copied_at'];
}