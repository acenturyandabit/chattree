var chattreedata = {};
var i = 1;
var nodes = [];
var connections = [];


chatTreeCore.on("chat", (chat) => {
    //check for uniquenesss
    //replace with 'whoamitalkingto' because browser doesnt know.
    if(chattreedata[whoIamTalkingto()]== undefined){
        chattreedata[whoIamTalkingto()] = chat;
    }
    //create if doesnt exist.
});

chatTreeCore.on("message", (msg) => {
    let chat = whoIamTalkingto();
    //check for uniquenesss
    //only add new if adding new
    if (!chattreedata[chat].msgs[msg.id]){
        decideTree(chattreedata[chat],msg);
        chattreedata[chat].msgs[msg.id]=msg;
    }
    console.log("--------------");
});


function decideTree(tree,newMsg){
    if (tree.prevMsg)newMsg.parent=tree.prevMsg;
    //if you replied to a message, then mark it as a parent
    if (newMsg.repliedTo && tree.msgs[newMsg.repliedTo])newMsg.parent=newMsg.repliedTo;
    tree.prevMsg=newMsg.id;
    //currently linear
}


function userCommit(key,data){//writing user changes.
    chattreedata[whoIamTalkingto()].msgs[key]=data;
}