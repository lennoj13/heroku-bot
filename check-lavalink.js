const fetch = require('node-fetch');

const servers = [
    'mine.visionhost.cloud:2002',
    'lavalink.serenetia.com:80',
    'lava-v3.ajieblogs.eu.org:443',
    'lavalink.oops.wtf:443', 
    'lavalink-repl.techbyte.host:443'
];

async function checkServer(server) {
    try {
        const url = server.includes('443') ? `https://${server.replace(':443', '')}` : `http://${server}`;
        console.log(`Verificando: ${url}`);
        
        const response = await fetch(url, { 
            timeout: 5000,
            headers: {
                'User-Agent': 'Discord Bot Health Check'
            }
        });
        
        console.log(`✅ ${server}: ${response.status} - ${response.statusText}`);
        return true;
    } catch (error) {
        console.log(`❌ ${server}: ${error.message}`);
        return false;
    }
}

async function checkAllServers() {
    console.log("🔍 Verificando servidores Lavalink...\n");
    
    const results = [];
    for (const server of servers) {
        const result = await checkServer(server);
        results.push(result);
        console.log(''); // Línea en blanco
    }
    
    const workingServers = results.filter(r => r).length;
    console.log(`📊 Resultado: ${workingServers}/${servers.length} servidores funcionando`);
    
    if (workingServers === 0) {
        console.log("⚠️ Ningún servidor Lavalink está disponible. El bot no podrá reproducir música.");
    } else {
        console.log("✅ Al menos un servidor está funcionando. El bot debería poder reproducir música.");
    }
}

checkAllServers();
