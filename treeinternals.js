var chattreedata = {};
var i = 1;
var nodes = [];
var connections = [];

function addmsg(txt,chat,from) {
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
    if (txt.indexOf("?") != -1){ // msg is a question

    }


}
