
// Keep the camera inside the drawing area. Camera can always be fully inside the drawing area due to the lower zoom limit.
function maintainInsideDrawingArea(){
    
    if(cornerX < -1 * DRAWING_LIMIT){
        cornerX = -1 * DRAWING_LIMIT;
    }
    if(cornerY < -1 * DRAWING_LIMIT){
        cornerY = -1 * DRAWING_LIMIT;
    }
    if(cornerX > DRAWING_LIMIT - (canvas.width / zoom)){
        cornerX = DRAWING_LIMIT - (canvas.width / zoom);
    }
    if(cornerY > DRAWING_LIMIT - (canvas.height / zoom)){
        cornerY = DRAWING_LIMIT - (canvas.height / zoom);
    }
}

function changeZoom(factor){
    let prevzoom = zoom;
    zoom *= factor;
    cornerX = ((mouseX / prevzoom) + cornerX) - (mouseX / zoom);
    cornerY = ((mouseY / prevzoom) + cornerY) - (mouseY / zoom);

    if (zoom > ZOOM_UPPER_LIMIT) {
        prevzoom = zoom;
        zoom = ZOOM_UPPER_LIMIT;
        cornerX = ((mouseX / prevzoom) + cornerX) - (mouseX / zoom);
        cornerY = ((mouseY / prevzoom) + cornerY) - (mouseY / zoom);
    }

    if (zoom < ZOOM_LOWER_LIMIT) {
        prevzoom = zoom;
        zoom = ZOOM_LOWER_LIMIT;
        cornerX = ((mouseX / prevzoom) + cornerX) - (mouseX / zoom);
        cornerY = ((mouseY / prevzoom) + cornerY) - (mouseY / zoom);
    }

    maintainInsideDrawingArea()
}

// Center the camera around the nodes such that all nodes are in the middle of the screen.
function centerCamera(){
    let l = nodes.length;
    if(l == 0) return;

    let minX = nodes[0].x, maxX = nodes[0].x, minY = nodes[0].y, maxY = nodes[0].y;
    for(let i = 1; i < l; i++){
        let x = nodes[i].x, y = nodes[i].y;
        if(x < minX) minX = x;
        if(x > maxX) maxX = x;
        if(y < minY) minY = y;
        if(y > maxY) maxY = y;
    }

    let dx = maxX - minX, dy = maxY - minY;

    // Change the zoom if the smallest distance (x or y) on screen is not 0.
    let xzoom = zoom, yzoom = zoom;
    if(dx > 0) xzoom = 0.9 * canvas.width / dx;
    if(dy > 0) yzoom = 0.9 * canvas.height / dy;
    let newzoom = xzoom;
    if(yzoom < newzoom) newzoom = yzoom;
    changeZoom(newzoom / zoom);

    // Keep the zoom within limits.
    if(zoom > ZOOM_UPPER_LIMIT) zoom = ZOOM_UPPER_LIMIT
    if(zoom < ZOOM_LOWER_LIMIT) zoom = ZOOM_LOWER_LIMIT

    // Change the location of the camera to center around the nodes.
    cornerX = ((minX + maxX) / 2.0) - (canvas.width / 2.0 / zoom);
    cornerY = ((minY + maxY) / 2.0) - (canvas.height / 2.0 / zoom);

    maintainInsideDrawingArea()
}

function renameString(s){
    for(let i=0;i<256;i++){
        if(s.length < 20 && currKey[i] && !prevKey[i]){
            s += keyCodes[i];
        }
    }

    if(curr("Backspace") && !prev("Backspace")){
        s = s.slice(0, -1);
    }
    if(curr("Enter") && !prev("Enter")){
        renamingID = -1;
    }
    return s;
}

function unselect(){
    isSelectingArea = false
    selectingAreaX0 = -1000000000;
    selectingAreaY0 = -1000000000;
    selectingAreaX1 = -1000000000;
    selectingAreaY1 = -1000000000;
}


let clearing = false;
let clearTimerStart = 0;

function updateVars(){

    let spaceX = Math.round(screenToSpaceX(mouseX));
    let spaceY = Math.round(screenToSpaceY(mouseY));

    let onColorPicker = mouseX >= colorPickerX && mouseX < colorPickerX + colorPickerW && mouseY >= colorPickerY && mouseY < colorPickerY + colorPickerH

    // Select or deselect color picker
    if(currLMB && !prevLMB){
        colorPickerSelected = onColorPicker;
    }

    // Type in color picker
    if(colorPickerSelected){
        for(let i = 0; i < 16; i++){
            if(colorPickerString.length < 7 && currKey[i] && !prevKey[i]){
                colorPickerString += keyCodes[i];
            }
        }
        
        if(curr("Backspace") && !prev("Backspace") && colorPickerString.length > 1){
            colorPickerString = colorPickerString.slice(0, -1);
        }
        if(curr("Enter") && !prev("Enter")){
            colorPickerSelected = false;
        }

        // Update the int based on the string.
        colorPickerInt = 0;
        for(let i = 1; i < 7; i++){
            colorPickerInt *= 16;
            if(i < colorPickerString.length) colorPickerInt += codeToIndex(colorPickerString[i]);
        }

        // Return as we don't want to trigger anything else by typing.
        if(colorPickerSelected) return;
    }

    // Moving the view by dragging the screen
    if(currLMB && dWireFromNode == null && dNode == null){
        cornerX -= (mouseX - prevMouseX) / zoom;
        cornerY -= (mouseY - prevMouseY) / zoom;
        maintainInsideDrawingArea();
    }

    // Zooming
    if(curr("a")){
        changeZoom(1.001 ** (timeCurr - timePrev))
    }
    if(curr("s")){
        changeZoom(0.999 ** (timeCurr - timePrev))
    }

    // Centering the camera
    if(curr("c") && !prev("c")){
        centerCamera();
    }

    // Clearing all
    if(curr("r") && !prev("r")){
        clearTimerStart = Date.now()
        clearing = true;
    }
    if(!curr("r")){
        clearing = false;
    }
    if(clearing && Date.now() - clearTimerStart >= 1500){
        resetAllData();
        clearing = false;
    }
    

    if(currRMB){

        if(!prevRMB){
            // Start to select an area.
            selectingAreaX0 = spaceX
            selectingAreaY0 = spaceY
            isSelectingArea = true
        }
        selectingAreaX1 = spaceX
        selectingAreaY1 = spaceY

    }else{
        
        if(prevRMB){
            // Finish selecting an area.
            selectingAreaX1 = spaceX
            selectingAreaY1 = spaceY
            isSelectingArea = false

            // Find the nodes in that area.
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

            selectedNodes = []

            let l = nodes.length
            for(let i = 0; i < l; i++){
                let x = nodes[i].x, y = nodes[i].y;
                if(x >= sx0 && x <= sx1 && y >= sy0 && y <= sy1){
                    selectedNodes.push(nodes[i])
                }
            }
        }
    }

    // Paste selection
    if(curr("p") && !prev("p") && !isSelectingArea){
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
        
        if((spaceX < sx0 - (sx1 - sx0) || spaceX > sx1) || (spaceY < sy0 - (sy1 - sy0) || spaceY > sy1)){

            let dx = spaceX - sx0
            let dy = spaceY - sy0
            
            // Copy all the nodes in the area.
            let l = selectedNodes.length
            for(let i = 0; i < l; i++){
                // Take this node in the selected area and create a new node offset by the amounts between area and mouse.
                let node = selectedNodes[i]
                createNode(node.x + dx, node.y + dy, node.inverting)
            }

            // Copy all the wires that are between two nodes in the area.
            for(let i = 0; i < l; i++){
                let node = selectedNodes[i]
                let nc = node.children.length
                for(let j = 0; j < nc; j++){
                    let child = node.children[j]
                    if(child.x >= sx0 && child.x <= sx1 && child.y >= sy0 && child.y <= sy1){
                        
                        // Find the indices of the corresponding nodes in the paste area.
                        let new0 = getHash(node.x + dx, node.y + dy)
                        let new1 = getHash(child.x + dx, child.y + dy)

                        // Create a wire between these two nodes.
                        if(new0 == null){
                            console.log("ERROR: New wire 0 -1.");
                        }else if(new1 == null){
                            console.log("ERROR: New wire 1 -1.");
                        }else{
                            createWire(new0, new1);
                        }
                    }
                }
            }

            

        }
    }

    // Unselect area
    if(currLMB && !prevLMB){
        unselect()
    }

    // Starting and stopping execution
    if(curr("e") && !prev("e")){
        executing = !executing;

        if(executing){
            // Start executing.
            setupExecute()
        }else{
            stopExecuting();
        }
    }

    // Creating a non-inverting node
    if(curr("n") && !prev("n")){
        unselect()
        createNode(spaceX, spaceY, false);
    }

    // Creating an inverting node
    if(curr("m") && !prev("m")){
        unselect()
        createNode(spaceX, spaceY, true);
    }

    // Deleting a node
    if(curr("Backspace") && !prev("Backspace")){
        unselect()
        deleteNode(spaceX, spaceY);
    }

    // Finishing drawing a wire
    if(prevLMB && !currLMB && dWireFromNode != null){
        // Check if there is a node there.
        let n = getHash(spaceX, spaceY);
        if(n != null){
            // If so, create the wire.
            createWire(dWireFromNode, n);
        }

        dWireFromNode = null;
    }
    
    // Starting to draw a wire
    if(currLMB && !prevLMB){
        // Check if there is a node there.
        let n = getHash(spaceX, spaceY); // TODO: INDEX BECOMES NODE OBJECT
        if(n != null){
            // If so, set the drag.
            dWireFromNode = n;
        }
    }

    if(currLMB && !prevLMB){
        if(true) renamingID = -1; // What condition to check??????????
    }

    if(renamingID > -1){
        let s = ""
        s = renameString(s); // what to rename?
        return;
    }
}