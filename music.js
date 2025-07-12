
const { Kazagumo, Plugins } = require('kazagumo');
const { Connectors } = require('shoukaku');


const nodes = [
    {
        name: 'CharlesNaig',
        url: 'lavahatry4.techbyte.host:3000',
        auth: 'NAIGLAVA-dash.techbyte.host',
        secure: false,
    },
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

    kazagumo.shoukaku.on('ready', (name) => console.log(`Lavalink ${name}: Ready!`));
    kazagumo.shoukaku.on('error', (name, error) => console.error(`Lavalink ${name}: Error`, error));
    kazagumo.shoukaku.on('close', (name, code, reason) => console.warn(`Lavalink ${name}: Closed`, { code, reason }));
    kazagumo.shoukaku.on('disconnect', (name, players, moved) => {
        if (moved) return;
        players.map(player => player.connection.disconnect());
        console.warn(`Lavalink ${name}: Disconnected`);
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