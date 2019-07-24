chatTreeCore.registerModule("list",{
    prettyName:"Item list"
}, function (core, div) {
    core.on("message",(msg)=>{
        div.appendChild(htmlwrap(`<p>${msg.toString()}</p>`));
    })
    chatTreeCore.on("refreshMessages,urlChange", () => {
        while (div.children.length){
            div.children[0].remove();
        }
    })
})