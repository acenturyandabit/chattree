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


/**
 *
 * Collects existing messages
 *
 */
function collectMessages() {

    let chatId = whoIamTalkingto();

    let messageArray=[];
    if (!document.querySelector("[aria-label='Messages']"))return;//dont do anything if there is no element to consider
    let messagesScrape = document.querySelector("[aria-label='Messages']").querySelector("[id]").children;
    let dateCounter = 0;    // To keep track of dates
    let idCounter = 0;

    // First decide whether first scrape or not
    //if (getLatestMessageId() !== undefined) {
    //    idCounter = getLatestMessageId();
    //}

    // Loop through message groups. Note that Messenger orders starting index as top, oldest message loaded.
    // Message groups are 'blobs' of messages sent by the same person in a small timeframe
    for (let i = 0; i < messagesScrape.length; i++) {

        let messageGroup = messagesScrape[i];
        // TODO handle H4 elements to find date and time.
        if (messageGroup.tagName === "DIV") {

            // Message Sender is under '_-ne' class
            let messageSender = "";
            if (messageGroup.getElementsByClassName("_-ne").length > 0)
                messageSender = messageGroup.getElementsByClassName("_-ne")[0].getAttribute("aria-label");
            // Possibility : class '_nd_' seems to indicate the user's own messages

            // Loop through each message of a message group
            let messages = messageGroup.getElementsByClassName("_41ud")[0].children;

            for (let m = 0; m < messages.length; m++) {

                if (whoIamTalkingto() !== chatId) return;   // Make sure chat still current

                // TODO: Check that _aok class doesn't change after refresh etc
                //  Images and Stickers use classes apart from _aok
                //  aria-label seems to always contain the text of the messages */

                if (messages[m].tagName == "DIV") {     // h4 hold nametag

                    let messageObject = new _message();

                    messageObject.id = idCounter++;
                    messageObject.chatId = chatId;
                    messageObject.sender = messageSender;

                    if (messages[m].getElementsByClassName("_aok").length > 0)
                        messageObject.content = messages[m].getElementsByClassName("_aok")[0].getAttribute("aria-label");

                    if (messages[m].getElementsByClassName("_hh7").length > 0)
                        messageObject.date = messages[m].getElementsByClassName("_hh7")[0].getAttribute("data-tooltip-content");
                    // Videos do not have dates?

                    // TODO: Replies, Reactions etc
                    chatTreeCore.fire("message", messageObject);
                    messageArray.push(messageObject);
                    //addMsg(messageObject);
                    //console.log(messageObject.toString());
                }
            }
        }
    }
    return messageArray;
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
        // Load new messages
        let newData = JSON.parse(mutationList[0].target.innerHTML);
        console.log(newData);

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



/**
 * Section to call the collection function when we switch users; and store messages
 *
 */
var messageCache = {};
chatTreeCore.on("urlChange", () => {
    //occasionally throws an error because messages take some finite time to load
    //so keep doing it until we don't get the error
    function f() {
        try {
            messageCache[whoIamTalkingto()] = collectMessages();
            //refreshMessages();
        } catch (e) {
            setTimeout(f, 100);
        }
    }
    setTimeout(f, 100);
});


/**
 * TO BE REMOVED
 * This just refreshes the message cache indiscriminantly and inefficiently every so or so seconds.
 */

setInterval(() => {
    chatTreeCore.fire("refreshMessages");
    messageCache[whoIamTalkingto()] = collectMessages();
    chatTreeCore.fire("afterRefreshMessages");
}, 500);


function whoIam(){
    //LATER
    return ''+document.getElementsByClassName("_1vp5")[0].innerHTML;
    // Possible way to do it? (add Id later)
  }
  
  function whoIamTalkingto(){
    var url=window.location.pathname;
    return url.slice(3);
  }
  