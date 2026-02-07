function drawKeybinds(){

    let x0 = 120;
    let x1 = x0 + KEYBIND_FONT_SIZE * 15;
    let x2 = x1 + KEYBIND_FONT_SIZE * 15;
    let y0 = KEYBIND_FONT_SIZE;
    
    text("KEYBINDS", x0, y0, KEYBIND_FONT_COLOR, KEYBIND_FONT_SIZE);

    for(let i=0;i<6;i++){
        text(keybindDescriptions[i], x0, y0 + KEYBIND_FONT_SIZE * (i + 1), KEYBIND_FONT_COLOR, KEYBIND_FONT_SIZE);
    }
    
    text("NODE CONTROL", x1, y0, KEYBIND_FONT_COLOR, KEYBIND_FONT_SIZE);

    for(let i=0;i<3;i++){
        text(keybindDescriptions[6 + i], x1, y0 + KEYBIND_FONT_SIZE * (i + 1), KEYBIND_FONT_COLOR, KEYBIND_FONT_SIZE);
    }
    
    text("ZOOM: " + Math.floor(zoom * 10000.0) / 10000.0, x2, y0, KEYBIND_FONT_COLOR, KEYBIND_FONT_SIZE);

    for(let i=0;i<3;i++){
        text(keybindDescriptions[9 + i], x2, y0 + KEYBIND_FONT_SIZE * (i + 1), KEYBIND_FONT_COLOR, KEYBIND_FONT_SIZE);
    }
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

    // Draw new wires using drawNewWire().
    if(dWireFromNode != null){
        let x = Math.round(spaceToScreenX(dWireFromNode.x));
        let y = Math.round(spaceToScreenY(dWireFromNode.y));
        drawNewWire(x, y, mouseX, mouseY)
    }

}

function drawNodesAndWires(){

    // Iterate through all nodes.
    for(let i = 0; i < nodes.length; i++){
        // Convert the coordinates of the node to coordinates on screen.
        let x = Math.round(spaceToScreenX(nodes[i].x));
        let y = Math.round(spaceToScreenY(nodes[i].y));
        
        // If the node is on screen, draw its wires to and from other nodes.
        if(x >= 0 && x < canvas.width && y >= 0 && y <= canvas.height){

            // Draw already-placed wires from and to the node using drawWire().
            let children = nodes[i].children;
            for(let j = 0; j < children.length; j++){
                let child = children[j];
                let nx = Math.round(spaceToScreenX(child.x));
                let ny = Math.round(spaceToScreenY(child.y));

                drawWire(x, y, nx, ny, nodes[i].value)
            }
            let parents = nodes[i].parents;
            for(let j = 0; j < parents.length; j++){
                let parent = parents[j];
                let nx = Math.round(spaceToScreenX(parent.x));
                let ny = Math.round(spaceToScreenY(parent.y));
                
                // If the parent is on screen, we already drew a wire from parent to child, so continue.
                if(nx >= 0 && nx < canvas.width && ny >= 0 && ny <= canvas.height) continue;

                drawWire(nx, ny, x, y, parent.value)
            }
        }
    }

    // Iterate through all nodes.
    for(let i = 0; i < nodes.length; i++){
        // Convert the coordinates of the node to coordinates on screen.
        let x = Math.round(spaceToScreenX(nodes[i].x));
        let y = Math.round(spaceToScreenY(nodes[i].y));
        
        // Determine if at least one pixel of the node is on screen.
        let xl = spaceToScreenX(nodes[i].x + 0.5);
        let xr = spaceToScreenX(nodes[i].x - 0.5);
        let yl = spaceToScreenY(nodes[i].y + 0.5);
        let yr = spaceToScreenY(nodes[i].y - 0.5);
        if(xl < 0) continue;
        if(xr > canvas.width) continue;
        if(yl < 0) continue;
        if(yr > canvas.height) continue;

        // Draw the node at the point on screen.
        if(nodes[i].inverting){
            rect(xl, yl, xr - xl, yr - yl, INVERTING_NODE_COLOR)
        }else{
            rect(xl, yl, xr - xl, yr - yl, UNINVERTING_NODE_COLOR)
        }
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
    let sx0, sy0, sx1, sy1;
    if(selectingAreaX0 < selectingAreaX1){
        sx0 = selectingAreaX0;
        sx1 = selectingAreaX1;
    }else{
        sx0 = selectingAreaX1;
        sx1 = selectingAreaX0;
    }
    if(selectingAreaY0 < selectingAreaY1){
        sy0 = selectingAreaY0;
        sy1 = selectingAreaY1;
    }else{
        sy0 = selectingAreaY1;
        sy1 = selectingAreaY0;
    }

    // Adjust to be halfway between the grid dots on screen.
    sx0 -= 0.5;
    sx1 += 0.5;
    sy0 -= 0.5;
    sy1 += 0.5;

    let x = spaceToScreenX(sx0)
    let y = spaceToScreenY(sy0)
    let w = (sx1 - sx0) * zoom
    let h = (sy1 - sy0) * zoom

    if(isSelectingArea){
        rect(x, y, w, h, SELECTING_AREA_COLOR)
    }else{
        rect(x, y, w, h, SELECTED_AREA_COLOR)
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

    frame++;
    window.requestAnimationFrame(draw);
}