const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('p')
        .setDescription('Detiene la reproducción de música'),
    async execute(interaction, client, kazagumo = client.kazagumo) {
        const { guild } = interaction;
        const player = kazagumo.players.get(guild.id);
        await interaction.deferReply({ flags: 0 });
        if (!player) return interaction.editReply('No se está reproduciendo nada');
        if (player.destroyed) {
            return interaction.editReply('El reproductor ya estaba detenido.');
        }
        if (player.disconnectTimeout) {
            clearTimeout(player.disconnectTimeout);
            player.disconnectTimeout = null;
        }
        try {
            player.destroy();
        } catch (e) {
            console.error('Error al destruir el player en /p:', e.message);
            return interaction.editReply('Hubo un error al detener el reproductor (ya estaba destruido).');
        }
        return interaction.editReply('Se ha detenido la reproducción');
    },
};
