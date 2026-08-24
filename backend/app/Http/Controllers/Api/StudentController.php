<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StudentResource;
use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    /**
     * GET /api/students
     * Получить список всех студентов.
     *
     * Поддерживает пагинацию: ?page=1&per_page=20
     */
    public function index(Request $request)
    {
        // Сколько записей на страницу (по умолчанию 20, максимум 100)
        $perPage = min((int) $request->query('per_page', 20), 100);

        $students = Student::query()
            ->orderBy('surname')
            ->orderBy('name')
            ->paginate($perPage);

        return StudentResource::collection($students);
    }
}