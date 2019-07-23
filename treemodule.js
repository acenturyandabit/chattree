chatTreeCore.registerModule("tree", function (core, div) {
    let svgCanvas;

    this.render = function (tree) {
        let nodes = tree.nodes;
        let links = tree.links;
        let abstractedNodes = {};
        //add 'ghost links' for ease of use
        for (let i = 0; i < links.length; i++) {
            if (!nodes[links[i].start])nodes[links[i].start]=links[i].start;
            if (!nodes[links[i].end])nodes[links[i].end]=links[i].end;
        }
        //determine which layers each element is on
        for (let i in nodes) {
            abstractedNodes[i] = { parent: i, children: [] };
        }
        for (let i = 0; i < links.length; i++) {
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
        function addDFSIndex(node, indx) {
            abstractedNodes[node].DFSIndex = indx;
            indx++;
            for (let i in abstractedNodes[node].children) {
                indx = addDFSIndex(abstractedNodes[node].children[i], indx);
            }
            return indx;
        }
        let rootDFSIndex = 0;
        for (let i in roots) {
            rootDFSIndex = addDFSIndex(i, rootDFSIndex);
        }
        //transpose to array and sort by render order
        let abstractedNodeArray = Object.entries(abstractedNodes).map(([key, value]) => { return Object.assign(value, { key: key }) });
        abstractedNodeArray.sort((a, b) => { return (b.depth - a.depth) | (a.DFSIndex - b.DFSIndex) });
        let refIndexes = abstractedNodeArray.map(a => a.key);
        //render them alll
        let svgCanvasDiv = document.createElement("div");
        svgCanvasDiv.style.width = "100%";
        svgCanvasDiv.style.height = "100%";
        svgCanvas = SVG(svgCanvasDiv);

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
                        currentElement.estimatedWidth += 10;
                        //spacing between elements    
                    }
                    //arrange the elements within the group
                    currentElement.groupElement.add(v.groupElement);
                    v.groupElement.x(currentElement.estimatedWidth).cy(60);
                    v.tmpcwx = currentElement.estimatedWidth + v.estimatedWidth / 2;
                    currentElement.estimatedWidth += v.estimatedWidth;
                })
                //calculate the average position of the childElements
                if (currentElement.estimatedWidth < 50) currentElement.estimatedWidth = 50;
                placeX = currentElement.estimatedWidth / 2;
                //add some lines
                children.forEach((v, i) => {
                    currentElement.groupElement.line(v.tmpcwx, 60, placeX, 0).back().stroke({ color: "black", width: 2 });
                })
            }
            if (currentElement.estimatedWidth < 50) currentElement.estimatedWidth = 50;
            placeX = currentElement.estimatedWidth / 2;
            //create a box for it
            currentElement.groupElement.rect(50, 25).cx(placeX).cy(0).fill("blue");
            //Create some text in the box
            currentElement.groupElement.text((nodes[currentElement.key] || currentElement.key).toString()).x(placeX).y(0).stroke("red");
        }
        abstractedNodeArray.forEach((v, i) => { renderItem(i) });
        div.appendChild(svgCanvasDiv);
    }
    this.render({
        nodes: {
            a: 1,
            b: 2,
            c: 3,
            d: 5
        },
        links: [
            { start: "a", end: "b" },
            { start: "b", end: "c" },
            { start: "b", end: "d" },
            { start: "b", end: "e" },
            { start: "e", end: "f" },
            { start: "e", end: "g" }
        ]
    })
    div.addEventListener("resize", () => {
        svgCanvas.w("100%");
        svgCanvas.h("100%");
    })
})