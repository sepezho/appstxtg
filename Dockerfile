# Используем официальный Node.js образ для установки зависимостей и сборки проекта
FROM node:18-alpine AS build

# Устанавливаем рабочую директорию для проекта
WORKDIR /app

# Копируем package.json и package-lock.json для установки зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем все остальные файлы проекта
COPY . .

# Строим проект (обычно npm run build для продакшн-сборки)
RUN npm run build

# Используем легковесный образ Nginx для обслуживания файлов
FROM nginx:alpine

# Копируем результат сборки из первого этапа в директорию Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Экспонируем порт 80 для HTTP трафика
EXPOSE 80

# Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"]
