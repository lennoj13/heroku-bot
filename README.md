# 🎵 Bot de Discord - Reproductor de Música

Bot de Discord con funcionalidades de música usando Lavalink.

## 🚀 Comandos Disponibles

- `/m [canción]` - Reproduce música de YouTube
- `/p` - Para la música y desconecta el bot

## 🔧 Configuración

### Variables de Entorno Requeridas

```env
TOKEN=tu_token_del_bot_aqui
CLIENT_ID=tu_client_id_aqui
```

### Instalación Local

1. Clona el repositorio
2. Ejecuta `npm install`
3. Crea un archivo `.env` con tus tokens (usa `.env.example` como referencia)
4. Ejecuta `npm run deploy` para registrar los comandos
5. Ejecuta `npm start` para iniciar el bot

## 🩺 Diagnóstico

Si el bot no reproduce música, ejecuta:

```bash
npm run check
```

Esto verificará el estado de los servidores Lavalink.

## 🌐 Despliegue en Heroku

1. Configura las variables de entorno en Heroku:
   - `TOKEN`: Token de tu bot de Discord
   - `CLIENT_ID`: ID de tu aplicación de Discord

2. Despliega el código

3. Ejecuta el comando de registro de comandos:
   ```bash
   heroku run npm run deploy
   ```

## 🛠️ Solución de Problemas

### El bot no responde
- Verifica que el bot esté en línea
- Asegúrate de que los comandos estén registrados (`npm run deploy`)
- Verifica las variables de entorno

### El bot no reproduce música
- Ejecuta `npm run check` para verificar los servidores Lavalink
- Asegúrate de estar en un canal de voz
- Verifica que el bot tenga permisos para conectarse y hablar en el canal

### Errores de conexión
- Los servidores Lavalink pueden estar temporalmente inactivos
- El bot intentará usar servidores alternativos automáticamente

## 📝 Logs

El bot muestra logs detallados para facilitar el diagnóstico:
- ✅ Conexiones exitosas
- ❌ Errores y problemas
- 🎵 Actividad del reproductor
