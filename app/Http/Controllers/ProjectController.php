<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Project;
use App\Http\Controllers\Controller;
use App\Services\ProjectService;

class ProjectController extends Controller
{
    protected $service;

    public function __construct(ProjectService $service)
    {
        $this->service = $service;
    }

    public function copy(Request $request, Project $project)
    {
        $newProject = $this->service->copyProject($project, $request->user()->id);
        return response()->json($newProject);
    }
}