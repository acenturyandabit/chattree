var intercept = function() {
    var XHR = XMLHttpRequest.prototype;
    var send = XHR.send;
    var open = XHR.open;
    XHR.open = function(method, url) {
        this.url = url; // the request url
        return open.apply(this, arguments);
    }
    XHR.send = function() {
        
        this.lastPayLoad = arguments[0];
        this.addEventListener('load', function() {
            if (this.lastPayLoad && this.lastPayLoad.includes('batch_name=MessengerGraphQLThreadFetcher')) {
                
                let endTrim = 0;
                for (; endTrim < 100; endTrim++) {
                    if (this.response[this.response.length-endTrim] === '{') break;
                }
                let jsonResponse = JSON.parse(this.response.slice(0,-endTrim));

                console.info("Messages recieved. JSON:");
                console.log(jsonResponse);

                // Now to extract data from the JSON
                let chatId = undefined;
                // Id are thread_fbid for group chat and other_user_id for onetoone
                if (jsonResponse.o0.data.message_thread.thread_key.thread_fbid !== null)
                    chatId = jsonResponse.o0.data.message_thread.thread_key.thread_fbid;
                if (jsonResponse.o0.data.message_thread.thread_key.other_user_id !== null)
                    chatId = jsonResponse.o0.data.message_thread.thread_key.other_user_id;

                let focusChat = new Object();
                focusChat.id = chatId;
                focusChat.name = jsonResponse.o0.data.message_thread.name;
                focusChat.group = jsonResponse.o0.data.message_thread.thread_type==="GROUP";
                focusChat.msgCount = jsonResponse.o0.data.message_thread.messages_count;
                if(jsonResponse.o0.data.message_thread.image)
                    focusChat.image = jsonResponse.o0.data.message_thread.image.uri; // CAN be null
                if(jsonResponse.o0.data.message_thread.customization_info)
                    focusChat.color = jsonResponse.o0.data.message_thread.customization_info.outgoing_bubble_color; // CAN be null
                focusChat.lastUpdated = jsonResponse.o0.data.message_thread.updated_time_precise;

                let focusMessages = [];
                jsonResponse.o0.data.message_thread.messages.nodes.forEach(function(msg) {
                    let newMsg = new Object();
                    newMsg.id = msg.message_id;
                    newMsg.chatId = chatId;
                    newMsg.senderId = msg.message_sender.id; //TODO figure out how identically named users are handled.
                    newMsg.sender = undefined;
                    newMsg.date = msg.timestamp_precise;
                    newMsg.content = msg.message === undefined ? msg.snippet : msg.message.text;
                    newMsg.reactions = msg.message_reactions;
                    if (msg.replied_to_message && msg.replied_to_message.status === "VALID")
                        newMsg.repliedTo = msg.replied_to_message.message.message_id;
                    console.info(`${msg.message_id} Added.`);
                    focusMessages.push(newMsg);
                });
        
                let data = new Object();
                data.focusMessages = focusMessages;
                data.focusChat = focusChat;
                
                // Create DOM element to 'bridge' data to our extension code
                if (document.getElementById("__collectedData"))
                    document.getElementById("__collectedData").remove();
                let collectedDOMData = document.createElement('p');
                collectedDOMData.id = '__collectedData';
                collectedDOMData.innerText = JSON.stringify(data);
                collectedDOMData.style.height = 0;
                collectedDOMData.style.overflow = 'hidden';
                document.body.appendChild(collectedDOMData);
            }               
        });

        return send.apply(this, arguments);
    };
}

//batch_name=MessengerGraphQLThreadFetcher

var xhrOverrideScript = document.createElement('script');
xhrOverrideScript.type = 'text/javascript';
xhrOverrideScript.innerHTML = "("+intercept.toString()+")();"
document.head.prepend(xhrOverrideScript);