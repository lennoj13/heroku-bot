const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'Commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[WARNING] El comando en ${filePath} no tiene las propiedades requeridas 'data' y 'execute'.`);
    }
}

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
    try {
        // Registrar comandos globalmente
        console.log(`Iniciando el registro de ${commands.length} comandos (/) globalmente.`);
        const globalData = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );
        console.log(`Se registraron exitosamente ${globalData.length} comandos (/) globalmente.`);
        // Ya no se registran comandos locales/guild

    } catch (error) {
        console.error(error);
    }
})();