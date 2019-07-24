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


function _chatTreeCore() {
    this.availableModules = {};
    this.activeModules = [];

    //event api

    addEventAPI(this);

    this.registerModule = function (moduleName, options, fn) {
        if (!fn) {
            fn = options;
            options = undefined;
        }
        this.availableModules[moduleName] = {
            fn: fn,
            options: options
        }
        //for now, immediately load the module
        this.loadModule(moduleName);
    }
    this.loadModule = function (moduleName) {
        if (!this.availableModules[moduleName]) throw ("Module does not exist!");


        //create a window for it.
        let win = document.createElement("div");
        let close_btn = document.createElement("div");
        let resize_btn = document.createElement("div");
        let winds = {
            win: document.createElement("div"),
            topbar:document.createElement("div"),
            close_btn:document.createElement("div"),
            resize_btn: document.createElement("div"),
            moving: false
        }
        winds.close_btn.style.height = "10px";
        winds.close_btn.style.width= "10px";
        winds.resize_btn.style.background="green";
        winds.resize_btn.style.height = "10px";
        winds.resize_btn.style.width= "10px";
        winds.resize_btn.style.cssFloat= "left";
        winds.close_btn.style.background="red";
        winds.close_btn.style.cssFloat= "left";
        winds.topbar.appendChild(winds.close_btn);
        winds.topbar.appendChild(winds.resize_btn);

        winds.win.style.position = "absolute";
        winds.win.style.background = "pink";
        winds.win.style.width = "200px";
        winds.win.style.height = "200px";
        winds.win.style.top = "50%";
        winds.win.style.left = "50%";
        winds.win.style.resize = "both";
        winds.win.style.overflow = "auto";
        winds.topbar.style.height="10px";
        winds.topbar.style.width="100%";
        winds.topbar.style.background="blue";
        winds.win.appendChild(winds.topbar);
        winds.win.addEventListener("mousedown", (e) => { if (e.target == winds.topbar) winds.moving = { dx: winds.win.offsetLeft - e.pageX, dy: winds.win.offsetTop - e.pageY } });
        document.body.appendChild(winds.win);
        winds.win.parentElement.addEventListener("mousemove", (e) => {
            if (winds.moving) {
                winds.win.style.left = e.pageX + winds.moving.dx + "px";
                winds.win.style.top = e.pageY + winds.moving.dy + "px";
            }
        });
        winds.win.parentElement.addEventListener("mouseup", (e) => {winds.moving=false;});


        //create button
        var i=0;
        var UIclearsidebutton;
        var UIsidebutton=htmlwrap('<div id="chat_tree_btn" class="_3szo _6y4w" tabindex="0"><div class="_3szp"></div><div class="_3szq">Chat Tree</div></div>');
        UIsidebutton.addEventListener("click",UIshowwindow);

        function UIsidebar(pid){
          var lastbutton=document.querySelector("._1li_");
          if(i==0){lastbutton.appendChild(UIsidebutton);}
          if(i>0){console.log("i>0");UIsidebutton.remove(); lastbutton.appendChild(UIsidebutton);}
          i++;
        }

        //UI side button
        var pid=setInterval(()=>UIsidebar(pid),300);
        //window visibility
        var window_status=0;//By default, the window is visible=0
        function UIshowwindow(){
          if(window_status==0){winds.win.style.visibility='hidden';  window_status=1;}
          else{winds.win.style.visibility='visible';window_status=0;}
        }
        //maximise window
        var originalwindow_height;
        var originalwindow_width;
        var originalwindow_top;
        var originalwindow_left;
        var screen_status=0; //non-zero for fullscreen
        function UIfullscreen(){
          //var windows_pre=document.querySelector("SvgjsSvg1001");
          if (screen_status==0){
            originalwindow_width=winds.win.clientWidth;
            originalwindow_height=winds.win.clientHeight;
            originalwindow_top=winds.win.clientTop;
            originalwindow_left=winds.win.clentLeft;
            winds.win.style.width="100%";
            winds.win.style.height="100%";
            winds.win.style.left=0;
            winds.win.style.top=0;
            screen_status=1;
          }else{//already fullscreen
            winds.win.style.width=originalwindow_width +"px";
            winds.win.style.height=originalwindow_height+"px";
            winds.win.style.top=originalwindow_top+"px";
            winds.win.style.left=originalwindow_left+"px";
            screen_status=0;
          }



        }

        winds.close_btn.addEventListener("click",UIshowwindow);
        winds.resize_btn.addEventListener("click",UIfullscreen);

        this.activeModules.push(new this.availableModules[moduleName].fn(this, winds.win));

    }

}

let chatTreeCore = new _chatTreeCore();
