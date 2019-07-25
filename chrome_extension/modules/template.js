/**
 * To create your own module, use this template!
 * 
 * Once you're done adding your own settings:
 * - Add a link to this file in "manifest.json".
 * - Reload the chrome extension
 * - Reload your messenger
 * - Enjoy!
 */
chatTreeCore.registerModule("module_name",{
    prettyName:"Name of the module you want to see."
}, function (div) {
    //For more information on chatTreeCore's event firing, check out the core.js file.
    /**
     * div: a HTMLElement that represents the window space allocated to your module.
     */
    chatTreeCore.on("message",(msg)=>{
        //A new message has been recieved! 
        //For messagedata reference, check message.js.
    });
    chatTreeCore.on("urlChange", () => {
        //Load a new message set due to changing URL.
    })
})