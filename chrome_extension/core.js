/**
 * Events that are fired:
 * core.on("message",(data)=>{}): fired when a new message is added. Data is a message object (See message.js).
 * core.on("postMessageLoad",(data)=>{}): fired when a group of new messages is made ready. Data is an array of messages. (See message.js).
 * core.on("chat",(data)=>{}): fired when a new chat is loaded. Data is a chat object (see message.js).
 */

function tryUntilSuccess(f, times = 5, separation = 500) {
    try {
        f();
    } catch (e) {
        console.log(e);
        if (times != 0) {
            setTimeout(() => { tryUntilSuccess(f, times - 1, separation) }, separation);
        }
    }
}

function addEventAPI(itm) {
    itm.events = {};
    itm.fire = function (e, args) {
        let _e = e.split(",");
        _e.push("*"); // a wildcard event listener
        _e.forEach((i) => {
            if (!itm.events[i]) return;
            //prime the ketching function with a starter object to prime it.
            let cnt = true;
            if (itm.events[i].cetches) itm.events[i].cetches.forEach((f) => {
                if (cnt != false) cnt = f(args, true)
            });
            //fire each event
            if (itm.events[i].events) {
                itm.events[i].events.forEach((f) => {
                    if (cnt == false) return;
                    try {
                        result = f(args)
                        if (itm.events[i].cetches) itm.events[i].cetches.forEach((f) => {
                            if (cnt != false) cnt = f(result)
                        });
                    } catch (er) {
                        console.log(er);
                    }

                });
            }
            if (itm.events[i].cetches) itm.events[i].cetches.forEach((f) => (f(args, false)));
        })
    };
    itm.on = function (e, f) {
        let _e = e.split(',');
        _e.forEach((i) => {
            if (!itm.events[i]) itm.events[i] = {};
            if (!itm.events[i].events) itm.events[i].events = [];
            itm.events[i].events.push(f);
        })
    };
    itm.cetch = function (i, f) {
        if (!itm.events[i]) itm.events[i] = {};
        if (!itm.events[i].cetches) itm.events[i].cetches = [];
        itm.events[i].cetches.push(f);
    }
}

function htmlwrap(html, el) {
    let d = document.createElement(el || 'div');
    d.innerHTML = html;
    if (d.children.length == 1) return d.children[0];
    else return d;
}

function documentReady(f) {
    if (document.readyState == 'loading') {
        document.addEventListener("DOMContentLoaded", f);
    } else f();
}

function setToChatColor(el, retries = 3) {
    try {
        el.style.background = window.getComputedStyle(document.querySelector("._6yme")).background;
    } catch (e) {
        if (chattreedata[whoIamTalkingto()] && chattreedata[whoIamTalkingto()].color) {
            el.style.background = chattreedata[whoIamTalkingto()].color;
        } else {
            if (retries > 0) setTimeout(() => { setToChatColor(el, retries - 1) }, 300);//try again after 300ms, up to 3 times
            else {
                el.style.background = "blue";
            }
        }
    }
}

function _chatTreeCore() {

    let managedSidebarItems = [];


    setInterval(() => {
        managedSidebarItems.forEach((v, i) => {
            if (v.careColor) {
                setToChatColor(v.careColor);
            }
            if (v.element.getRootNode() != document) {
                try {
                    document.querySelector("._1li_").appendChild(v.element);
                } catch (e) {

                }
            }
        })
    }, 300);



    let me = this;
    this.availableModules = {};
    this.activeModules = [];

    //event api

    addEventAPI(this);

    /**
     * Create a sidebar element for loading new modules
     */
    let UIsidebutton = htmlwrap(`<div class="_3szo _6y4w" tabindex="0" style="background:blue"><div class="_3szq" style="color:white">Chattree settings</div></div>`);
    let creationBars = htmlwrap(`<div></div>`);
    creationBars.style.display = "none";
    //<div class="_3szq">Chattree settings</div>
    UIsidebutton.addEventListener("click", () => { creationBars.style.display = (creationBars.style.display == "block") ? "none" : "block"; });
    managedSidebarItems.push({ careColor: UIsidebutton, element: UIsidebutton });
    managedSidebarItems.push({ element: creationBars });


    /**
     * Register a module to load.
     */

    this.registerModule = function (moduleName, options, fn) {
        if (!fn) {
            fn = options;
            options = {};
        }
        this.availableModules[moduleName] = {
            fn: fn,
            options: options
        }
        //also put a button in the creationbars that loads the module.
        let mkbtn = htmlwrap(`<div class="_3szo _6y4w" tabindex="0"><div class="_3szq" style="margin-left:10px">Load ${this.availableModules[moduleName].options.prettyName || moduleName}</div></div>`);
        creationBars.appendChild(mkbtn);
        mkbtn.addEventListener("click", () => {
            me.loadModule(moduleName);
            creationBars.style.display = "none";
        })

        //Load if we want to load it
        if (this.immediateLoad[moduleName]) while (this.immediateLoad[moduleName].length) {
            let data = this.immediateLoad[moduleName].pop();
            this.loadModule(moduleName, data);
        }
    }


    this.loadModule = function (moduleName, obj) {
        if (!this.availableModules[moduleName]) throw ("Module does not exist!");


        //create a window for it.
        var ID = function () { return '_' + Math.random().toString(36).substr(2, 9); };
        var uniqueID = ID();
        var UIsidebutton = htmlwrap(`<div id="${uniqueID}" class="_3szo _6y4w" tabindex="0"><div class="_3szq">${this.availableModules[moduleName].options.prettyName || moduleName}</div></div>`);
        let winds = {
            win: document.createElement("div"),
            topbar: document.createElement("div"),
            close_btn: document.createElement("div"),
            resize_btn: document.createElement("div"),
            UIsidebutton: UIsidebutton,
            unload_btn: document.createElement("div"),
            moving: false
        }
        winds.unload_btn.innerHTML = "&#10060";
        winds.unload_btn.style.cssText = `height: 15px; width: 15px; right: 10px; position: absolute; text-align: center; font-weight: bold; font-size: 15px;`
        winds.UIsidebutton.appendChild(winds.unload_btn);
        winds.close_btn.style.height = "15px";
        winds.close_btn.style.width = "15px";
        winds.resize_btn.style.background = "green";
        winds.resize_btn.style.height = "15px";
        winds.resize_btn.style.width = "15px";
        winds.resize_btn.style.cssFloat = "left";
        winds.close_btn.style.background = "red";
        winds.close_btn.style.cssFloat = "left";
        winds.topbar.appendChild(winds.close_btn);
        winds.topbar.appendChild(winds.resize_btn);
        winds.win.style.position = "absolute";
        winds.win.style.background = "white";
        winds.win.style.zIndex = 300;
        winds.win.style.border = "1px solid grey";
        winds.win.style.borderRadius = "3px";
        winds.win.style.width = "200px";
        winds.win.style.height = "200px";
        winds.win.style.top = "50%";
        winds.win.style.left = "50%";
        winds.win.style.resize = "both";
        winds.win.style.overflow = "auto";
        winds.topbar.style.height = "15px";
        winds.topbar.style.width = "100%";
        winds.topbar.style.background = "blue";
        winds.win.appendChild(winds.topbar);
        winds.topbar.addEventListener("mousedown", (e) => { winds.moving = { dx: winds.win.offsetLeft - e.pageX, dy: winds.win.offsetTop - e.pageY } });
        documentReady(() => {
            document.body.appendChild(winds.win)
            winds.win.parentElement.addEventListener("mousemove", (e) => {
                if (winds.moving) {
                    winds.win.style.left = e.pageX + winds.moving.dx + "px";
                    winds.win.style.top = e.pageY + winds.moving.dy + "px";
                }
            });
            winds.win.parentElement.addEventListener("mouseup", (e) => { winds.moving = false; });
        });


        var title = htmlwrap(`<div id="chat_tree_header" tabindex="0"><div>${this.availableModules[moduleName].options.prettyName || moduleName}</div></div>`);
        title.style.color = "white";
        title.style.height = "15px";
        title.style.marginTop = "0px";
        winds.topbar.appendChild(title);
        //now windows are created 

        UIsidebutton.addEventListener("click", UIshowwindow);

        /*
        * continuously check if the button in the side bar alredy exist
        *if no, add "chat tree"/"item list" button at the end of the side bar
        */
        managedSidebarItems.push({ element: UIsidebutton, careColor: winds.topbar });

        var window_status = 0;//By default, the window is visible=0
        /*
        * adjust windows visibility
        */
        function UIshowwindow() {
            if (window_status == 0) { winds.win.style.visibility = 'hidden'; window_status = 1; }
            else { winds.win.style.visibility = 'visible'; window_status = 0; }
        }

        //maximise window
        var originalwindow_height;
        var originalwindow_width;
        var originalwindow_top;
        var originalwindow_left;
        var screen_status = 0; //non-zero for fullscreen
        /*
        *set the window to full screen && save the original windows' status
        */
        function UIfullscreen() {
            if (screen_status == 0) {
                originalwindow_width = winds.win.clientWidth;
                originalwindow_height = winds.win.clientHeight;
                originalwindow_top = winds.win.offsetTop;
                originalwindow_left = winds.win.offsetLeft;
                winds.win.style.width = "100%";
                winds.win.style.height = "100%";
                winds.win.style.left = 0;
                winds.win.style.top = 0;
                screen_status = 1;
            } else if (screen_status == 1) {//already fullscreen
                winds.win.style.width = originalwindow_width + "px";
                winds.win.style.height = originalwindow_height + "px";
                winds.win.style.top = originalwindow_top + "px";
                winds.win.style.left = originalwindow_left + "px";
                screen_status = 0;
            }
        }
        if (obj) {
            winds.win.style.width = obj.w + "px";
            winds.win.style.height = obj.h + "px";
            winds.win.style.top = obj.y + "px";
            winds.win.style.left = obj.x + "px";
        }
        winds.inner = document.createElement("div");
        winds.inner.style.height = "calc(100% - 25px)";//oddly specific i know
        winds.inner.style.overflow = "auto";
        winds.inner.style.width = "100%";
        winds.win.appendChild(winds.inner);
        let activeModuleObject = {
            type: moduleName,
            module: new this.availableModules[moduleName].fn(this, winds.inner),
            winds: winds
        };
        this.activeModules.push(activeModuleObject);

        winds.close_btn.addEventListener("click", UIshowwindow);
        winds.resize_btn.addEventListener("click", UIfullscreen);
        function clickon() {
            for (var i = 0; i < me.activeModules.length; i++) {
                me.activeModules[i].winds.win.style.zIndex = 300;
            }
            winds.win.style.zIndex = 301;
        }
        winds.win.addEventListener("mousedown", clickon);
        /*
        *function to unload module of unload button on the side bar is clicked
        */
        function unloadModule(winds) {
            //remove the let childs = Array.from(div.children);item from the managed sidebar.
            for (let i = 0; i < managedSidebarItems.length; i++) {
                if (managedSidebarItems[i].element == UIsidebutton) {
                    managedSidebarItems.splice(i, 1);
                    break;
                }
            }
            //remove the item from the activemodules so it is not saved
            for (let i = 0; i < me.activeModules.length; i++) {
                if (me.activeModules[i] == activeModuleObject) {
                    me.activeModules.splice(i, 1);
                    break;
                }
            }
            for (var idx in winds) {
                if (idx != "moving") {
                    winds[idx].remove();
                }
            }

        }
        winds.unload_btn.addEventListener("click", () => { unloadModule(winds) });
    }
    this.loadFrom = function (arr) {
        //wait 0.5s for everything to settle down (this could be a loooot better)
        this.immediateLoad = {};
        arr.forEach((v) => {
            if (!this.immediateLoad[v.type]) this.immediateLoad[v.type] = [];
            this.immediateLoad[v.type].push(v);
        })
    }
}

let chatTreeCore = new _chatTreeCore();



chatTreeCore.loadFrom(JSON.parse(localStorage.getItem("chattreecoredata") || "[]"));

//Detect when the window url has changed, and fire an event in the core when this happens
var preURL = "";
setInterval(() => {
    if (window.location.href != preURL) {
        preURL = window.location.href;
        chatTreeCore.fire("urlChange", preURL);
    }
}, 300);

window.addEventListener("beforeunload", () => {
    let amlist = chatTreeCore.activeModules.map((i) => {
        return {
            type: i.type,
            w: i.winds.win.clientWidth,
            h: i.winds.win.clientHeight,
            x: i.winds.win.offsetLeft,
            y: i.winds.win.offsetTop
        }
    });
    localStorage.setItem("chattreecoredata", JSON.stringify(amlist));
})
