function drawKeybinds(){
    let x0 = 0;
    let y0 = colorPickerH + KEYBIND_FONT_SIZE;

    if(showingKeybinds){
        
        text("KEYBINDS", x0, y0, KEYBIND_FONT_COLOR, KEYBIND_FONT_SIZE);

        for(let i = 0; i < keybindDescriptions.length; i++){
            text(keybindDescriptions[i], x0, y0 + KEYBIND_FONT_SIZE * (i + 1), KEYBIND_FONT_COLOR, KEYBIND_FONT_SIZE);
        }
    }else{
        text("SPACE to show keybinds", x0, y0, KEYBIND_FONT_COLOR, KEYBIND_FONT_SIZE);
    }
    
    x0 = 300;
    text(hashTableNumElements.toString() + " nodes, " + list.length + " listed objects.", colorPickerW + 10, KEYBIND_FONT_SIZE, KEYBIND_FONT_COLOR, KEYBIND_FONT_SIZE);
}

function drawWire(xStart, yStart, xEnd, yEnd, isOn){
    
    if(isOn){
        grad3(xStart, yStart, xEnd, yEnd, ON_WIRE_COLOR[0], ON_WIRE_COLOR[1], ON_WIRE_COLOR[2], WIRE_THICKNESS)
    }else{
        grad3(xStart, yStart, xEnd, yEnd, OFF_WIRE_COLOR[0], OFF_WIRE_COLOR[1], OFF_WIRE_COLOR[2], WIRE_THICKNESS)
    }
}

function drawNewWire(xStart, yStart, xEnd, yEnd){
    line(xStart, yStart, xEnd, yEnd, NEW_WIRE_COLOR, WIRE_THICKNESS)
}

function drawNewWires(){

    // Draw wires being placed using drawNewWire().
    if(dWireFromNode != null){
        let x = Math.round(spaceToScreenX(dWireFromNode.x));
        let y = Math.round(spaceToScreenY(dWireFromNode.y));
        drawNewWire(x, y, mouseX, mouseY)
    }
}

function drawNodeWires(n, offsetX, offsetY){
    // Convert the coordinates of the node to coordinates on screen.
    let x = Math.round(spaceToScreenX(n.x + offsetX));
    let y = Math.round(spaceToScreenY(n.y + offsetY));
        
    // If the node is on screen, draw its wires to and from other nodes.
    if(x >= 0 && x < canvas.width && y >= 0 && y <= canvas.height){

        // Draw already-placed wires from and to the node using drawWire().
        let children = n.children;
        for(let j = 0; j < children.length; j++){
            let child = children[j];
            let cx = Math.round(spaceToScreenX(child.x + offsetX));
            let cy = Math.round(spaceToScreenY(child.y + offsetY));

            drawWire(x, y, cx, cy, n.value)
        }
        let parents = n.parents;
        for(let j = 0; j < parents.length; j++){
            let parent = parents[j];
            let px = Math.round(spaceToScreenX(parent.x + offsetX));
            let py = Math.round(spaceToScreenY(parent.y + offsetY));
                
            // If the parent is on screen, we already drew a wire from parent to child, so continue.
            if(px >= 0 && px < canvas.width && py >= 0 && py <= canvas.height) continue;

            drawWire(px, py, x, y, parent.value)
        }
    }
}

function drawNode(n, offsetX, offsetY){
    // Convert the coordinates of the node to coordinates on screen.
    let x = Math.round(spaceToScreenX(n.x + offsetX));
    let y = Math.round(spaceToScreenY(n.y + offsetY));
        
    // Determine if at least one pixel of the node is on screen.
    let xl = spaceToScreenX(n.x + offsetX + 0.5);
    let xr = spaceToScreenX(n.x + offsetX - 0.5);
    let yl = spaceToScreenY(n.y + offsetY + 0.5);
    let yr = spaceToScreenY(n.y + offsetY - 0.5);
    if(xl >= 0 && xr <= canvas.width && yl >= 0 && yr <= canvas.height){

        // Draw the node at the point on screen.
        if(n.inverting){
            rect(xl, yl, xr - xl, yr - yl, INVERTING_NODE_COLOR)
        }else{
            rect(xl, yl, xr - xl, yr - yl, UNINVERTING_NODE_COLOR)
        }
    }
}

function drawNodesAndWires(){

    // Iterate through all nodes.
    for(let i = 0; i < nodes.length; i++){
        drawNodeWires(nodes[i], 0, 0);
    }

    // Iterate through all nodes.
    for(let i = 0; i < nodes.length; i++){
        drawNode(nodes[i], 0, 0);
    }
}


function drawGrid(){

    // Find the distance on the canvas grid to draw the grid dots every.
    let gridSpacing = 1;
    while(gridSpacing < GRID_SPACING_THRESHOLD / zoom){
        gridSpacing *= GRID_SCALING_FACTOR;
    }

    // Find the space positions on screen that are a multiple of the gridSpacing.
    let minSpaceX = Math.floor(screenToSpaceX(0) / gridSpacing) * gridSpacing;
    let maxSpaceX = Math.floor(screenToSpaceX(canvas.width) / gridSpacing) * gridSpacing;
    let minSpaceY = Math.floor(screenToSpaceY(0) / gridSpacing) * gridSpacing;
    let maxSpaceY = Math.floor(screenToSpaceY(canvas.height) / gridSpacing) * gridSpacing;

    // Convert those positions to pixel coordinates and draw them on screen.
    for(let x = minSpaceX; x <= maxSpaceX; x += gridSpacing){
        for(let y = minSpaceY; y <= maxSpaceY; y += gridSpacing){
            // determine the dimensions of this grid rectangle
            let minX = spaceToScreenX(x);
            let maxX = spaceToScreenX(x + gridSpacing);
            let minY = spaceToScreenY(y);
            let maxY = spaceToScreenY(y + gridSpacing);

            if((x + y) % 2){
                rect(minX, minY, 2, 2, GRID_COLOR_1);
            }else{
                rect(minX, minY, 2, 2, GRID_COLOR_0);
            }
        }
    }
}

function drawColorPicker(){
    rect(colorPickerX, colorPickerY, colorPickerBoxW, colorPickerH, colorPickerString);
    
    if(colorPickerSelected){
        rect(colorPickerX + colorPickerBoxW, colorPickerY, colorPickerW - colorPickerBoxW, colorPickerH, colorPickerBG);
    }
    text(colorPickerString, colorPickerX + colorPickerBoxW + 5, colorPickerY + colorPickerFontHeight, colorPickerTextColor, colorPickerFontHeight, "left", colorPickerFont);
    border(colorPickerX, colorPickerY, colorPickerW, colorPickerH, colorPickerBorderColor, 1)
}

function drawSelection(){

    // Adjust to be halfway between the grid dots on screen.
    let x = spaceToScreenX(sx0 - 0.5)
    let y = spaceToScreenY(sy0 - 0.5)
    let w = (sx1 + 0.5 - (sx0 - 0.5)) * zoom
    let h = (sy1 + 0.5 - (sy0 - 0.5)) * zoom

    if(isSelectingArea){
        rect(x, y, w, h, SELECTING_AREA_COLOR)
    }else if(selectedArea){
        rect(x, y, w, h, SELECTED_AREA_COLOR)
    }
}

function drawHologram(){

    let offsetX = Math.round(screenToSpaceX(mouseX));
    let offsetY = Math.round(screenToSpaceY(mouseY));

    if(listSelected != -1){
        let n = list[listSelected].nodes;

        for(let i = 0; i < n.length; i++){
            drawNodeWires(n[i], offsetX, offsetY);
        }

        for(let i = 0; i < n.length; i++){
            drawNode(n[i], offsetX, offsetY);
        }
    }
}

function drawList(){
    rect(canvas.width - listWidth, 0, listWidth, canvas.height, LIST_COLOR_0)

    // Draw each component on the list.
    for(let i = 0; i < list.length; i++){

        //let boxHeight = listWidth - listMargin * 2;
        //let x = (canvas.width - listWidth) + listMargin;
        //let boxStart = listMargin + boxHeight * i;

        // // Draw a box.
        //rect(x, boxHeight, boxStart, boxHeight)

        // Draw the background.
        let col = LIST_COLOR_1;
        if(listSelected == i){
            col = LIST_COLOR_2;
        }
        rect(canvas.width - listWidth, i * listBoxHeight, listWidth, listBoxHeight, col)

        
        // Draw the text.
        let xm = canvas.width - (listWidth / 2)
        let ym = i * listBoxHeight + (listBoxHeight / 2)
        text(list[i].text, xm, ym, LIST_TEXT_COLOR, "center");
        
    }

    for(let i = 0; i < list.length; i++){
        // Draw the line.
        let y = (i + 1) * listBoxHeight
        rect(canvas.width - listWidth, y, listWidth, 1, LIST_LINE_COLOR)
    }
}

let frame = 0;

function draw(){
    if(ctx){
        ctx.globalCompositeOperation = "source-over";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = BG_COLOR;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    timePrev = timeCurr;
    timeCurr = Date.now();

    updateVars();

    if(executing) execute(10);

    prevLMB = currLMB;
    prevMMB = currMMB;
    prevRMB = currRMB;

    prevMouseX = mouseX
    prevMouseY = mouseY;

    for(let key = 0; key < 256; key++){
        prevKey[key] = currKey[key];
    }

    drawGrid();
    drawNewWires();
    drawNodesAndWires();
    drawKeybinds();
    drawColorPicker();
    drawSelection();
    drawHologram();
    drawList();

    frame++;
    window.requestAnimationFrame(draw);
}