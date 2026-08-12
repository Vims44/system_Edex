<?php

use App\Http\Controllers\Api\StudentController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Здесь регистрируются все API-эндпоинты.
| Laravel автоматически добавляет префикс /api
|
*/

Route::get('/students', [StudentController::class, 'index']);