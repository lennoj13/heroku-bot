const { REST, Routes } = require('discord.js');
require('dotenv').config();

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
    try {
        // Borra comandos globales
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] });
        console.log('Comandos globales eliminados.');

        // Borra comandos del servidor específico
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: [] });
        console.log('Comandos del servidor eliminados.');
    } catch (error) {
        console.error(error);
    }
})();
