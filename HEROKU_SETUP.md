# Configuración para Heroku
# 
# Ejecuta estos comandos en tu terminal después de crear la app en Heroku:
#
# heroku config:set TOKEN=tu_token_del_bot_aqui
# heroku config:set CLIENT_ID=tu_client_id_aqui
#
# Luego registra los comandos:
# heroku run npm run deploy
#
# Variables requeridas:
# TOKEN - El token de tu bot de Discord (desde https://discord.com/developers/applications)
# CLIENT_ID - El ID de tu aplicación de Discord (Application ID)
#
# Opcional:
# PORT - Puerto del servidor (Heroku lo asigna automáticamente)

# Para obtener tu TOKEN y CLIENT_ID:
# 1. Ve a https://discord.com/developers/applications
# 2. Selecciona tu aplicación/bot
# 3. En "General Information" encontrarás el APPLICATION ID (CLIENT_ID)
# 4. En "Bot" encontrarás el TOKEN (botón "Reset Token" si es necesario)
