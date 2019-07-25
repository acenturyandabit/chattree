// Message Class (through function prototype)
function _message() {
    this.id = undefined;
    this.chatId = undefined;
    this.senderId = undefined; 
    this.sender = undefined; //TODO how to get names
    this.date = undefined;
    this.content = undefined;
    this.reactions = undefined;
    this.repliedTo = undefined;
    // Add more attributes

    this.toString = function () {
        return "Message " + this.id + " from chat " + this.chatId
            + "\nSender: " + this.senderId + "  Date: " + this.date
            + "\nContents:\n" + this.content;
    }
}

// Chat Class (through function prototype)
function _chat() {
    this.id = undefined;
    this.isGroup = false;
    this.lastUpdated = undefined;
    this.name = undefined;
    this.msgCount = undefined;
    // Add more attributes
    this.messages = {};

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

    if (!document.getElementById("__collectedData")){

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

        //  Load new chat
        let chatObject = new _chat();

        chatObject.id = newData.focusChat.id;
        chatObject.isGroup = newData.focusChat.group;
        chatObject.lastUpdated = newData.focusChat.lastUpdated;
        chatObject.name = newData.focusChat.name;
        chatObject.msgCount = newData.focusChat.msgCount;

        chatTreeCore.fire("chat", chatObject);

        // Load new messages
        let messageArray=[];
        
        newData.focusMessages.forEach( (msg)=> {
            //  Make a new Messasge Object and assign it to the recieved JSON values
            let messageObject = new _message();

            messageObject.id = msg.id;
            messageObject.chatId = msg.chatId;
            messageObject.senderId = msg.senderId;
            messageObject.sender = undefined;
            messageObject.date = msg.date;
            messageObject.content = msg.content;
            messageObject.reactions = msg.reactions;
            messageObject.repliedTo = msg.repliedTo;
                    
            chatTreeCore.fire("message", messageObject);
            messageArray.push(messageObject);
        });

        console.log(messageArray);

        // TODO CODE HERE
        
    });
    observeNewMessages.observe(collectedDOMData, { subtree: true, childList: true });
}
refreshMessages();





function whoIam(){
    //LATER
    return ''+document.getElementsByClassName("_1vp5")[0].innerHTML;
    // Possible way to do it? (add Id later)
  }
  
  function whoIamTalkingto(){
    var url=window.location.pathname;
    return url.slice(3);
  }
  