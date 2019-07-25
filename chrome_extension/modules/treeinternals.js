var chattreedata = {};
var i = 1;
var nodes = [];
var connections = [];


chatTreeCore.on("chat", (chat) => {
    //check for uniquenesss
    if(chattreedata[chat.id]== undefined){
        chattreedata[chat.id] = chat;
    }
    //create if doesnt exist.
});

chatTreeCore.on("message", (msg) => {
    let chat = msg.chatId;
    //check for uniquenesss
    //only add new if adding new
    if (!chattreedata[chat].msgs[msg.id]){
        decideTree(chattreedata[chat],msg);
        chattreedata[chat].msgs[msg.id]=msg;
    }
    console.log("--------------");
});


function decideTree(tree,newMsg){
    //currently linear
}


function userCommit(msg,data){//writing user changes.
    chattreedata[chat].msgs[msg]=data;
}

/**
 * Create a tree from an existing message cache
 */

function createLinearTree(thread) {
    let messages = Object.assign({},chattreedata[thread].msgs);
    let preID;
    for (let i in messages) {
        //add it as a node
        if (preID)messages[i].parent=preID;
        preID =i;
    }
    return messages;
}

function createRandomTree(thread) {
    let messages = Object.assign({},chattreedata[thread].msgs);
    let preIDs=[];
    for (let i in messages) {
        //add it as a node
        if (preIDs.length)messages[i].parent=preIDs[Math.floor(Math.random()*preIDs.length)];
        preIDs.push(i);
    }
    return messages;
}