
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
    isSelectingArea = false;
    selectedArea = false;
}

function deleteArea(x0, y0, x1, y1){
    for(let i = 0; i < nodes.length; i++){
        let x = nodes[i].x;
        let y = nodes[i].y;
        if(x >= x0 && x <= x1 && y >= y0 && y <= y1){
            deleteNode(nodes[i].x, nodes[i].y);

            // Since we deleted nodes[i], we need to check the node that is now at nodes[i], so decrement.
            i--;
        }
    }
}


let clearing = false;
let clearTimerStart = 0;

function updateVars(){

    let spaceX = Math.round(screenToSpaceX(mouseX));
    let spaceY = Math.round(screenToSpaceY(mouseY));

    let onColorPicker = mouseX >= colorPickerX && mouseX < colorPickerX + colorPickerW && mouseY >= colorPickerY && mouseY < colorPickerY + colorPickerH
    let onList = canvas.width - mouseX <= listWidth

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

    // Toggling keybinds
    if(curr(" ") && !prev(" ")){
        showingKeybinds = !showingKeybinds;
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
            selectingAreaX0 = spaceX;
            selectingAreaY0 = spaceY;
            isSelectingArea = true;
            selectedArea = false;
        }
        selectingAreaX1 = spaceX;
        selectingAreaY1 = spaceY;

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

    }else{
        
        if(prevRMB){
            // Finish selecting an area.
            selectingAreaX1 = spaceX;
            selectingAreaY1 = spaceY;
            isSelectingArea = false;
            selectedArea = true;

            // Find the nodes in that area.
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
        
        // Saving the selected nodes to the list by clicking anywhere on the list
        if(selectedArea && onList){
            // Make a new list object.
            let o = new L(sx1 - sx0, sy1 - sy0);
            o.text = list.length.toString();

            // Copy all the nodes in the area.
            let l = selectedNodes.length;
            for(let i = 0; i < l; i++){

                // Deep copy this node to the list object.
                let n0 = selectedNodes[i];
                let n1 = new N(n0.x - sx0, n0.y - sy0, n0.inverting, n0.value, [], [], false);

                o.nodes.push(n1);
            }

            // Create the wires between the nodes.
            for(let i = 0; i < l; i++){
                let nc = selectedNodes[i].children.length;

                // Find the corresponding first node in o using a linear search.
                let n0 = null;
                let x = selectedNodes[i].x;
                let y = selectedNodes[i].y;
                for(let j = 0; j < o.nodes.length; j++){
                    if(x - sx0 == o.nodes[j].x && y - sy0 == o.nodes[j].y){
                        n0 = o.nodes[j];
                        break;
                    }
                }

                for(let j = 0; j < nc; j++){
                    let child = selectedNodes[i].children[j];
                    if(child.x >= sx0 && child.x <= sx1 && child.y >= sy0 && child.y <= sy1){

                        // Find the corresponding second node in o using a linear search.
                        let n1 = null;
                        let x = selectedNodes[i].x;
                        let y = selectedNodes[i].y;
                        for(let k = 0; k < o.nodes.length; k++){
                            if(child.x - sx0 == o.nodes[k].x && child.y - sy0 == o.nodes[k].y){
                                n1 = o.nodes[k];
                                break;
                            }
                        }

                        // Add a wire between the nodes.
                        createWire(n0, n1);
                    }
                }
            }
            
            list.push(o);
        }
        
        // Pasting a bunch of nodes from the table to the table
        if(listSelected == -1 && !onList){
            let w = sx1 - sx0;
            let h = sy1 - sy0;
            if((spaceX < sx0 - w || spaceX > sx1) || (spaceY < sy0 - h || spaceY > sy1)){

                let dx = spaceX - sx0
                let dy = spaceY - sy0
                
                // First, delete all nodes and wires between those nodes in the area we are pasting into.
                deleteArea(spaceX, spaceY, spaceX + w, spaceY + h);
                
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
                            createWire(new0, new1);
                        }
                    }
                }
            }
        }

        // Creating something from the list
        if(listSelected != -1 && !onList){
            let w = list[listSelected].w;
            let h = list[listSelected].h;

            // First, delete all nodes and wires between those nodes in the area we are pasting into.
            deleteArea(spaceX, spaceY, spaceX + w, spaceY + h);

            // Copy all the nodes from the list.
            let l = list[listSelected].nodes.length
            for(let i = 0; i < l; i++){
                // Take this node and create a new node with offset.
                let node = list[listSelected].nodes[i]
                createNode(node.x + spaceX, node.y + spaceY, node.inverting)
            }

            // Copy all the wires that are between two nodes in the area.
            for(let i = 0; i < l; i++){
                let node = list[listSelected].nodes[i]
                let nc = node.children.length
                for(let j = 0; j < nc; j++){
                    let child = node.children[j]
                    
                    // Find the indices of the corresponding nodes in the paste area.
                    let new0 = getHash(node.x + spaceX, node.y + spaceY)
                    let new1 = getHash(child.x + spaceX, child.y + spaceY)

                    // Create a wire between these two nodes.
                    createWire(new0, new1);
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

    // Rotating a list object
    if(listSelected != -1){
        if(curr("r") && !prev("r")){
            let n = list[listSelected].nodes;
            let w = list[listSelected].w;
            for(let i = 0; i < n.length; i++){
                // Calculate the new node coordinates.
                let temp = n[i].x;
                n[i].x = n[i].y;
                n[i].y = w - 1 - temp;
            }
            let temp = list[listSelected].w;
            list[listSelected].w = list[listSelected].h;
            list[listSelected].h = temp;
        }
        if(curr("t") && !prev("t")){
            let n = list[listSelected].nodes;
            let h = list[listSelected].h;
            for(let i = 0; i < n.length; i++){
                // Calculate the new node coordinates.
                let temp = n[i].x;
                n[i].x = h - 1 - n[i].y;
                n[i].y = temp;
            }
            let temp = list[listSelected].w;
            list[listSelected].w = list[listSelected].h;
            list[listSelected].h = temp;
        }
    }
    

    // Deleting
    if(curr("Backspace") && !prev("Backspace") && !isSelectingArea && !onList && !onColorPicker){

        if(selectedArea){
            // Deleting the whole selected area
            let l = selectedNodes.length

            // Delete all wires and nodes in the area.
            for(let i = 0; i < l; i++){
                deleteNode(selectedNodes[i].x, selectedNodes[i].y);
            }

            selectedNodes = []
        }else{
            // Deleting a node
            unselect()
            deleteNode(spaceX, spaceY);
        }
    }

    if(currLMB && !prevLMB && onList){

        // Selecting something on the list
        listSelected = -1;
        let i = Math.floor((mouseY - 0) / listBoxHeight);
        if(i >= 0 && i < list.length){
            listSelected = i;
        }
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
        let n = getHash(spaceX, spaceY);
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

    // Loading a file
    if(curr("q") && !prev("q")){
        fileLoad.click();
    }

    // Saving a file
    if(curr("w") && !prev("w")){
        doFileSave();
    }
}