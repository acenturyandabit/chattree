var chattreedata = {};
var i = 1;
var nodes = [];
var connections = [];

chatTreeCore.on("chat", (chat) => {
    //check for uniquenesss
    

    //TODO
});


chatTreeCore.on("message", (msg) => {
    let chat = msg.chatId;
    //check for uniquenesss
    if (chattreedata[msg.chatId] == undefined) {
        chattreedata[msg.chatId] = {
            msgs:{}
        };
    }
});


function addMsg(msg,userDecision=false) {

    let txt = msg.content;
    
    let from = msg.sender;

    
    chattreedata[chat].msgs[msg.id]=msg;
    //determine the parent
    function isParent(messageA, messageB){
        //split it into words
        let wordsInMessageA=messageA.content.toString().split(" ");
        let wordsInMessageB=messageB.content.toString().split(" ");
        //if it contains the same word, then mark it as a parent.
        for (let i=0;i<wordsInMessageB.length;i++){
            if (wordsInMessageA.includes(wordsInMessageB[i]))return true;
        }
        return false;
    }
    if (chattreedata[chat].prev && isParent(chattreedata[chat].msgs[chattreedata[chat].prev],chattreedata[chat].msgs[msg.id])){
        chattreedata[chat].msgs[msg.id].parent=chattreedata[chat].prev;
    }
    chattreedata[chat].prev=msg.id;

}


function retrieveTree(id) {
    return chattreedata[id];
}




/**
 * Create a tree from an existing message cache
 */

function createLinearTree(thread) {
    let messages = Object.assign({},chattreedata[thread].msgs);
    let preID;
    for (let i in messages) {
        //add it as a node
        if (preID)messages[i].parent=preIDs[Math.floor(Math.random()*preIDs.length)];
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