const crypto = require('crypto');

const wsClients = new Map();

const sendMessage = (senderId, receiverId, msg, ws) => {
    const client = [...wsClients].find(([_client, metadata]) => metadata.id == receiverId)[0];
    const message = { 
        type: 'message',
        msg: msg,
        senderId: senderId
    };

    if (client.readyState === ws.OPEN) {
        client.send(JSON.stringify(message));
    }
}

const broadcastClients = (ws) => {
    const clients = [];
    wsClients.forEach((metadata, _client) => {
        clients.push({ 
            id: metadata.id, 
            color: metadata.color 
        });
    });

    wsClients.forEach((metadata, client) => {
        if (client.readyState === ws.OPEN) {
            const message = { 
                type: 'clients', 
                msg: clients.filter(client => client.id != metadata.id),
                senderId: 'server'
            };
            client.send(JSON.stringify(message));
        }
    });
}

module.exports = (ws, wss) => {
    wss.on('connection', (client) => {
        const id = crypto.randomUUID();
        const color = Math.floor(Math.random() * 0xFFFFFF);
        const metadata = { id, color };

        wsClients.set(client, metadata);

        client.on('message', (data) => { 
            const message = JSON.parse(data);
            const metadata = wsClients.get(client);

            message.sender = metadata.id;
            message.color = metadata.color;

            sendMessage(id, message.id, message.msg, ws);
        });

        client.on('close', () => {
            wsClients.delete(client);
            broadcastClients(ws);
        });
    
        client.send(JSON.stringify({ 
            type: 'serverMessage', 
            msg: `Welcome! Your id is: ${id}`, 
            senderId: 'server' 
        }));

        broadcastClients(ws);
    });
}