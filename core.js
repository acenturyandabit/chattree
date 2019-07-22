function _chatTreeCore(){
    this.availableModules={};
    this.activeModules=[];
    this.registerModule=function(moduleName,options, fn){
        if (!fn){
            fn=options;
            options=undefined;
        }
        this.availableModules[moduleName]={
            fn:fn,
            options:options
        }
        //for now, immediately load the module
        loadModule(moduleName);
    }
    this.loadModule=function(moduleName){
        if (!this.availableModules[moduleName])throw ("Module does not exist!");

        //create a window for it.
        let win=document.createElement("div");
        //win.
        this.activeModules.push(new this.availableModules[moduleName].fn(win));
    }

    this.createWindow=docmuent.createElement("div");
    
}
let chatTreeCore=new _chatTreeCore();