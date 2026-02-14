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
Implement named components and an inventory
Maybe add rotating a component or even just rotating a selected area in-place if I can somehow figure out how to do that
Maybe allow changing the background color of a component

Implement a clock feature for executing according to the clock (IDK WHAT TO DO AT ALL FOR THIS)
*/

const UNINVERTING_NODE_COLOR = "#00a0f0"
const INVERTING_NODE_COLOR = "#ffc080"

const SELECTING_AREA_COLOR = "#ffd0ff60";
const SELECTED_AREA_COLOR = "#ffa0ff60";

const LIST_COLOR_0 = "#b0b0b0ff";
const LIST_COLOR_1 = "#8080b0ff";
const LIST_COLOR_2 = "#80ffb0ff";
const LIST_TEXT_COLOR = "#000000ff";
const LIST_LINE_COLOR = "#000000ff";



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

let showingKeybinds = true;

let timePrev = 0;
let timeCurr = 0;

// Highest coordinate possible for a drawing location, must be at most 2 billion.
const DRAWING_LIMIT = 1000000000;

let fileName = "data";
let fileData = new Uint8Array();
let fileDataPos = 0; // byte we're on while reading

let d = [];

// A coordinate position value that is guaranteed to be out of bounds and will not be displayed or interacted with.
let OUT_OF_BOUNDS = -1000000000;

// Dragging node and wire data
//let dWireToNode = null; // dragging input of a wire whose output is already a node (DO WE NEED THIS???)
let dWireFromNode = null; // dragging output of a wire whose input is already a node
let dNode = null; // dragging node
let selectingAreaX0 = OUT_OF_BOUNDS;
let selectingAreaY0 = OUT_OF_BOUNDS;
let selectingAreaX1 = OUT_OF_BOUNDS;
let selectingAreaY1 = OUT_OF_BOUNDS;
let sx0 = OUT_OF_BOUNDS;
let sy0 = OUT_OF_BOUNDS;
let sx1 = OUT_OF_BOUNDS;
let sy1 = OUT_OF_BOUNDS;
let isSelectingArea = false
let selectedArea = false
let selectedNodes = []

let listSelected = -1;

let listWidth = 120;
let listBoxHeight = 20;