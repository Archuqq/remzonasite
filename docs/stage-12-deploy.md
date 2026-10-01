# Этап 12 — Деплой приложения без СУБД

## Что подготовить

Нужен VPS или хостинг с Node.js 20+, долгоживущим Node-процессом, HTTPS/reverse proxy и writable persistent-каталогами. PHP-only виртуальный хостинг не подходит. PostgreSQL, MySQL и phpMyAdmin этому приложению не требуются.

Создайте постоянные каталоги вне папки релиза и выдайте доступ пользователю приложения:

```bash
sudo install -d -o remzona -g remzona -m 0750 /var/www/remzona/data
sudo install -d -o remzona -g remzona -m 0750 /var/www/remzona/uploads
sudo install -d -o root -g root -m 0700 /etc/remzona
sudo install -d -o remzona -g remzona -m 0750 /var/backups/remzona
```

Файл `/etc/remzona/remzona.env` (права `0600`):

```env
NODE_ENV=production
SESSION_SECRET=СЛУЧАЙНАЯ_СТРОКА_НЕ_КОРОЧЕ_32_СИМВОЛОВ
ADMIN_LOGIN=admin
ADMIN_PASSWORD=ДЛИННЫЙ_УНИКАЛЬНЫЙ_ПАРОЛЬ_ДЛЯ_ПЕРВОГО_SEED
DATA_DIR=/var/www/remzona/data
UPLOADS_DIR=/var/www/remzona/uploads
SITE_URL=https://ваш-домен.ru
```

`ADMIN_PASSWORD` используется только при создании отсутствующего `admin.json`. После первого входа смените пароль через админку. `SESSION_SECRET` сгенерируйте, например, `openssl rand -base64 48`.

## Установка и обновление

Установите Node.js 20 LTS или новее, Nginx и Certbot, загрузите проект в `/var/www/remzona/current`, затем выполните от пользователя приложения:

```bash
cd /var/www/remzona/current
npm ci
npm run data:seed
npm run build
```

Обновление приложения:

```bash
cd /var/www/remzona/current
git pull
npm ci
npm run build
sudo systemctl restart remzona
sudo systemctl status remzona
```

Не удаляйте `DATA_DIR` и `UPLOADS_DIR` при обновлении релиза.

## systemd

`/etc/systemd/system/remzona.service`:

```ini
[Unit]
Description=РЕМЗОНА Next.js application
After=network.target

[Service]
Type=simple
User=remzona
Group=remzona
WorkingDirectory=/var/www/remzona/current
EnvironmentFile=/etc/remzona/remzona.env
ExecStart=/usr/bin/npm run start -- --hostname 127.0.0.1 --port 3000
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Проверьте путь к npm через `command -v npm`, затем включите сервис и смотрите логи:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now remzona
sudo journalctl -u remzona -f
```

## Nginx и HTTPS

Замените домен и сертификатные пути в конфигурации:

```nginx
server {
    listen 80;
    server_name ваш-домен.ru www.ваш-домен.ru;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ваш-домен.ru www.ваш-домен.ru;

    ssl_certificate /etc/letsencrypt/live/ваш-домен.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ваш-домен.ru/privkey.pem;
    client_max_body_size 12m;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript application/xml image/svg+xml;

    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    add_header X-Frame-Options SAMEORIGIN always;

    location ^~ /uploads/ {
        alias /var/www/remzona/uploads/;
        autoindex off;
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        add_header X-Content-Type-Options nosniff always;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
    }
}
```

Настройте DNS на сервер, получите сертификат `sudo certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru`, затем проверьте `sudo nginx -t && sudo systemctl reload nginx`. Не включайте CSP до отдельной проверки внешних карты и iframe отзывов Яндекса.

## Резервные копии

Ежедневно архивируйте `data/` и `uploads/`. Пример `/usr/local/bin/backup-remzona.sh`:

```sh
#!/bin/sh
set -eu
backup_dir=/var/backups/remzona
stamp=$(date -u +%Y%m%dT%H%M%SZ)
tar -czf "$backup_dir/remzona-$stamp.tar.gz" -C /var/www/remzona data uploads
find "$backup_dir" -type f -name 'remzona-*.tar.gz' -mtime +14 -delete
```

Назначьте скрипту владельца root и права `0700`; добавьте в root crontab запуск `15 3 * * * /usr/local/bin/backup-remzona.sh`. Для восстановления остановите приложение и распакуйте архив из `/var/backups/remzona` в `/var/www/remzona`, проверьте владельца и права, затем запустите сервис.

## Проверки после выпуска

- HTTPS и публичная главная доступны; `/admin` требует входа.
- Без сессии `/api/admin/*` отвечает `401`; вход и смена пароля работают.
- Настройки и услуги переживают рестарт процесса; фото загружаются и отдаются Nginx.
- Карта, отзывы, ссылки `tel:`, sitemap и robots проверены на боевом домене.
- Создан backup `data/` + `uploads/`, тестовое восстановление проверено.

Хранилище рассчитано на один Node.js-процесс на одном сервере. Для нескольких реплик потребуется общее хранилище или отдельная СУБД.