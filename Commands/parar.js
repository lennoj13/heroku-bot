const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('p')
        .setDescription('Detiene la reproducción de música'),
    async execute(interaction, client, kazagumo = client.kazagumo) {
        const { guild } = interaction;
        const player = kazagumo.players.get(guild.id);
        await interaction.deferReply({ ephemeral: false });
        if (!player) return interaction.editReply('No se está reproduciendo nada');
        player.destroy();
        return interaction.editReply('Se ha detenido la reproducción');
    },
};
