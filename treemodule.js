//test function to randomly make trees
function makeTree() {
    let nodes = {};
    for (let i = 0; i < 26; i++) {
        let nd = String.fromCharCode(97 + i);
        nodes[nd] = {};
        let prnt = Math.floor(Math.random() * i);
        nodes[nd].content = String.fromCharCode(97 + i);
        nodes[nd].parent = String.fromCharCode(97 + prnt);
    }
    return nodes;
}

chatTreeCore.registerModule("tree", {
    prettyName: "Chat Tree"
}, function (core, div) {
    let me = this;
    let svgCanvas;
    let svgCanvasDiv = document.createElement("div");
    svgCanvasDiv.style.width = "100%";
    svgCanvasDiv.style.height = "100%";
    svgCanvas = SVG(svgCanvasDiv);
    div.appendChild(svgCanvasDiv);
    let oldViewBox;
    let oldMouse = false;
    svgCanvas.on("mousedown", (e) => {
        oldViewBox = svgCanvas.viewbox();
        oldMouse = { x: e.pageX, y: e.pageY };
    });

    svgCanvas.on("mousemove", (e) => {
        if (oldMouse) {
            svgCanvas.viewbox(oldViewBox.x + (oldMouse.x - e.pageX) / oldViewBox.zoom, oldViewBox.y + (oldMouse.y - e.pageY) / oldViewBox.zoom, oldViewBox.width, oldViewBox.height);
        }
    });
    function done(e) {
        oldMouse = false;
    }
    svgCanvas.on("mouseup", done);
    svgCanvas.on("mouseleave", done);
    let del = 0.01
    svgCanvas.on("wheel", (e) => {
        let _del = del;
        if (e.deltaY < 0) _del = -del;
        oldViewBox = svgCanvas.viewbox();
        svgCanvas.viewbox(oldViewBox.x - oldViewBox.width * _del, oldViewBox.y - oldViewBox.height * _del, oldViewBox.width * (1 + _del * 2), oldViewBox.height * (1 + _del * 2));
    });
    this.render = function (abstractedNodes) {
        let _abstractedNodes=JSON.parse(JSON.stringify(abstractedNodes));
        svgCanvas.clear();
        //determine which layers each element is on
        for (let i in abstractedNodes) {
            if (!abstractedNodes[i].parent) abstractedNodes[i].parent = i;
            abstractedNodes[i].children = [];
        }
        //process 'links'
        for (let i in abstractedNodes) {
            if (abstractedNodes[i].parent != i) abstractedNodes[abstractedNodes[i].parent].children.push(i);
        }
        let maxDepth = 0;
        let roots = {};
        for (let i in abstractedNodes) {
            let currentNode = i;
            let depth = 0;
            while (abstractedNodes[currentNode].parent != currentNode) {
                currentNode = abstractedNodes[currentNode].parent;
                depth++;
            }
            //add to list of roots.
            roots[currentNode] = true;
            abstractedNodes[i].depth = depth;
            if (depth > maxDepth) maxDepth = depth;
        }
        //Order from right to left, by doing a DFS.
        //now with a stack so we dont exceed the call stack size!
        let dfstk = [];
        let dfsIndex = 0;
        for (let i in roots) {
            dfstk.push(i);
        }
        while (dfstk.length) {
            let node = dfstk.pop();
            abstractedNodes[node].DFSIndex = dfsIndex;
            //put all ur children on.
            for (let i = 0; i < abstractedNodes[node].children.length; i++) {
                dfstk.push(abstractedNodes[node].children[i]);
            }
            dfsIndex++;
        }
        //transpose to array and sort by render order
        let abstractedNodeArray = Object.entries(abstractedNodes).map(([key, value]) => { return Object.assign(value, { key: key }) });
        abstractedNodeArray.sort((a, b) => {
            if (!(b.depth - a.depth)) return (a.DFSIndex - b.DFSIndex);
            else return (b.depth - a.depth);
        });
        let refIndexes = abstractedNodeArray.map(a => a.key);
        //render them alll
        let width = 60;
        let height = 30;
        let vspacing = 60;
        let hspacing = 10;
        let hotElement;
        function setHotElement(id) {
            hotElement = id;
            abstractedNodeArray[refIndexes.indexOf(id)].rect.fill("darkblue");
        }
        function linkElement(id) {
            _abstractedNodes[hotElement].parent = id;
            me.render(_abstractedNodes);
        }
        function renderItem(i) {
            let currentElement = abstractedNodeArray[i];
            currentElement.groupElement = svgCanvas.group().x(100).y(100);
            //line up its children
            let children = abstractedNodeArray[i].children.map((i) => {
                return abstractedNodeArray[refIndexes.indexOf(i)];
            });
            let placeX = 0;
            //Create some text in the box
            let text = currentElement.groupElement.text((abstractedNodes[currentElement.key].content || currentElement.key).toString()).cy(0).stroke("white").size(10);
            currentElement.estimatedWidth = text.bbox().w + 10;
            if (children.length) {
                //add the elements to a group
                currentElement.estimatedWidth = 0;
                children.forEach((v, i) => {
                    if (i != 0) {
                        currentElement.estimatedWidth += hspacing;
                        //spacing between elements    
                    }
                    //arrange the elements within the group
                    currentElement.groupElement.add(v.groupElement);
                    v.groupElement.x(currentElement.estimatedWidth).y(vspacing - height / 2);
                    v.tmpcwx = currentElement.estimatedWidth + v.estimatedWidth / 2;
                    currentElement.estimatedWidth += v.estimatedWidth;
                })
                //calculate the average position of the childElements
                placeX = currentElement.estimatedWidth / 2;
                //add some lines
                children.forEach((v, i) => {
                    currentElement.groupElement.line(v.tmpcwx, vspacing - height / 2, placeX, 0).back().stroke({ color: "black", width: 2 });
                })
            }
            //create the text and calculate the width of it.
            placeX = currentElement.estimatedWidth / 2;
            let reMoveBox = false;
            if (currentElement.estimatedWidth < text.bbox().w + 10) {
                oew = placeX;
                currentElement.estimatedWidth = text.bbox().w + 10;
                reMoveBox = true;
            }
            //create a box for it
            currentElement.rect = currentElement.groupElement.rect(text.bbox().w + 10, height).cx(placeX).cy(0).fill("blue").click(() => {
                if (hotElement){
                    linkElement(currentElement.key);
                }else{
                    setHotElement(currentElement.key);
                }
            });
            text.cx(placeX).front();
            //if we need to re-move the box, do so now
            if (reMoveBox) {
                let oldGroupElement = currentElement.groupElement;
                currentElement.groupElement = svgCanvas.group().cx(0).cy(0);
                currentElement.groupElement.add(oldGroupElement);
                oldGroupElement.x(currentElement.estimatedWidth / 2 - placeX).y(0);
            }
        }
        abstractedNodeArray.forEach((v, i) => { renderItem(i) });
        //finally add each group to a big tree to lay out all root nodes
        let cew = 0;
        abstractedNodeArray.forEach((v, i) => {
            if (v.parent == v.key) {
                //this is a root node
                //add it to the megarootnode
                if (cew != 0) {
                    cew += 10;
                    //spacing between elements    
                }
                //arrange the elements within the group
                v.groupElement.x(cew).y(0);
                cew += v.estimatedWidth;
            }
        });
    }

    chatTreeCore.on("urlChange", () => {
        //get the 
        this.render(chattreedata[whoIamTalkingto()].msgs);
        //this.render(makeTree());
        /*
        this.render(retrieveTree(whoIamTalkingto()));
        */
    })

})