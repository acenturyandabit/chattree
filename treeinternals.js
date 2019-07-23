var chattreedata = {};
var i = 1;
var nodes = [];
var connections = [];

function addMsg(msg) {
    
    let txt = msg.content;
    let chat = msg.chatId;
    let from = msg.sender;

    if (chattreedata[chat] == undefined){
        chattreedata[chat] = {};
    }
    if (chattreedata[chat][from] == undefined){
        chattreedata[chat][from] = {};
    }
    //for (var i = 1; i<100; i+=1){
    if (chattreedata[chat]["message"+i] == undefined) {
        chattreedata[chat][from]["message"+i] = "";
        chattreedata[chat][from]["message"+i] += txt;
        
        }
    if (i == 1){
        var root = chattreedata[chat][from]["message"+i];
        nodes.push(root);
        }
    i += 1;
    if (txt != undefined && txt.indexOf("?") != -1){ // msg is a question

    }


}


function retrieveTree(id){
    return chattreedata[id];
}