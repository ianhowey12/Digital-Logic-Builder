function setup(){
    timePrev = Date.now();
    timeCurr = timePrev;
    window.addEventListener("mousedown", handleMousedown, false);
    window.addEventListener("mouseup", handleMouseup, false);
    window.addEventListener("mousemove", handleMousemove, false);
    window.addEventListener("keydown", handleKeydown, false);
    window.addEventListener("keyup", handleKeyup, false);
    window.addEventListener("wheel", handleWheel, false);

    setupHashTable()
}

// charArrayData is any
function save(fileName, charArrayData){

    const request = new XMLHttpRequest();
    request.open("POST", fileName, true);
    request.send(charArrayData);

    request.onload = (event) => {
        alert(`Saved: ${request.status} ${request.response}`);
        console.log("Saved");
    }
}

function load(fileName){
    const request = new XMLHttpRequest();
    request.open("GET", fileName, true);
    request.responseType = "arraybuffer";

    request.onload = (event) => {
        alert(`Loaded: ${request.status} ${request.response}`);
        console.log("Loaded");

        const arrayBuffer = request.response;
        if (arrayBuffer) {
            const byteArray = new Uint8Array(arrayBuffer);
            return byteArray;
        }
    };

    request.send(null);
}

/*
    
const link = document.createElement("a");

link.href = url;
link.innerText = "Open the array URL";
document.body.appendChild(link);*/

//save("/a.txt", array);

//const array = new Uint8Array(3);
//load("/a.txt");


function main(){
    setup();
    
    window.requestAnimationFrame(draw);
}

main();