/*

DOCUMENTATION


EXECUTION

We use a queue to track nodes that need to be updated.
While the queue is not empty:
    Check if we need to return based on time.
    Get the top node from the queue.
    Update the node's value.
    If the value changed, push the children to the queue if they are not in it.


setupExecute():
    Find the actives representing outputs of on and off and full component inputs.
    Add them to the queue.

execute():
    Start the timer.
    While the queue is not empty and the timer has not reached when we need to stop and render the next frame:
        Poll the top value and set it to not be in the queue anymore.
        Count the number of inputs to this node that are powered.
        Calculate this node's new value based on whether there is at least 1 powered input and whether this node is inverting.
        If this node changed, add it to the queue.

When rendering input/output nodes and wires, there will be pointers from each node to an active object that stores its value.
0 = off, non-zero = on.




The actives DON'T even need to be objects.
The actives will be stored in parallel arrays!

*/

/*
active's x-coordinate
active's y-coordinate
boolean, whether this active's value is the inverse of its parents' values
boolean, whether this active is on or off
number[], the active indices that power this active
number[], the active indices that this active powers
boolean, hether this active is in the execution queue
*/
class N {
    
    constructor(x, y, inverting, value, parents, children, inq){
        this.x = x;
        this.y = y;
        this.inverting = inverting;
        this.value = value;
        this.parents = parents;
        this.children = children;
        this.inq = inq;
    }
}

let nodes = []

let hashTableDefaultSize = 1000000
let hashTable = [] // will be initialized at setup
let hashTableNumElements = 0; // the number of elements (node indices) being stored in the hash table

// Rehash. This must be called when putting if the hash table is full.
function setupHashTable(){
    hashTable = Array(hashTableDefaultSize);
    for(let i = 0; i < hashTableDefaultSize; i++){
        hashTable[i] = [];
    }
    hashTableNumElements = 0;
}

// Rehash. This must be called when putting if the hash table is full.
function resizeHashTable(newSize){
    let n = []
    for(let i = 0; i < hashTable.length; i++){
        let s = hashTable[i].length;
        for(let j = 0; j < s; j++){
            if(hashTable[i][j] != null){
                n.push(hashTable[i][j])
            }
        }
    }

    // Initialize an empty array for the new hash table.
    hashTable = Array(newSize);
    for(let i = 0; i < newSize; i++){
        hashTable[i] = [];
    }
    
    // Rehash all the active node coordinates.
    for(let i = 0; i < n.length; i++){
        putHash(n[i])
    }
}

function hash(x, y){
    // 37 * 73 * 101 * 103 and 59 * 71 * 79 * 109
    return (28098503 * x + 36071479 * y) % hashTable.length
}

// Put the active node at the given index to the hash table using its coordinates.
// Does nothing if already present.
/**
 * @param {N} node
 */
function putHash(node){

    let b = hash(node.x, node.y)
    let s = hashTable[b].length

    for(let i = 0; i < s; i++){
        let n = hashTable[b][i]
        if(node.x === n.x && node.y === n.y){
            return;
        }
    }

    hashTable[b].push(node)

    hashTableNumElements++;

    // If table is now close to full, resize the hash table.
    if(hashTableNumElements >= 0.5 * hashTable.length) resizeHashTable(Math.floor(1.5 * hashTable.length + 20))
}

// Gets the node at (x, y) or null if not present.
function getHash(x, y){

    let b = hash(x, y)
    let s = hashTable[b].length

    for(let i = 0; i < s; i++){
        let n = hashTable[b][i]
        if(x === n.x && y === n.y){
            return n;
        }
    }
    
    return null;
}

// Removes the node at (x, y) if present. Return the node or null.
function removeHash(x, y){
    
    let b = hash(x, y)
    let s = hashTable[b].length

    for(let i = 0; i < s; i++){
        let n = hashTable[b][i]
        if(x === n.x && y === n.y){
            hashTable[b][i] = hashTable[b][s-1]
            hashTable[b].pop()
            hashTableNumElements--;
            return n;
        }
    }

    return null;
}

// Create a node, adding it to the hash table and parallel arrays of actives if it is not there.
function createNode(x, y, inverting){
    let node = getHash(x, y)
    if(node == null){
        let n = new N(x, y, inverting, false, [], [], false)
        nodes.push(n)

        putHash(n)
    }
}

// Delete the node at the location if it exists. Delete all wires connecting to it.
function deleteNode(x, y){

    let n = removeHash(x, y)
    if(n != null){
        let l = nodes[nodes.length - 1]

        // For each child of this node, remove this node from its parents array.
        let children = n.children
        let nc = children.length
        for(let i = 0; i < nc; i++){ // BUG: CHILDREN IS UNDEFINED HERE
            let pl = children[i].parents.length
            for(let j = 0; j < pl; j++){
                if(children[i].parents[j].x == x && children[i].parents[j].y == y){
                    for(let k = j + 1; k < children[i].parents.length; k++){
                        children[i].parents[k - 1] = children[i].parents[k]
                    }
                    children[i].parents.pop();
                    break;
                }
            }
        }
        
        // For each parent of this node, remove this node from its children array.
        let parents = n.parents
        for(let i = 0; i < parents.length; i++){
            let children = parents[i].children;
            for(let j = 0; j < children.length; j++){
                if(children[j].x == x && children[j].y == y){
                    for(let k = j + 1; k < children.length; k++){
                        children[k - 1] = children[k]
                    }
                    children.pop();
                    break;
                }
            }
        }

        // Get the index in nodes.
        for(let i = 0; i < nodes.length; i++){
            // Remove the node from the parallel arrays by moving the last node here.
            if(nodes[i].x == x && nodes[i].y == y){
                nodes[i] = l
                nodes.pop();
            }
        }
    }
}

// Just putting this here as we may need to sort the nodes in some way before executing as they are not in any really controllable order
// using the above deletion method.
function sortNodes(){

}

// Create a wire if there is not a wire connecting the two given nodes in that direction if not the same.
function createWire(fromNode, toNode){

    if(fromNode.x == toNode.x && fromNode.y == toNode.y) return;

    // Determine if the wire is already there.
    for(let i = 0; i < fromNode.children.length; i++){
        let x = fromNode.children[i].x;
        let y = fromNode.children[i].y;
        if(x == toNode.x && y == toNode.y) return;
    }

    fromNode.children.push(toNode);
    toNode.parents.push(fromNode);
}

// Execution data which gets preserved over multiple frames.
let activeNodeQueue = [];
let activeNodePos = 0;

let finishedExecution = false;

function stopExecuting(){
    // Set all node values to off.
    for(let i = 0; i < nodes.length; i++){
        nodes[i].value = false;
    }

    // No need to empty the execution queue since we will do that when setting up for next execution.
    // May change this to do more setup stuff here since we can lag when stopping but not starting execution
    // and not have a bad effect on the user's experience.
}

function setupExecute(){

    // Empty the execution queue.
    activeNodeQueue = []
    activeNodePos = 0

    for(let i = 0; i < nodes.length; i++){
        nodes[i].inq = false;
    }

    // Maybe sort all inverting indices by y-coordinate and then x-coordinate for the queue order?
    // In a well-designed project, the queue order shouldn't matter.

    // Go through all actives.
    for(let i = 0; i < nodes.length; i++){
        // Push only the inverting actives to the queue (their outputs start in the on state).
        if(nodes[i].inverting){
            activeNodeQueue.push(nodes[i])
            nodes[i].inq = true;
        }
    }

    finishedExecution = false;
}

// Execute all actives. TODO: Implement a clock-type active that powers every x IRL ms.
// Update whether the execution finished (all nodes finished instead of being interrupted by the timer).
function execute(timeLimitMS){

    // No need to execute if a previous execution finished the execution.
    if(finishedExecution) return;

    start = Date.now()

    while(activeNodePos < activeNodeQueue.length){
        if(Date.now() - start >= timeLimitMS){
            return;
        }

        // Get the active on top of the queue.
        let x = activeNodeQueue[activeNodePos]
        x.inq = false;
        activeNodePos++;

        // Find the number of actives powering this active.
        let c = 0;
        let parents = x.parents;
        for(let i = 0; i < parents.length; i++){
            if(parents[i].value) c++;
        }

        // Set this active's new value.
        let oldValue = x.value;
        if(x.inverting){
            x.value = c == 0;
        }else{
            x.value = c > 0;
        }

        // If value changed, add the children to the queue if not there.
        if(x.value != oldValue){
            for(let i = 0; i < x.children.length; i++){
                let child = x.children[i];
                if(!child.inq){
                    activeNodeQueue.push(child);
                }
            }
        }
    }

    finishedExecution = true;
}