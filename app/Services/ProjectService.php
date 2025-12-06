<?php

namespace App\Services;

use App\Models\Project;
use App\Models\ProjectCopyLog;
use Carbon\Carbon;

class ProjectService
{
    public function createProject(int $userId, array $data): Project
    {
        $data['user_id'] = $userId;
        return Project::create($data);
    }
    
    public function copyProject(Project $project, int $userId): Project
    {
        $newProject = $project->replicate();
        $newProject->user_id = $userId;
        $newProject->title .= " (Copy)";
        $newProject->save();

        ProjectCopyLog::create([
            'original_project_id' => $project->id,
            'copied_by_user_id' => $userId,
            'new_project_id' => $newProject->id,
            'copied_at' => Carbon::now()
        ]);

        return $newProject;
    }

    public function updateProject(Project $project, array $data): Project
    {
        // Only allow updatable fields
        $fields = [
            'title',
            'description',
            'is_private',
        ];

        foreach ($fields as $field) {
            if (array_key_exists($field, $data)) {
                $project->{$field} = $data[$field];
            }
        }

        $project->save();

        return $project->fresh();
    }
}