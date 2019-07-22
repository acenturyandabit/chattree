// Message Class (through function prototype)
function _message() {
    this.id = null;
    this.chatId = null;
    this.senderId = null; //TODO figure out how identically named users are handled.
    this.sender = null;
    this.date = null;
    this.content = null;
    this.reactions = {'love':0,'laugh':0,'wow':0,'angry':0,'sad':0,'like':0,'dislike':0};
    this.reply = null;
    // Add more attributes

    this.toString = function(){
        return "Message " + this.id + " from chat " + this.chatId
            +"\nSender: " + this.sender + "  Date: " + this.date
            + "\nContents:\n" + this.content;
    }
}

/**
 * 
 * Collects existing messages
 * 
 */
function collectMessages() {

    let messagesScrape = document.querySelector("[aria-label='Messages']").querySelector("[id]").children;
    let dateCounter = 0;    // To keep track of dates
    let idCounter = 0;

    // Loop through message groups. Note that Messenger orders starting index as top, oldest message loaded.
    // Message groups are 'blobs' of messages sent by the same person in a small timeframe
    for (let i = messagesScrape.length-1;i >= 0; i--) {

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
            
            for (let m = messages.length-1; m >= 0; m-- ) {
                // TODO: Check that _aok class doesn't change after refresh etc
                //  Images and Stickers use classes apart from _aok
                //  aria-label seems to always contain the text of the messages */ 
                
                if (messages[m].tagName == "DIV") {     // h4 hold nametag

                    let messageObject = new _message();

                    messageObject.id = idCounter++;
                    messageObject.chatId = whoIamTalkingto();
                    messageObject.sender = messageSender;

                    if (messages[m].getElementsByClassName("_aok").length > 0)
                        messageObject.content = messages[m].getElementsByClassName("_aok")[0].getAttribute("aria-label");
                
                    messageObject.date = messages[m].getElementsByClassName("_hh7")[0].getAttribute("data-tooltip-content");
                    
                    // TODO: Replies, Reactions etc

                    // FIXME: Add message to data tree here!!!
                    console.log(messageObject.toString());
                }
            }    
        }
    }
}