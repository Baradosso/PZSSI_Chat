const ws = new WebSocket(`ws://${window.location.hostname}:6060`);

const messages = [];
var openedChat;

ws.addEventListener('open', _event => {
    $('.rounded-circle').css('background-color', 'green');
});

ws.addEventListener('close', _event => {
    $('.rounded-circle').css('background-color', 'red');
});

ws.onmessage = (data) => {
    const message = JSON.parse(data.data);

    const type = message.type;
    const msg = message.msg;
    const senderId = message.senderId;
    
    if (type == 'message') {
        messages.push({ 
            senderId: senderId, 
            msg: msg,
            by: 'Guest' 
        });
        showReceivedMessageOnOpenedChat(senderId, msg);
    } else if (type == 'clients') {
        addClients(msg);
    } else if (type == 'serverMessage') {
        onServerMessage(msg);
    }
}

const addClients = (clientsMetadata) => {
    const clientsDiv = $('#clients');
    clientsDiv.html('');

    clientsMetadata.forEach(clientMetadata => {
        const hue = '#' + clientMetadata.color.toString(16);
        const id = clientMetadata.id;

        console.log(hue);

        clientsDiv.append(`
            <div class="container row client-div" id="${id}">
                <div class="color-dot" id="circle${id}"></div>
                <h5 class="col">${id}</h5>
            </div>
        `);

        $(`#circle${id}`).css('background-color', hue);
        onOpenChat(id);
    });
    onOpenChat();
}

const onOpenChat = (clientId) => {
    $(`#${clientId}`).on('click', () => {
        const chats = $('#chats');

        chats.html(`
            <h6>Conversation with: ${clientId}</h6>
            <div class="row" id="chat" data-value="${clientId}">
                <div id="chatMessages">
                </div>
            </div>
            <form id="msgForm" class="row">
                <input type="text" id="inputBox" placeholder="Send message..." />
            </form>
        `);
        
        messages.filter(message => message.senderId == clientId).forEach(message => {
            $('#chatMessages').append(`
                <div class="row">${message.by}: ${message.msg}</div>
            `);
        })

        $('#msgForm').on('submit', (event) => {
            event.preventDefault();
            const msg = $('#inputBox').val();
            const message = { 
                msg: msg, 
                id: clientId 
            };

            messages.push({ 
                senderId: clientId, 
                msg: msg,
                by: 'You' 
            });

            ws.send(JSON.stringify(message));
            document.getElementById('inputBox').value = ''

            showSendMessageOnOpenedChat(msg);
        })

        scrollDownChat();
    });
}

const showReceivedMessageOnOpenedChat = (senderId, msg) => {
    if ($('#chat').data('value') == senderId) {
        $('#chatMessages').append(`
            <div class="row">Guest: ${msg}</div>
        `);
        scrollDownChat();
    }
}

const showSendMessageOnOpenedChat = (msg) => {
    $('#chatMessages').append(`
        <div class="row">You: ${msg}</div>
    `);
    scrollDownChat();
}

const onServerMessage = (msg) => {
    $('#server-messages').append(`
        <div class="row">${msg}</div>
    `);
}

const scrollDownChat = () => {
    $("#chat").scrollTop(function() { return this.scrollHeight; });
}