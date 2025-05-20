# Используем Node.js образ
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /usr/src/app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы
COPY . .

# Генерируем Prisma Client
RUN npx prisma generate

# Собираем приложение
RUN npm run build



# Указываем порт
EXPOSE 5000

# Выполняем миграции и запускаем приложение
CMD ["sh", "-c", "npx prisma migrate reset --force && npx prisma migrate deploy && npm run seed && node dist/src/main"]
