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
  console.error("❌ No se encontró el token. Verifica las variables de entorno en Heroku.");
  process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

client.commands = new Collection();

// Cargar comandos de música
require('./music.js')(client);

// Crear carpeta handlers si no existe
if (!fs.existsSync('./handlers')) {
    fs.mkdirSync('./handlers');
}

// Crear handlers si no existen
if (!fs.existsSync('./handlers/eventHandler.js')) {
    fs.writeFileSync('./handlers/eventHandler.js', `...`);
}
if (!fs.existsSync('./handlers/commandHandler.js')) {
    fs.writeFileSync('./handlers/commandHandler.js', `...`);
}

// Cargar handlers
require('./handlers/eventHandler.js')(client);
require('./handlers/commandHandler.js')(client);

// Iniciar sesión en Discord
client.login(process.env.TOKEN);
