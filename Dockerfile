FROM php:8.4-apache

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libzip-dev \
    zip \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Установка PHP-расширения 
RUN docker-php-ext-install \
    pdo \
    pdo_mysql \
    zip \
    gd

# Включение mod_rewrite для красивых URL
RUN a2enmod rewrite

# Копируем наш конфиг Apache
COPY ./docker/apache.conf /etc/apache2/sites-available/000-default.conf

# Рабочая директория
WORKDIR /var/www/html

EXPOSE 80
