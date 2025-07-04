
require('dotenv').config();

// Ejecutar deploy-commands.js automáticamente al iniciar index.js
const { exec } = require('child_process');
exec('node deploy-commands.js', (error, stdout, stderr) => {
    if (error) {
        console.error(`Error al desplegar comandos: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`stderr: ${stderr}`);
    }
    if (stdout) {
        console.log(`stdout: ${stdout}`);
    }
});

const { Client, GatewayIntentBits, Collection } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

client.commands = new Collection();

// Configurar el cliente de música
require('./music.js')(client);

// Crear la carpeta handlers si no existe
const fs = require('fs');
if (!fs.existsSync('./handlers')) {
    fs.mkdirSync('./handlers');
}

// Crear los archivos de handlers básicos si no existen
const eventHandlerContent = `
module.exports = (client) => {
    client.on('ready', () => {
        console.log('Bot está listo!');
    });

    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Hubo un error al ejecutar este comando!', ephemeral: true });
        }
    });
};
`;

const commandHandlerContent = `
const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const commandsPath = path.join(__dirname, '..', 'Commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log('[WARNING] El comando en ' + filePath + ' no tiene las propiedades requeridas "data" y "execute".');
        }
    }
};
`;

if (!fs.existsSync('./handlers/eventHandler.js')) {
    fs.writeFileSync('./handlers/eventHandler.js', eventHandlerContent);
}

if (!fs.existsSync('./handlers/commandHandler.js')) {
    fs.writeFileSync('./handlers/commandHandler.js', commandHandlerContent);
}

// Cargar los handlers
require('./handlers/eventHandler.js')(client);
require('./handlers/commandHandler.js')(client);

client.login(process.env.TOKEN);