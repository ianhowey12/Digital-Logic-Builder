


let keybindDescriptions = [
    "Clear all: hold R",
    "Drag screen: left mouse",
    "Toggle execution: E",
    "Select: right click",
    "Paste selected: P",
    "Delete selected: BACK",
    "Create a non-inverting node: N",
    "Create an inverting node: M",
    "Delete a node: BACK",
    "Zoom in: A or scroll",
    "Zoom out: S or scroll",
    "Center: C"
];

// Indexed using keyCodes below.
let currKey = Array(256);
let prevKey = Array(256);

const KEYBIND_FONT_SIZE = 15;
const KEYBIND_FONT_COLOR = "#500000";

// Used only for typing into text boxes. One-key controls will be written into the code as strings.
let keyCodes = [
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
    "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
    "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
    " ", ",", ".", "?", "-", "+", "=", "_",
    "/", "\\", "\'", "\"", "(", ")", "{", "}", "[", "]", "<", ">",
    "!", "@", "#", "$", "%", "^", "&", "*", "|", "`", "~",
    "Backspace", "Enter", "Tab"
]

function handleMousedown(event){ // mouseEvent
    switch(event.button){
        case 0:
            currLMB = true;
            break;
        case 1:
            currMMB = true;
            break;
        case 2:
            currRMB = true;
            break;
    }
}

function handleMouseup(event){ // mouseEvent
    switch(event.button){
        case 0:
            currLMB = false;
            break;
        case 1:
            currMMB = false;
            break;
        case 2:
            currRMB = false;
            break;
    }
}

function handleMousemove(event){
    mouseX = event.clientX - canvas.offsetLeft;
    mouseY = event.clientY - canvas.offsetTop;
}

// Convert a code for a keyboard key into an index.
function codeToIndex(code){
    // Go through all keybinds and compare codes.
    for(let i=0;i<keyCodes.length;i++){
        if(code == keyCodes[i]){
            return i;
        }
    }

    // If the code is not found, return -1.
    return -1;
}

// For a string, assuming it is a valid keyCode, get whether that key is currently on.
function curr(s){
    let i = codeToIndex(s)
    if(i > -1) return currKey[i];
    return false;
}

// For a string, assuming it is a valid keyCode, get whether that key is previously on.
function prev(s){
    let i = codeToIndex(s)
    if(i > -1) return prevKey[i];
    return false;
}

function handleKeydown(event){
    let i = codeToIndex(event.key);
    if(i != -1) currKey[i] = true;
}

function handleKeyup(event){
    let i = codeToIndex(event.key);
    if(i != -1) currKey[i] = false;
}

function handleWheel(event){
    changeZoom(0.999 ** event.deltaY)
}

const fileLoad = document.getElementById("fileLoad"); // as HTMLElement
const messageDisplay = document.getElementById("message") // as HTMLElement

fileLoad.addEventListener("change", handleFileSelection);

// both are any
function showFileMessage(message, type) {
    messageDisplay.textContent = message;
    messageDisplay.style.color = type === "error" ? "red" : "green";
}

// event is any
function handleFileSelection(event) {
    const file = event.target.files[0];
    messageDisplay.textContent = ""; // Clear previous message

    // Validate file existence and type
    if (!file) {
        showFileMessage("No file selected. Please choose a file.", "error");
        return;
    }

    if (!file.type.startsWith("text")) {
        showFileMessage("Unsupported file type. Please select a text file.", "error");
        return;
    }

    // Read the file
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => {
        // result is ArrayBuffer
        let result = reader.result
        fileData = new Uint8Array(result);
        decodeAllData();
    };
    reader.onerror = () => {
        showFileMessage("Error reading the file. Please try again.", "error");
    };
    //reader.readAsText(file);      DOES THIS GIVE A STRING????
}

function handleFileSave(){
    
    encodeAllData();

    const url = URL.createObjectURL(
        new Blob([fileData.buffer], { type: "text/plain" }),
    );

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;

    // Programmatically click the link to trigger the download
    link.click();

    // Clean up the URL object
    URL.revokeObjectURL(link.href);
}