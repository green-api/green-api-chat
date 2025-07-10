#!/bin/bash

# Находим директорию с префиксом "assets_" в /usr/share/nginx/html/
ASSETS_DIR=$(find /usr/share/nginx/html -maxdepth 1 -type d -name 'assets_*' | head -n 1)

if [ -z "$ASSETS_DIR" ]; then
  echo "Не найдена директория assets_* в /usr/share/nginx/html/"
  exit 1
fi

echo "Найдена директория: $ASSETS_DIR"
BUILD_DIR="$ASSETS_DIR"

# Перечисляем переменные, которые хотим подставить в JS-файлы
VARIABLES="VITE_APP_API_URL"

for VAR in $VARIABLES; do
  # Получаем значение переменной окружения
  VALUE=$(printenv "$VAR")

  # Проверяем, что переменная установлена
  if [ -n "$VALUE" ]; then
    echo "Заменяю __${VAR}__ на значение '$VALUE' в JS-файлах..."
    find "$BUILD_DIR" -type f -name "*.js" | while read -r file; do
      sed -i "s|__${VAR}__|$VALUE|g" "$file"
    done
  else
    echo "Переменная \$${VAR} не задана — пропускаю."
  fi
done

nginx -g "daemon off;"