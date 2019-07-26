var chattreedata=JSON.parse(localStorage.getItem("chattreedata") || "{}");
var i = 1;
var nodes = [];
var connections = [];


chatTreeCore.on("chat", (chat) => {
    //check for uniquenesss
    //replace with 'whoamitalkingto' because browser doesnt know.
    if (chattreedata[whoIamTalkingto()] == undefined) {
        chattreedata[whoIamTalkingto()] = chat;     //TODO Check
    }
    //create if doesnt exist.
});

chatTreeCore.on("message", (msg) => {
    let chat = whoIamTalkingto();
    //check for uniquenesss
    //only add new if adding new
    if (!chattreedata[chat].msgs[msg.id]) {
        decideTree(chattreedata[chat], msg);
        dealWithNonLocalReplies(chattreedata[chat],msg);
        chattreedata[chat].msgs[msg.id] = msg;
    }
    
});


function decideTree(tree, newMsg) {
    if (tree.prevMsg) newMsg.parent = tree.prevMsg;
    //if you replied to a message, then mark it as a parent
    if (newMsg.repliedTo){
        if (tree.msgs[newMsg.repliedTo])newMsg.parent = newMsg.repliedTo;
        else newMsg.notYetReplied=true;
    } 
    tree.prevMsg = newMsg.id;
    //currently linear
}


function dealWithNonLocalReplies(tree,newMsg){
    for (let i in tree.msgs){
        if (tree.msgs[i].notYetReplied && tree.msgs[i].repliedTo==newMsg.id){
            tree.msgs[i].parent=newMsg.id;
        }
    }
}

function userCommit(key, data) {//writing user changes.

    chattreedata[whoIamTalkingto()].msgs[key].parent = data;
    chattreedata[whoIamTalkingto()].msgs[key].notYetReplied=false; //user parent takes priority
}

window.addEventListener("beforeunload",()=>{
    localStorage.setItem("chattreedata",JSON.stringify(chattreedata));
})