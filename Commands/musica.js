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
        if (!voiceChannel) {
            return interaction.reply({ 
                content: '❌ Debes estar en un canal de voz para usar este comando.', 
                ephemeral: true 
            });
        }

        // Verificar permisos del bot en el canal de voz
        if (!voiceChannel.permissionsFor(guild.members.me).has(['Connect', 'Speak'])) {
            return interaction.reply({
                content: '❌ No tengo permisos para conectarme o hablar en tu canal de voz.',
                ephemeral: true
            });
        }

        await interaction.deferReply();

        try {
            try {
                player = await kazagumo.createPlayer({
                    guildId: guild.id,
                    textId: channel.id,
                    voiceId: voiceChannel.id,
                });
            } catch (playerError) {
                console.error('Error creando el player:', playerError);
                try { await interaction.editReply('No se pudo crear el reproductor.'); } catch (e) {}
                return;
            }

            // Ensordecer al bot al unirse con un pequeño retraso
            setTimeout(async () => {
                try {
                    await voiceChannel.guild.members.me.voice.setDeaf(true);
                } catch (e) {
                    // Silenciar el error si no se puede ensordecer
                }
            }, 1000); // 1 segundo de retraso

            // Verificar que Lavalink esté conectado
            if (!kazagumo || !kazagumo.shoukaku || kazagumo.shoukaku.nodes.size === 0) {
                try { 
                    await interaction.editReply('❌ El servicio de música no está disponible. Inténtalo más tarde.'); 
                } catch (e) {}
                return;
            }

            let result;
            // Buscar música con diferentes fuentes como respaldo
            try {
                // Primero intentar YouTube
                result = await kazagumo.search(query, { requester: user, engine: 'youtube' });
                
                // Si no encuentra en YouTube, intentar con YouTube Music
                if (!result || !result.tracks || result.tracks.length === 0) {
                    result = await kazagumo.search(query, { requester: user, engine: 'ytmsearch' });
                }
                
                // Si aún no encuentra, intentar búsqueda general
                if (!result || !result.tracks || result.tracks.length === 0) {
                    result = await kazagumo.search(query, { requester: user });
                }
            } catch (searchError) {
                console.error('Error buscando la canción:', searchError);
                try { 
                    await interaction.editReply('❌ Error al buscar la canción. Verifica tu conexión e inténtalo de nuevo.'); 
                } catch (e) {}
                return;
            }

            if (!result || !result.tracks || !result.tracks.length) {
                try { 
                    await interaction.editReply(`❌ No se encontraron resultados para: **${query}**\n💡 Intenta con un nombre más específico.`); 
                } catch (e) {}
                return;
            }

            // Añadir a la cola (playlist o canción individual)
            try {
                if (result.type === 'PLAYLIST') player.queue.add(result.tracks);
                else player.queue.add(result.tracks[0]);
            } catch (queueError) {
                console.error('Error añadiendo a la cola:', queueError);
                try { await interaction.editReply('No se pudo añadir la canción a la cola.'); } catch (e) {}
                return;
            }

            // Limpiar cualquier timeout anterior antes de crear un nuevo player
            if (player && player.disconnectTimeout) {
                clearTimeout(player.disconnectTimeout);
                player.disconnectTimeout = null;
            }
            // Si no está reproduciendo, inicia la reproducción
            try {
                if (player.disconnectTimeout) {
                    clearTimeout(player.disconnectTimeout);
                    player.disconnectTimeout = null;
                }
                if (!player.playing && !player.paused) player.play();
            } catch (playError) {
                console.error('Error al intentar reproducir:', playError);
                try { await interaction.editReply('No se pudo iniciar la reproducción.'); } catch (e) {}
                return;
            }

            // Mostrar portada (solo la de YouTube) y resaltar el nombre en verde
            try {
                const track = result.type === 'PLAYLIST' ? result.tracks[0] : result.tracks[0];
                await interaction.editReply({
                    content: result.type === 'PLAYLIST' ? `Se ha agregado la playlist **${result.playlistName}**` : `Se ha agregado **${track.title}** a la lista` ,
                    embeds: [
                        {
                            title: track.title,
                            url: track.uri,
                            description: `Artista: ${track.author}`,
                            thumbnail: { url: track.thumbnail },
                            color: 0x1DB954 // Verde Spotify
                        }
                    ]
                });
            } catch (replyError) {
                console.error('Error enviando respuesta de éxito:', replyError);
            }

            // Desconectar si no hay música en 3 minutos (solo si no está ya programado)
            try {
                if (player.disconnectTimeout) clearTimeout(player.disconnectTimeout);
                player.disconnectTimeout = setTimeout(() => {
                    // Solo destruir si el player sigue activo y no está tocando ni tiene cola
                    if (
                        player &&
                        !player.playing &&
                        (!player.queue || player.queue.length === 0)
                    ) {
                        if (player.destroyed) {
                            console.warn('Intento de destruir un player que ya estaba destruido (timeout comando musica)');
                            return;
                        }
                        try {
                            player.destroy();
                        } catch (e) {
                            console.error("Error al destruir el player (probablemente ya destruido):", e.message);
                            // No hacer nada más, solo evitar que el bot se caiga
                        }
                    }
                }, 180000); // 3 minutos
            } catch (timeoutError) {
                console.error('Error programando timeout de desconexión:', timeoutError);
            }
        } catch (error) {
            console.error('Error general en el comando /m:', error);
            try {
                await interaction.editReply('Hubo un error al ejecutar este comando!');
            } catch (e) {}
        }
    },
};