function screenToSpaceX(screenX){
    return (screenX / zoom) + cornerX;
}

function screenToSpaceY(screenY){
    return (screenY / zoom) + cornerY;
}

function spaceToScreenX(spaceX){
    return (spaceX - cornerX) * zoom;
}

function spaceToScreenY(spaceY){
    return (spaceY - cornerY) * zoom;
}

function checkEOF(){
    if(fileDataPos >= fileData.length){
        //console.error("Error when reading file: Unexpectedly reached end of file.");
        //console.error("Reading position " + fileDataPos + " on file of length " + fileData.length);
    }
}

// Decode a non-negative integer with byteLength bytes from the array of byte numbers d.
function decodeInt(byteLength){
    let x = 0;
    let p = 1;
    for(let i=0;i<byteLength;i++){
        checkEOF();
        x += fileData[fileDataPos] * p;
        p *= 256;
        fileDataPos++;
    }
    return x;
}

// Decode an integer with byteLength bytes from the array of byte numbers d.
function decodeIntSigned(byteLength){
    let x = 0;
    let p = 1;
    for(let i=0;i<byteLength;i++){
        checkEOF();
        x += fileData[fileDataPos] * p;
        p *= 256;
        fileDataPos++;
    }
    if(x >= 2 ** (8 * byteLength - 1)) x -= 2 ** (8 * byteLength);
    return x;
}

// Decode a string from the array of byte numbers d.
function decodeString(){
    let s = "";
    let byteLength = decodeNumber(1, 1);
    for(let i=0;i<byteLength;i++){
        checkEOF();
        s += String.fromCharCode(fileData[fileDataPos]);
        fileDataPos++;
    }
    return s;
}

// Decode a boolean from the array of byte numbers d.
function decodeBoolean(){
    checkEOF();
    let x = fileData[fileDataPos];
    fileDataPos++;
    return x == 1;
}

// Encode a non-negative integer with byteLength bytes into the array of byte numbers d.
function encodeInt(x, byteLength){

    let p = 1;
    for(let i=0;i<byteLength;i++){
        let digit = (x / p) % 256;
        d.push(digit);
        p *= 256;
    }
}

// Encode an integer with byteLength bytes into the array of byte numbers d.
function encodeIntSigned(x, byteLength){
    if(x < 0) x += 2 ** (8 * byteLength);
    
    let p = 1;
    for(let i=0;i<byteLength;i++){
        let digit = (x / p) % 256;
        d.push(digit);
        p *= 256;
    }
}

// Encode a string into the array of byte numbers d.
function encodeString(s){
    let byteLength = s.length;
    d.push(byteLength);
    let encoder = new TextEncoder();
    let ascii = encoder.encode(s);
    for(let i=0;i<byteLength;i++){
        d.push(ascii[i]);
    }
}

// Encode a boolean into the array of byte numbers d.
function encodeBoolean(x){
    d.push(x == 1);
}

// Empty all the active nodes and setup the hash table.
function resetAllData(){
    nodes = []

    setupHashTable()
}

// Construct all data by reading fileData, using encodeNumber, and encodeString()
function decodeAllData(){
    
    // Reset all data before reading.
    resetAllData();
    
    fileDataPos = 0;

    // Decode all data for all active nodes.
    let l = decodeInt(4);
    for(let i = 0; i < l; i++){
        let x = decodeIntSigned(4);
        let y = decodeIntSigned(4);
        let inverting = decodeBoolean();
        let value = decodeBoolean();

        let parents = []
        let children = []

        let k = decodeInt(4);
        for(let j = 0; j < k; j++){
            parents[i].push(decodeInt(4));
        }

        k = decodeInt(4);
        for(let j = 0; j < k; j++){
            children[i].push(decodeInt(4));
        }

        let n = new N(x, y, inverting, value, parents, children, false);
        nodes.push(n);
    }

    // Create the hash table from the active nodes.
    for(let i = 0; i < l; i++){
        putHash(nodes[i]);
    }
}

// Construct fileData from all data using d.push(), encodeNumber, and encodeString()
function encodeAllData(){
    
    d = [];
    

    // Encode all data for all active nodes.
    let l = nodes.length
    encodeInt(l, 4);
    for(let i = 0; i < l; i++){
        encodeIntSigned(nodes[i].x, 4);
        encodeIntSigned(nodes[i].y, 4);
        encodeBoolean(nodes[i].inverting);
        encodeBoolean(nodes[i].value);

        let k = nodes[i].parents.length;
        encodeInt(k, 4);
        for(let j = 0; j < k; j++){
            encodeInt(nodes[i].parents[j], 4);
        }

        k = nodes[i].children.length;
        encodeInt(k, 4);
        for(let j = 0; j < k; j++){
            encodeInt(nodes[i].children[j], 4);
        }
    }

    // Maybe save inq, activeNodeQueue, activeNodePos, and finishedExecution if we want to be able to save in the middle of execution??
    
    // Update the file data with the untyped array d.
    fileData = new Uint8Array(d);
}
