# Stage 1: build the React front (resources/front -> public/feed)
FROM node:22-alpine AS frontend-build
WORKDIR /build
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/vite.config.js frontend/tailwind.config.js frontend/postcss.config.js ./
COPY backend/resources/front ./resources/front
COPY backend/resources/css ./resources/css
RUN npm run build

# Stage 2: Laravel app
FROM php:8.4-cli

RUN apt-get update && apt-get install -y \
    zip unzip git curl \
    libpng-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www
COPY backend/ .
COPY --from=frontend-build /build/public/feed ./public/feed

RUN composer install --no-dev --optimize-autoloader --no-interaction \
    && mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 8080
CMD ["sh", "-c", "php artisan storage:link && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8080}"]
