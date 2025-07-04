
module.exports = (client) => {
    client.on('ready', () => {
        console.log('Bot está listo!');
    });

    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(error);
            try {
                await interaction.reply({ content: 'Hubo un error al ejecutar este comando!', flags: 64 });
            } catch (e) {
                // Ya se respondió o expiró la interacción
            }
        }
    });
};
