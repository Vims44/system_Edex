<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
{
    /**
     * Преобразует модель в массив для JSON.
     * Здесь мы контролируем, какие поля отдаём наружу.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'name'            => $this->name,
            'surname'         => $this->surname,
            'patronymic'      => $this->patronymic,
            'full_name'       => trim("{$this->surname} {$this->name} {$this->patronymic}"),
            'group_id'        => $this->group_id,
            'photo'           => $this->photo,
            'birth_date'      => $this->birth_date?->format('Y-m-d'),
            'enrollment_date' => $this->enrollment_date?->format('Y-m-d'),
            'status'          => $this->status,
        ];
    }
}