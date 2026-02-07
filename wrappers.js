let DEFAULT_FONT_SIZE = 14
let DEFAULT_FONT = "Georgia"

// align is CanvasTextAlign
function text(text, x, y, color = 0x000000, size = DEFAULT_FONT_SIZE, align = "left", font = DEFAULT_FONT) {
    if(ctx){
        ctx.font = "" + size + "px " + font;
        ctx.textAlign = align;
        ctx.fillStyle = color;
        ctx.fillText(text, x, y)
    }
}

// Draw a gradient line from (x0, y0) with color c0 to (x1, y1) with color c1.
function grad2(x0, y0, x1, y1, c0, c1, thickness = 1) {

    if(ctx){
        const gradient = ctx.createLinearGradient(x0, y0, x1, y1);

        gradient.addColorStop(0, c0);
        gradient.addColorStop(1, c1);

        ctx.lineWidth = thickness;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = gradient;
        ctx.stroke();
    }
}

// Draw a three-color gradient line from (x0, y0) to (x1, y1).
function grad3(x0, y0, x1, y1, c0, c1, c2, thickness = 1) {

    if(ctx){
        const gradient = ctx.createLinearGradient(x0, y0, x1, y1);

        gradient.addColorStop(0, c0);
        gradient.addColorStop(0.5, c1);
        gradient.addColorStop(1, c2);

        ctx.lineWidth = thickness;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = gradient;
        ctx.stroke();
    }
}


function line(x0, y0, x1, y1, color, thickness = 1) {
    
    if(ctx){
        ctx.lineWidth = thickness;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = color;
        ctx.stroke();
    }
}

function border(x, y, w, h, color, thickness = 1) {
    if(ctx){
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, thickness);
        ctx.fillRect(x, y + h - thickness, w, thickness);
        ctx.fillRect(x, y, thickness, h);
        ctx.fillRect(x + w - thickness, y, thickness, h);
    }
}

function rect(x, y, w, h, color){
    if(ctx){
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
    }
}