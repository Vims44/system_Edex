# ЭДЕКС - Система выявления академических рисков 

Веб-система для вычисления и мониторинга академических рисков студентов.

**Стек:** Vue.js · PHP 8.2 · MySQL 8.0 · Docker

## Первый запуск 
### 1. Клонировать репозиторий
```bash
git clone https://github.com/Vims44/system_AYR.git
cd system_AYR
```
### 2. Создать файл с паролями
```bash
cp .env.example .env
```
Открыть `.env` и заполнить пароли 
```
### 3. Запустить бэкенд, фронтенд и базу данных
```bash
docker-compose up -d --build
```

### Адреса в браузере
| Фронтенд | http://localhost:5173 |
| Бэкенд (PHP) | http://localhost:8000 |
| БД (MySQL) | localhost:3306 |

### Остановить проект
```bash
docker-compose down
```

## Получить изменения от команды
```bash
git pull origin main
```