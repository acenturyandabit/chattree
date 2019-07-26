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

            //  Handles batch loading message data AND loading Chat data though 'graphglbatch' requests
            if (this.lastPayLoad && this.lastPayLoad.includes('batch_name=MessengerGraphQLThreadFetcher')) {
                
                // Get the ID of the user currently logged in. IMPORTANT
                let loggedInUser = this.lastPayLoad.match(/&__user=(\d+)&/)[1];
                console.info("Current User: " + loggedInUser);

                // Process response data. This contains lots of chat and message data.
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
                focusChat.actors = {};
                jsonResponse.o0.data.message_thread.all_participants.edges.forEach((actor)=>{
                    focusChat.actors[actor.node.messaging_actor.id] = {name : "NO_NAME"};
                    
                });
                // SIMPLIFY
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
                data.currentUser = loggedInUser;
                
                // Create DOM element to 'bridge' data to our extension code
                let collectedDOMData = undefined;
                if (!document.getElementById("__collectedData")){
                    collectedDOMData = document.createElement('p');
                    collectedDOMData.id = '__collectedData';
                    collectedDOMData.style.height = 0;
                    collectedDOMData.style.overflow = 'hidden';
                    document.body.appendChild(collectedDOMData);
                } else collectedDOMData = document.getElementById("__collectedData");
                
                collectedDOMData.innerText = JSON.stringify(data);
            }

            // HANDLES new messages sent from the user thorugh 'send/' requests
            else if (this.lastPayLoad && this.lastPayLoad.includes('client=mercury&action_type=ma-type%3Auser-generated-message')) { // String common to all 'send/' requests
                
                // Request body param contains msg content
                let body = "";
                if (this.lastPayLoad.match(/&body=(.*?)&/))             //regex
                    body = this.lastPayLoad.match(/&body=(.*?)&/)[1];
                    body = decodeURIComponent(body);  // remove URI encoding e.g. %20

                let response = this.response.substring(9);     // remove the unwanted 'for (;;);' at start
                let jsonResponse = JSON.parse(response);
                
                console.info("New Message Sent. JSON:");
                console.log(jsonResponse);

                // Msg object instantiate
                let newMsg = new Object();
                newMsg.id = jsonResponse.payload.actions[0].message_id;
                newMsg.chatId = jsonResponse.payload.actions[0].thread_fbid || jsonResponse.payload.actions[0].other_user_fbid;
                newMsg.senderId = undefined; //TODO 
                newMsg.sender = undefined;
                newMsg.date = jsonResponse.payload.actions[0].timestamp;
                newMsg.content = body;
                newMsg.reactions = undefined;
                newMsg.repliedTo = undefined; //TODO
                console.info(`${newMsg.id} Added.`);
            
                let data = new Object();
                data.newUserMessage = newMsg;   //newUserMessage used by message.js
                
                // Create DOM element to 'bridge' data to our extension code
                let collectedDOMData = undefined;
                if (!document.getElementById("__collectedData")){
                    collectedDOMData = document.createElement('p');
                    collectedDOMData.id = '__collectedData';
                    collectedDOMData.style.height = 0;
                    collectedDOMData.style.overflow = 'hidden';
                    document.body.appendChild(collectedDOMData);
                } else collectedDOMData = document.getElementById("__collectedData");
                
                // JSON the new data
                collectedDOMData.innerText = JSON.stringify(data);
            }               
        });

        return send.apply(this, arguments);
    };
}



var xhrOverrideScript = document.createElement('script');
xhrOverrideScript.type = 'text/javascript';
xhrOverrideScript.innerHTML = "("+intercept.toString()+")();"
document.children[0].appendChild(xhrOverrideScript);



var wsHookFunction = function() {
    /* eslint-disable no-proto */
    /* eslint-disable accessor-pairs */
    /* eslint-disable no-global-assign */

    /* wsHook.js
    * https://github.com/skepticfx/wshook
    * Reference: http://www.w3.org/TR/2011/WD-websockets-20110419/#websocket
    */

    /*The MIT License (MIT)
    
    Copyright (c) 2015 Ahamed Nafeez

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    */
 
    //var wsHook = {};          //Moved to the caller

    (function () {
    // Mutable MessageEvent.
    // Subclasses MessageEvent and makes data, origin and other MessageEvent properites mutatble.
    function MutableMessageEvent (o) {
        this.bubbles = o.bubbles || false
        this.cancelBubble = o.cancelBubble || false
        this.cancelable = o.cancelable || false
        this.currentTarget = o.currentTarget || null
        this.data = o.data || null
        this.defaultPrevented = o.defaultPrevented || false
        this.eventPhase = o.eventPhase || 0
        this.lastEventId = o.lastEventId || ''
        this.origin = o.origin || ''
        this.path = o.path || new Array(0)
        this.ports = o.parts || new Array(0)
        this.returnValue = o.returnValue || true
        this.source = o.source || null
        this.srcElement = o.srcElement || null
        this.target = o.target || null
        this.timeStamp = o.timeStamp || null
        this.type = o.type || 'message'
        this.__proto__ = o.__proto__ || MessageEvent.__proto__
    }

    var before = wsHook.before = function (data, url, wsObject) {
        console.log("Sending message to " + url + " : " + data);
        return data
    }
    var after = wsHook.after = function (messageEvent, url, wsObject) {
        console.log("Received message from " + url + " : " + messageEvent.data);
        return e
    }
    var modifyUrl = wsHook.modifyUrl = function(url) {
        return url
    }
    wsHook.resetHooks = function () {
        wsHook.before = before
        wsHook.after = after
        wsHook.modifyUrl = modifyUrl
    }

    var _WS = WebSocket
    WebSocket = function (url, protocols) {
        var WSObject
        url = wsHook.modifyUrl(url) || url
        this.url = url
        this.protocols = protocols
        if (!this.protocols) { WSObject = new _WS(url) } else { WSObject = new _WS(url, protocols) }

        var _send = WSObject.send
        WSObject.send = function (data) {
        arguments[0] = wsHook.before(data, WSObject.url) || data
        _send.apply(this, arguments)
        }

        // Events needs to be proxied and bubbled down.
        WSObject._addEventListener = WSObject.addEventListener
        WSObject.addEventListener = function () {
        var eventThis = this
        // if eventName is 'message'
        if (arguments[0] === 'message') {
            arguments[1] = (function (userFunc) {
            return function instrumentAddEventListener () {
                arguments[0] = wsHook.after(new MutableMessageEvent(arguments[0]), WSObject.url, WSObject)
                if (arguments[0] === null) return
                userFunc.apply(eventThis, arguments)
            }
            })(arguments[1])
        }
        return WSObject._addEventListener.apply(this, arguments)
        }

        Object.defineProperty(WSObject, 'onmessage', {
        'set': function () {
            var eventThis = this
            var userFunc = arguments[0]
            var onMessageHandler = function () {
            arguments[0] = wsHook.after(new MutableMessageEvent(arguments[0]), WSObject.url, WSObject)
            if (arguments[0] === null) return
            userFunc.apply(eventThis, arguments)
            }
            WSObject._addEventListener.apply(this, ['message', onMessageHandler, false])
        }
        })

        return WSObject
    }
    })();
}

var wsHookScript = document.createElement('script');
wsHookScript.type = 'text/javascript';
wsHookScript.innerHTML = "var wsHook = {}; ("+wsHookFunction.toString()+")();"
document.children[0].appendChild(wsHookScript);