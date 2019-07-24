//test function to randomly make trees
function makeTree() {
    let linklist = [];
    for (let i = 0; i < 26; i++) {
        let prnt = Math.floor(Math.random() * i);
        linklist.push({ start: String.fromCharCode(97 + prnt), end: String.fromCharCode(97 + i) });
    }
    return linklist;
}

chatTreeCore.registerModule("tree", function (core, div) {
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
    let del = 0.1;
    svgCanvas.on("wheel", (e) => {
        let _del = del;
        if (e.deltaY < 0) _del = -del;
        oldViewBox = svgCanvas.viewbox();
        svgCanvas.viewbox(oldViewBox.x - oldViewBox.width * _del, oldViewBox.y - oldViewBox.height * _del, oldViewBox.width * (1 + _del * 2), oldViewBox.height * (1 + _del * 2));
    });
    this.render = function (tree) {
        svgCanvas.clear();
        let nodes = tree.nodes;
        let links = tree.links;
        let abstractedNodes = {};
        //add 'ghost links' for ease of use
        for (let i = 0; i < links.length; i++) {
            if (!nodes[links[i].start]) nodes[links[i].start] = links[i].start;
            if (!nodes[links[i].end]) nodes[links[i].end] = links[i].end;
        }
        //determine which layers each element is on
        for (let i in nodes) {
            abstractedNodes[i] = { parent: i, children: [] };
        }
        for (let i = 0; i < links.length; i++) {
            if (links[i].start == links[i].end) continue;//discard self links.
            abstractedNodes[links[i].end].parent = links[i].start;
            abstractedNodes[links[i].start].children.push(links[i].end);
        }
        let maxDepth = 0;
        let roots = {};
        for (let i in nodes) {
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
        function renderItem(i) {
            let currentElement = abstractedNodeArray[i];
            currentElement.groupElement = svgCanvas.group().x(100).y(100);
            //line up its children
            let children = abstractedNodeArray[i].children.map((i) => {
                return abstractedNodeArray[refIndexes.indexOf(i)];
            });
            let placeX = 0;
            currentElement.estimatedWidth = 0;
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
                if (currentElement.estimatedWidth < width) currentElement.estimatedWidth = width;
                placeX = currentElement.estimatedWidth / 2;
                //add some lines
                children.forEach((v, i) => {
                    currentElement.groupElement.line(v.tmpcwx, vspacing-height/2, placeX, 0).back().stroke({ color: "black", width: 2 });
                })
            }
            if (currentElement.estimatedWidth < width) currentElement.estimatedWidth = width;
            placeX = currentElement.estimatedWidth / 2;
            //create a box for it
            currentElement.groupElement.rect(width, height).cx(placeX).cy(0).fill("blue");
            //Create some text in the box
            currentElement.groupElement.text((nodes[currentElement.key] || currentElement.key).toString()).cx(placeX).cy(0).stroke("white");
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
                v.groupElement.x(cew).cy(0);
                cew += v.estimatedWidth;
            }
        });
    }

    chatTreeCore.on("urlChange", () => {

        this.render({
            nodes: {},
            links: makeTree()
        });
        /*
        this.render(retrieveTree(whoIamTalkingto()));
        */
    })

})