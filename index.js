// ❌ NO NECESARIO EN HEROKU (solo para desarrollo local)
require('dotenv').config();
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot activo');
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');

// Verificar que se haya recibido el token
if (!process.env.TOKEN) {
  console.error("❌ No se encontró el TOKEN. Verifica las variables de entorno.");
  console.error("Variables disponibles:", Object.keys(process.env).filter(key => key.includes('TOKEN') || key.includes('CLIENT')));
  process.exit(1);
}

if (!process.env.CLIENT_ID) {
  console.error("❌ No se encontró el CLIENT_ID. Verifica las variables de entorno.");
  process.exit(1);
}

console.log("✅ Variables de entorno cargadas correctamente");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

client.commands = new Collection();

console.log("🎵 Cargando sistema de música...");
// Cargar comandos de música
require('./music.js')(client);

// Crear carpeta handlers si no existe
if (!fs.existsSync('./handlers')) {
    fs.mkdirSync('./handlers');
}

console.log("📁 Cargando handlers...");
// Cargar handlers
require('./handlers/eventHandler.js')(client);
require('./handlers/commandHandler.js')(client);

console.log("🔗 Conectando a Discord...");
// Iniciar sesión en Discord
client.login(process.env.TOKEN)
    .then(() => {
        console.log("✅ Login exitoso");
    })
    .catch(error => {
        console.error("❌ Error en login:", error);
        process.exit(1);
    });
