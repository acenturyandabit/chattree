var chattreedata = {};      // Contains tree of messages by from user
var seqMessageRefs = {};    // Contains lists of messages.
//var i = 1;
var nodes = [];
var connections = [];

function addMsg(msg) {
    
    let txt = msg.content;
    let chat = msg.chatId;
    let from = msg.sender;

    if (chattreedata[chat] == undefined){
        chattreedata[chat] = {};
        seqMessageRefs[chat] = [];
    }
    if (chattreedata[chat][from] == undefined){
        chattreedata[chat][from] = {};
    }
    //for (var i = 1; i<100; i+=1){
    if (chattreedata[chat]["message"+msg.id] == undefined) { // i is now msg.id
        chattreedata[chat][from]["message"+msg.id] = msg;
        seqMessageRefs[chat].push(msg);
        
    } else console.warn(`Double up of message id ${msg.id} from ${from} in chat ${chat}`);

    if (msg.id == 0){   
        var root = chattreedata[chat][from]["message"+i];
        nodes.push(root);
        }
    //i += 1;
    if (txt != undefined && txt.indexOf("?") != -1){ // msg is a question

    }


}


function retrieveTree(id){
    return chattreedata[id];
}

function getLatestMessageId(chatId) {
    if (chattreedata[chatId] == undefined) return undefined;
    return chattreedata[chatId][chattreedata[chatId].length-1].id;
}

chatTreeCore.on("message",(msg)=>{
    addMsg(msg);
});