chatTreeCore.registerModule("list", {
    prettyName: "Item list"
}, function (core, div) {
    function loadAll() {
        for (let i in chattreedata[whoIamTalkingto()].msgs) {
            div.appendChild(htmlwrap(`<p>${chattreedata[whoIamTalkingto()].msgs[i].toString()}</p>`));
        }
    }
    loadAll();

    core.on("message", (msg) => {
        div.appendChild(htmlwrap(`<p>${msg.toString()}</p>`));
    })
    chatTreeCore.on("refreshMessages,urlChange", () => {
        while (div.children.length) {
            div.children[0].remove();
        }
        loadAll();
    })
})