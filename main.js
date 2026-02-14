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


function main(){
    setup();
    
    window.requestAnimationFrame(draw);
}

main();