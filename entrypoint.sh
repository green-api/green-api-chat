#!/bin/bash
BUILD_DIR="/usr/share/nginx/html/assets_0.0.59"

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