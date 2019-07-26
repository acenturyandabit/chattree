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
/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
function rgbToHsl(r, g, b) {
    if (typeof r == "string" && g == undefined && b == undefined) {
        //allow us to take in an rgba string value.
        let cols = /rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(r);
        r = parseInt(('' + cols[1]).replace(/\s/g, ''), 10);
        g = parseInt(('' + cols[2]).replace(/\s/g, ''), 10);
        b = parseInt(('' + cols[2]).replace(/\s/g, ''), 10);
    }
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return { h:h, s:s, l:l};
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l) {
    if (arguments.length === 1) {
        s = h.s, v = h.v, l = h.l;
    }
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  let ret={r:Math.round(r * 255), g:Math.round(g * 255), b:Math.round (b * 255)};
  ret.str=`rgb(${ret.r},${ret.g},${ret.b})`;
  return ret;
}

function hashColor(obj) {
    var str = JSON.stringify(obj);
    var hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    hash = Math.abs(hash);
    hash %= 2 ** 24;//Convert to 24 bit integer
    return `rgb(${((hash) & (255 << 16)) >> 16},${((hash) & (255 << 8)) >> 8},${hash & 255})`;
};

function matchContrast(col) {
    //returns either black or white from either a #COLOR or a rgb(color)
    cols = /\#(..)(..)(..)/i.exec(col)
    if (!cols) {
        cols = /rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(col);
    } else {
        cols = [cols[0], cols[1], cols[2], cols[3]];
        cols[1] = parseInt(cols[1], 16);
        cols[2] = parseInt(cols[2], 16);
        cols[3] = parseInt(cols[3], 16);
    }
    if (!cols) throw "Invalid color: " + col;
    let value = Math.round(((parseInt(cols[1]) * 299) +
        (parseInt(cols[2]) * 587) +
        (parseInt(cols[3]) * 114)) / 1000);
    return (value > 125) ? 'black' : 'white';
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
    let del = 0.1;
    svgCanvas.on("wheel", (e) => {
        let _del = del;
        if (e.deltaY < 0) _del = -del;
        oldViewBox = svgCanvas.viewbox();
        svgCanvas.viewbox(oldViewBox.x - oldViewBox.width * _del, oldViewBox.y - oldViewBox.height * _del, oldViewBox.width * (1 + _del * 2), oldViewBox.height * (1 + _del * 2));
    });

    this.render = function (tree) {
        let abstractedNodes=JSON.parse(JSON.stringify(tree));
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
            abstractedNodeArray[refIndexes.indexOf(id)].rect.stroke({color:"red",width:3});
        }
        function linkElement(id) {
            //also allow for deselection
            if (id == hotElement) {
                hotElement = undefined;
                let usrHashCol = hashColor(abstractedNodeArray[refIndexes.indexOf(id)].senderId);
                abstractedNodeArray[refIndexes.indexOf(id)].rect.stroke({color:matchContrast(usrHashCol),width:1});
                return;
            }
            //recurse up the tree and check that we are not making an infinite loop
            //if we are making an infinite loop, then say nope.
            let ce = id;
            let linkParentAsChild=false;
            let ceIsRoot=false;
            let childOfCe=undefined;
            while (abstractedNodes[ce].parent && abstractedNodes[ce].parent != ce) {
                if (ce.toString() == hotElement.toString()){linkParentAsChild=true; break;}
                else {childOfCe = ce; ce = abstractedNodes[ce].parent;}
            }
            //root case
            if (ce.toString() == hotElement.toString()){linkParentAsChild=true; ceIsRoot=true;}
            if(linkParentAsChild==false){
                abstractedNodes[hotElement].parent = id;
                userCommit(hotElement, abstractedNodes[hotElement].parent);
                me.render(chattreedata[whoIamTalkingto()].msgs);
            }else{
                if(!ceIsRoot){ 
                    abstractedNodes[childOfCe].parent = hotElement.parent; 
                    abstractedNodes[hotElement].parent = id; 
                    userCommit(childOfCe, abstractedNodes[childOfCe].parent);
                    userCommit(ce, abstractedNodes[ce].parent);
                    me.render(chattreedata[whoIamTalkingto()].msgs); }
                else{ abstractedNodes[childOfCe].parent = undefined; 
                    abstractedNodes[hotElement].parent  = id;
                    userCommit(childOfCe, abstractedNodes[childOfCe].parent);
                    userCommit(ce, abstractedNodes[ce].parent);
                    me.render(chattreedata[whoIamTalkingto()].msgs);
                }
            }
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
            let usrHashCol = hashColor(abstractedNodes[currentElement.key].senderId);
            let text = currentElement.groupElement.text((abstractedNodes[currentElement.key].content || currentElement.key).toString()).cy(0).stroke(matchContrast(usrHashCol)).size(10);
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
            currentElement.rect = currentElement.groupElement.rect(text.bbox().w + 10, height).cx(placeX).cy(0).fill(usrHashCol).stroke({ color: matchContrast(usrHashCol), width: 1 }).click(() => {
                if (hotElement) {
                    linkElement(currentElement.key);
                } else {
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

    chatTreeCore.on("urlChange,postMessageLoad", () => {
        this.render(chattreedata[whoIamTalkingto()].msgs);
    });
    //this.render(chattreedata[whoIamTalkingto()].msgs);

})