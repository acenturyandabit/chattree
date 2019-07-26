// Message Class (through function prototype)
function _message(data) {
    this.id = undefined;
    this.chatId = undefined;
    this.senderId = undefined;
    this.sender = undefined; //TODO how to get names
    this.date = undefined;
    this.content = undefined;
    this.reactions = undefined;
    this.repliedTo = undefined;
    this.user = undefined;
    // Add more attributes

    // if data object provided, load from data
    if (data) {
        Object.assign(this, data);
    }

    this.toString = function () {
        return "Message " + this.id + " from chat " + this.chatId
            + "\nSender: " + this.senderId + "  Date: " + this.date
            + "\nContents:\n" + this.content;
    }
}

// Chat Class (through function prototype)
function _chat() {
    this.id = undefined;
    this.user = undefined;
    this.isGroup = false;
    this.lastUpdated = undefined;
    this.actors = [];
    this.name = undefined;
    this.msgCount = undefined;
    // Add more attributes
    this.msgs = {};

    this.toString = function () {
        return "Chat " + this.id
            + "\nGroupChat: " + this.isGroup + "  Last Updated: " + this.lastUpdated;
    }
}

/**
 *
 * Collects new messages
 *
 */
function refreshMessages() {

    if (!document.getElementById("__collectedData")) {

        collectedDOMData = document.createElement('p');
        collectedDOMData.id = '__collectedData';
        collectedDOMData.style.height = 0;
        collectedDOMData.style.overflow = 'hidden';
        collectedDOMData.innerHTML = "";            // NO data yet
        document.body.appendChild(collectedDOMData);

    } else collectedDOMData = document.getElementById("__collectedData");

    let observeNewMessages = new MutationObserver(function (mutationList, observer) {

        let newData = JSON.parse(mutationList[0].target.innerHTML);
        console.log(newData);

        // Check if loading batch of messages. The focusChat is collected only for batch loading.
        if (newData.focusChat) {
            //  Load new chat
            let chatObject = new _chat();

            chatObject.id = newData.focusChat.id;
            chatObject.isGroup = newData.focusChat.group;
            chatObject.actors = newData.focusChat.actors;
            chatObject.lastUpdated = newData.focusChat.lastUpdated;
            chatObject.name = newData.focusChat.name;
            chatObject.msgCount = newData.focusChat.msgCount;
            if (newData.currentUser) chatObject.user = newData.currentUser;

            chatTreeCore.fire("chat", chatObject);

            // Load new messages
            let messageArray = [];

            newData.focusMessages.forEach((msg) => {
                //  Make a new Messasge Object and assign it to the recieved JSON values
                let messageObject = new _message();

                messageObject.id = msg.id;
                messageObject.chatId = msg.chatId;
                messageObject.senderId = msg.senderId;
                messageObject.sender = msg.sender;
                messageObject.date = msg.date;
                messageObject.content = msg.content;
                messageObject.reactions = msg.reactions;
                messageObject.repliedTo = msg.repliedTo;
                if (newData.currentUser) messageObject.user = newData.currentUser;

                chatTreeCore.fire("message", messageObject);
                messageArray.push(messageObject);
            });

            console.log(messageArray);
            // TODO CODE HERE
            chatTreeCore.fire("postMessageLoad", messageArray);
        }
        // OR check for new current user message
        else if (newData.newUserMessage) {
            let messageObject = new _message();
            let msg = newData.newUserMessage;

            messageObject.id = msg.id;
            messageObject.chatId = msg.chatId;
            messageObject.senderId = msg.senderId;
            messageObject.sender = msg.sender;
            messageObject.date = msg.date;
            messageObject.content = msg.content;
            messageObject.reactions = msg.reactions;
            messageObject.repliedTo = msg.repliedTo;

            chatTreeCore.fire("message", messageObject);

            // TODO update msgCount?
        }
        // OR check for new other user message
        else if (newData.newOtherUserMessage) {
            let messageObject = new _message();
            let msg = newData.newOtherUserMessage;

            messageObject.id = msg.id;
            messageObject.chatId = msg.chatId;
            messageObject.senderId = msg.senderId;
            messageObject.sender = msg.sender;
            messageObject.date = msg.date;
            messageObject.content = msg.content;
            messageObject.reactions = msg.reactions;
            messageObject.repliedTo = msg.repliedTo;

            chatTreeCore.fire("message", messageObject);

            // TODO update msgCount?
        }

    });
    observeNewMessages.observe(collectedDOMData, { subtree: true, childList: true });
}
document.addEventListener("DOMContentLoaded", () => {
    refreshMessages();  // Our extension is loading before DOM head is loaded.
})



var whoIthinkIam = undefined;
chatTreeCore.on("message", (msg) => {
    if (msg.user) whoIthinkIam = msg.user;
})

function whoIam() {
    //LATER
    return whoIthinkIam;
    // Possible way to do it? (add Id later)
}

function whoIamTalkingto() {
    var url = window.location.pathname;
    return url.slice(3);
}

