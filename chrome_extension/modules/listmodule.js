chatTreeCore.registerModule("list", {
    prettyName: "Item list"
}, function (core, div) {
    function loadAll() {
        for (let i in chattreedata[whoIamTalkingto()].msgs) {
            div.appendChild(htmlwrap(`<p>${new _message(chattreedata[whoIamTalkingto()].msgs[i]).toString()}</p>`));
        }
    }
    loadAll();

    core.on("message", (msg) => {
        div.appendChild(htmlwrap(`<p>${msg}</p>`));
    })
    chatTreeCore.on("urlChange", () => {
        while (div.children.length) {
            div.children[0].remove();
        }
        loadAll();
    })
})