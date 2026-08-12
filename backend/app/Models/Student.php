<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    /**
     * Таблица в базе.
     * Laravel по умолчанию ищет "students" — у нас так и есть.
     */
    protected $table = 'students';

    /**
     * Отключаем timestamps (created_at / updated_at),
     * потому что в твоей таблице их нет.
     */
    public $timestamps = false;

    /**
     * Поля, которые можно массово заполнять.
     */
    protected $fillable = [
        'name',
        'surname',
        'patronymic',
        'group_id',
        'photo',
        'birth_date',
        'enrollment_date',
        'status',
    ];

    /**
     * Приведение типов.
     */
    protected $casts = [
        'birth_date' => 'date',
        'enrollment_date' => 'date',
    ];
}