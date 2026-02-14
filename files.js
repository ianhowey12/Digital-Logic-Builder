function checkEOF(){
    if(fileDataPos >= fileData.length){
        console.error("Error when reading file: Unexpectedly reached end of file.");
        console.error("Reading position " + fileDataPos + " on file of length " + fileData.length);
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
    let byteLength = decodeInt(1, 1);
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

// Encode a boolean into the array of byte numbers d.
function encodeBoolean(x){
    if(x){
        d.push(1)
    }else{
        d.push(0)
    }
}

// Empty all the active nodes and setup the hash table.
function resetAllData(){
    nodes = []
    list = []
    listSelected = -1;

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

        let n = new N(x, y, inverting, value, [], [], false);
        nodes.push(n);
    }

    for(let i = 0; i < l; i++){
        let n = nodes[i];

        let k = decodeInt(4);
        for(let j = 0; j < k; j++){
            n.parents.push(nodes[decodeInt(4)]);
        }

        k = decodeInt(4);
        for(let j = 0; j < k; j++){
            n.children.push(nodes[decodeInt(4)]);
        }
    }

    // Create the hash table from the active nodes.
    for(let i = 0; i < l; i++){
        putHash(nodes[i]);
    }

    // Decode all data for the list.
    l = decodeInt(4);
    for(let i = 0; i < l; i++){

        let w = decodeInt(4)
        let h = decodeInt(4)
        let obj = new L(w, h);
        
        obj.text = decodeString();
        
        let c = decodeInt(4);
        for(let j = 0; j < c; j++){
            let x = decodeIntSigned(4);
            let y = decodeIntSigned(4);
            let inverting = decodeBoolean();
            let value = decodeBoolean();

            let n = new N(x, y, inverting, value, [], [], false);
            obj.nodes.push(n);
        }

        for(let j = 0; j < c; j++){
            let n = obj.nodes[j];

            let s = decodeInt(4);
            for(let k = 0; k < s; k++){
                n.parents.push(obj.nodes[decodeInt(4)]);
            }

            s = decodeInt(4);
            for(let k = 0; k < s; k++){
                n.children.push(obj.nodes[decodeInt(4)]);
            }
        }

        list.push(obj);
    }
}

function encodeNodes(ns){
    encodeInt(ns.length, 4);

    for(let i = 0; i < ns.length; i++){
        let n = ns[i];
        encodeIntSigned(n.x, 4);
        encodeIntSigned(n.y, 4);
        encodeBoolean(n.inverting);
        encodeBoolean(n.value);
    }

    for(let i = 0; i < ns.length; i++){
        let n = ns[i];

        // Encode the node's parent nodes by writing the index (in the order that we encoded the nodes).
        let l = n.parents.length;
        encodeInt(l, 4);
        for(let j = 0; j < l; j++){
            // Find the index of the parent node.
            for(let k = 0; k < ns.length; k++){
                if(ns[k].x == n.parents[j].x && ns[k].y == n.parents[j].y){
                    encodeInt(k, 4);
                    break;
                }
            }
        }

        // Encode the node's child nodes by writing the index (in the order that we encoded the nodes).
        l = n.children.length;
        encodeInt(l, 4);
        for(let j = 0; j < l; j++){
            // Find the index of the child node.
            for(let k = 0; k < ns.length; k++){
                if(ns[k].x == n.children[j].x && ns[k].y == n.children[j].y){
                    encodeInt(k, 4);
                    break;
                }
            }
        }
    }
}

// Construct fileData from all data using d.push(), encodeNumber, and encodeString()
function encodeAllData(){
    
    d = [];

    encodeNodes(nodes);

    // Encode all data for the list.
    l = list.length;
    encodeInt(l, 4);
    for(let i = 0; i < l; i++){
        let obj = list[i];
        encodeInt(obj.w, 4);
        encodeInt(obj.h, 4);
        encodeString(obj.text);

        encodeNodes(obj.nodes);
    }

    // Maybe save inq, activeNodeQueue, activeNodePos, and finishedExecution if we want to be able to save in the middle of execution??
    
    // Update the file data with the untyped array d.
    fileData = new Uint8Array(d);
}