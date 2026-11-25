# Cuaderno de 6to Aniversario (con Editor `/admin` sin base de datos)

Proyecto web liviano hecho con **Node.js puro (cero dependencias, no necesita `npm install` ni Docker)**.
Todos los textos fijos, Polaroids y pistas de los 6 regalos se guardan en un archivo físico: `data/album.json` (con respaldo automático `data/album.backup.json` en cada guardado).

## 1. Cómo correrlo localmente
```bash
node server.js
```
- **Cuaderno:** http://localhost:4321
- **Panel de edición:** http://localhost:4321/admin
- **PIN inicial de demo:** `2511` *(podés cambiarlo desde `/admin` -> `🔐 Cambiar PIN` o editando `data/admin-config.json`)*

## 2. Cómo cargar tus fotos, videos y música
1. Guardá tus fotos (`.jpg`, `.webp`, `.png`) y videos (`.mp4`) en `media/anio-1/` hasta `media/anio-6/`.
   - *(Opcional)* Guardá su canción en `media/cancion.mp3`.
2. Entrá a `/admin` con tu PIN y editá los títulos, historias, mensajes ocultos, contraseñas/pistas de los 6 regalos y rutas de fotos/videos. Al tocar **💾 Guardar cambios**, se actualiza `data/album.json` al instante en vivo.

## 3. Cómo desplegarlo en tu VPS de Hostinger (sin Docker)

### Paso 1: Subir la carpeta al VPS
```bash
scp -r ./cuaderno-6-anios usuario@TU_IP_VPS:/var/www/6-aniversario
```

### Paso 2: Dejarlo corriendo en segundo plano (sin `npm install`)
Con **PM2** (recomendado):
```bash
cd /var/www/6-aniversario
PORT=4321 pm2 start server.js --name 6-aniversario
pm2 save
```
*(Si preferís fijar el PIN por variable de entorno: `PORT=4321 ADMIN_PIN=tu-pin pm2 start server.js --name 6-aniversario`)*

### Paso 3: Conectar tu dominio con Nginx + SSL gratis
Copiá `nginx.conf` a `/etc/nginx/sites-available/6-aniversario`, reemplazá `tu-dominio.com` y ejecutá:
```bash
sudo ln -s /etc/nginx/sites-available/6-aniversario /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d tu-dominio.com
```
