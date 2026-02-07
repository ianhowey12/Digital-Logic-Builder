const canvas = document.getElementById('c'); // as HTMLCanvasElement
const ctx = canvas.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight;
document.body.appendChild(canvas);



let mouseX = 0;
let mouseY = 0;
let prevMouseX = 0;
let prevMouseY = 0;
let zoom = 4.0; // how many screen pixels a space pixel takes up
let cornerX = 0.0; // space location of top left corner of screen
let cornerY = 0.0; // space location of top left corner of screen

let currLMB = false;
let currMMB = false;
let currRMB = false;
let prevLMB = false;
let prevMMB = false;
let prevRMB = false;



let renamingID = -1;
let lastListComponentTouchedID = -1;



let executing = false;

let gridSnapEnabled = true;

const ZOOM_UPPER_LIMIT = 50.0
const ZOOM_LOWER_LIMIT = 0.05

const MIN_GRID_DRAWING_ZOOM = 20.0;
const GRID_SPACING_THRESHOLD = 22.0;
const GRID_SCALING_FACTOR = 8.0;
const GRID_COLOR_0 = "#c0c0c0";
const GRID_COLOR_1 = "#606060";

const IO_COLOR = "#989898";
const IO_WIDTH_RATIO = 0.1;

const TEXT_COLOR = "#000000";
const LINE_COLOR = "#000000";
const BG_COLOR = "#100010";

// start, middle, end
// On one-directional wires, the wires go start -> middle -> end.
// On two-directional wires, the wires go end -> middle -> end.
const OFF_WIRE_COLOR = ["#ff000000", "#80800040", "#0000ff80"];
const ON_WIRE_COLOR = ["#ff000000", "#80800080", "#0000ffff"];
const NEW_WIRE_COLOR = "#a0a0a0";
const WIRE_THICKNESS = 3;


/*
TODO:
Fix the 1 or 2 deletion bugs.
*/

const UNINVERTING_NODE_COLOR = "#00a0f0"
const INVERTING_NODE_COLOR = "#ffc080"

const SELECTING_AREA_COLOR = "#ffd0ff60";
const SELECTED_AREA_COLOR = "#ffa0ff60";


let colorPickerString = "#000000";
let colorPickerInt = 0;
let colorPickerX = 0;
let colorPickerY = 0;
let colorPickerW = 100;
let colorPickerH = 20;
let colorPickerBoxW = 20;
let colorPickerBG = "#a0a0a0";
let colorPickerTextColor = "#00a040";
let colorPickerBorderColor = "#00a040"
let colorPickerFont = "Georgia";
let colorPickerFontHeight = 14;
let colorPickerSelected = false;


let timePrev = 0;
let timeCurr = 0;

// Highest coordinate possible for a drawing location, must be at most 2 billion.
const DRAWING_LIMIT = 1000000000;

let fileName = "data";
let fileData = new Uint8Array();
let fileDataPos = 0; // byte we're on while reading

let d = [];


// Dragging node and wire data
//let dWireToNode = null; // dragging input of a wire whose output is already a node (DO WE NEED THIS???)
let dWireFromNode = null; // dragging output of a wire whose input is already a node
let dNode = null; // dragging node
let selectingAreaX0 = -1000000000;
let selectingAreaY0 = -1000000000;
let selectingAreaX1 = -1000000000;
let selectingAreaY1 = -1000000000;
let isSelectingArea = false
let selectedNodes = []