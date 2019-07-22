function htmlwrap(html, el) {
    let d = document.createElement(el || 'div');
    d.innerHTML = html;
    if (d.children.length == 1) return d.children[0];
    else return d;
}


var lastbutton=document.querySelector("._1li_");
//var chattreeButton=document.createElement("p");
//chattreeButton.innerText="Chat Tree";
//sidebar.appendChild(chattreeButton);
lastbutton.appendChild(htmlwrap('<div class="_3szo _6y4w" tabindex="0"><div class="_3szp"></div><div class="_3szq">Chat Tree</div></div>'));
