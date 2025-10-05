
const { Kazagumo, Plugins } = require('kazagumo');
const { Connectors } = require('shoukaku');


const nodes = [
    {
        name: 'RY4N',
        url: 'mine.visionhost.cloud:2002',
        auth: 'youshallnotpass',
        secure: false,
    },
    {
        name: 'Serenetia-LDP-NonSSL',
        url: 'lavalink.serenetia.com:80',
        auth: 'https://dsc.gg/ajidevserver',
        secure: false,
    },
    {
        name: 'Lavalink1',
        url: 'lava-v3.ajieblogs.eu.org:443',
        auth: 'https://dsc.gg/ajidevserver',
        secure: true,
    },
    {
        name: 'Lavalink2', 
        url: 'lavalink.oops.wtf:443',
        auth: 'www.freelavalink.ga',
        secure: true,
    },
    {
        name: 'Lavalink3',
        url: 'lavalink-repl.techbyte.host:443',
        auth: 'techbyte',
        secure: true,
    }
];


module.exports = (client) => {
    const kazagumo = new Kazagumo({
        defaultSearchEngine: 'youtube',
        plugins: [new Plugins.PlayerMoved(client)],
        send: (guildId, payload) => {
            const guild = client.guilds.cache.get(guildId);
            if (guild) guild.shard.send(payload);
        },
    },
    new Connectors.DiscordJS(client),
    nodes
    );

    kazagumo.shoukaku.on('ready', (name) => {
        console.log(`✅ Lavalink ${name}: Conectado y listo!`);
    });
    
    kazagumo.shoukaku.on('error', (name, error) => {
        console.error(`❌ Lavalink ${name}: Error -`, error);
    });
    
    kazagumo.shoukaku.on('close', (name, code, reason) => {
        console.warn(`⚠️ Lavalink ${name}: Conexión cerrada`, { code, reason });
    });
    
    kazagumo.shoukaku.on('disconnect', (name, players, moved) => {
        if (moved) return;
        players.map(player => {
            try {
                player.connection.disconnect();
            } catch (e) {
                console.error('Error desconectando player:', e.message);
            }
        });
        console.warn(`⚠️ Lavalink ${name}: Desconectado`);
    });

    kazagumo.on('playerCreate', (player) => {
        console.log(`🎵 Player creado para el servidor: ${player.guildId}`);
    });

    kazagumo.on('playerDestroy', (player) => {
        console.log(`🛑 Player destruido para el servidor: ${player.guildId}`);
    });

    client.kazagumo = kazagumo;

    // Manejo global de fin de canción y desconexión automática
    kazagumo.on('playerEnd', (player) => {
        // Solo iniciar el timeout de desconexión si la cola está vacía
        if (!player.queue || player.queue.length === 0) {
            if (player.disconnectTimeout) clearTimeout(player.disconnectTimeout);
            player.disconnectTimeout = setTimeout(() => {
                // Solo destruir si el player sigue activo y no está tocando ni tiene cola
                if (
                    player &&
                    !player.playing &&
                    (!player.queue || player.queue.length === 0)
                ) {
                    if (player.destroyed) {
                        console.warn('Intento de destruir un player que ya estaba destruido (timeout global)');
                        return;
                    }
                    try {
                        player.destroy();
                    } catch (e) {
                        console.error('Error al destruir el player en timeout global:', e.message);
                    }
                }
            }, 180000); // 3 minutos
        }
    });
};