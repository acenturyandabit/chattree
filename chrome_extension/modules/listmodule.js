chatTreeCore.registerModule("list", {
    prettyName: "Item list"
}, function (core, div) {
    let internalMessageCache = [];
    function loadAll() {
        internalMessageCache = [];
        for (let i in chattreedata[whoIamTalkingto()].msgs) {
            internalMessageCache.push(chattreedata[whoIamTalkingto()].msgs[i]);
        }
        internalMessageCache.sort((a, b) => { return a.date - b.date });
        internalMessageCache.forEach((v) => {
            div.appendChild(htmlwrap(`<p data-date="${v.date}" data-id="${v.id}">${new _message(v)}</p>`));
        })
    }
    try {
        loadAll();
    } catch (e) {

    }
    core.on("message", (msg) => {
        if (div.querySelector(`[data-id="${msg.id}"]`)) return;//dont add message if it already exists.
        for (let i = 0; i < div.children.length; i++) {
            if (Number(div.children[i].dataset.date) > msg.date) {
                div.insertBefore(htmlwrap(`<p data-date="${msg.date}" data-id="${msg.id}">${new _message(msg)}</p>`), div.children[i]);
                return;
            }
        }
        div.appendChild(htmlwrap(`<p data-date="${msg.date}" data-id="${msg.id}">${new _message(msg)}</p>`));
    })
    chatTreeCore.on("urlChange", () => {
        while (div.children.length) {
            div.children[0].remove();
        }
        loadAll();
    })
})