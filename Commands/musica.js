const { SlashCommandBuilder, ChatInputCommandInteraction, Client } = require('discord.js');
const { Kazagumo } = require('kazagumo');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('m')
        .setDescription('Reproduce música')
        .addStringOption(option =>
            option
                .setName('cancion')
                .setDescription('Nombre o enlace de la canción')
                .setRequired(true)
        ),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Kazagumo} [kazagumo=client.kazagumo]
     * @param {Client} client
     */
    async execute(interaction, client, kazagumo = client.kazagumo) {
        const { options, member, channel, guild, user } = interaction;
        let player;

        let query = options.getString('cancion');
        if (!query && interaction.options._hoistedOptions && interaction.options._hoistedOptions.length > 0) {
            query = interaction.options._hoistedOptions[0].value;
        }

        const voiceChannel = member.voice.channel;
        if (!voiceChannel) return interaction.reply('No se ha encontrado un canal de voz');

        await interaction.deferReply();

        try {
            player = await kazagumo.createPlayer({
                guildId: guild.id,
                textId: channel.id,
                voiceId: voiceChannel.id,
            });

            // Ensordecer al bot al unirse con un pequeño retraso
            setTimeout(async () => {
                try {
                    await voiceChannel.guild.members.me.voice.setDeaf(true);
                } catch (e) {
                    // Silenciar el error si no se puede ensordecer
                }
            }, 1000); // 1 segundo de retraso

            let result = await kazagumo.search(query, { requester: user });

            if (!result.tracks.length) return interaction.editReply('No se han encontrado resultados');

            // Añadir a la cola (playlist o canción individual)
            if (result.type === 'PLAYLIST') player.queue.add(result.tracks);
            else player.queue.add(result.tracks[0]);

            // Si no está reproduciendo, inicia la reproducción
            if (!player.playing && !player.paused) player.play();

            await interaction.editReply({
                content: result.type === 'PLAYLIST' ? `Se ha agregado a la lista ${result.playlistName}` : `Se ha agregado a la lista ${result.tracks[0].title}`
            });

            // Desconectar si no hay música en 3 minutos (solo si no está ya programado)
            if (player.disconnectTimeout) clearTimeout(player.disconnectTimeout);
            player.disconnectTimeout = setTimeout(() => {
                if (!player.playing && (!player.queue || player.queue.length === 0)) {
                    player.destroy();
                }
            }, 180000); // 3 minutos
        } catch (error) {
            console.log(error);
            try {
                await interaction.editReply('Hubo un error al ejecutar este comando!');
            } catch (e) {}
        }
    },
};