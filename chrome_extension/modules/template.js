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
}, function (core, div) {
    core.on("message",(msg)=>{
        //A message has been retrieved.
    });
    chatTreeCore.on("refreshMessages,urlChange", () => {
        while (div.children.length){
            div.children[0].remove();
        }
    })
})