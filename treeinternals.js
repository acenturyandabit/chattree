var chattreedata = {};
//var nodes = 
var i = 1;
function addmsg(txt,who,from) {
    if (chattreedata[who] == undefined){
        chattreedata[who] = {};
    }
    if (chattreedata[who][from] == undefined){
        chattreedata[who][from] = {};
    }
    //for (var i = 1; i<100; i+=1){
    if (chattreedata[who]["message"+i] == undefined) {
        chattreedata[who][from]["message"+i] = "";
        chattreedata[who][from]["message"+i] += txt;
        //break
        }
    
    i += 1;
    //if (txt.indexOf("?") != -1){

    //}


}
