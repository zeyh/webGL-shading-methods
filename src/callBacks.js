/* anything involving html events handling*/
var quatMatrix = new Matrix4();   
var qNew = new Quaternion(0, 0, 0, 1); // most-recent mouse drag's rotation
var qTot = new Quaternion(0, 0, 0, 1);	// 'current' orientation (made from qNew)

// * HTML events
var g_isDrag = false;		// mouse-drag: true when user holds down mouse button
var g_xMclik = 0.0;		// last mouse button-down position (in CVV coords)
var g_yMclik = 0.0;
var g_xMdragTot = 0.0;	// total (accumulated) mouse-drag amounts (in CVV coords).
var g_yMdragTot = 0.0;

var g_EyeX = 0.20, g_EyeY = 0.25, g_EyeZ = 4.25; //eye position default
var g_LookX = 0.0, g_LookY = 0.0, g_LookZ = 0.0;
var g_LookUp = 0.0;
var g_speed = 1;

var g_schemeOpt = 0;
// control lighting scheme slider bar
function controlScheme(){
    var slider = document.getElementById("shadingScheme");
    var optionText = document.querySelectorAll(".options");
    let instructions = document.querySelectorAll(".dynamicInstruction");
    var totalOptions = Array.from(Array(optionText.length).keys());
    var underline = function(){
        var currSelectionValue = slider.value;
        g_schemeOpt = currSelectionValue; // ! update shading scheme
        initVBOs(shaderingScheme[g_schemeOpt]); // ! update all VBO associated w/ the shading scheme
        var currStyle = optionText[currSelectionValue].style;
        var currInstructionStyle = instructions[currSelectionValue].style;
        currStyle.fontWeight = 700;
        currStyle.setProperty("--isVisible", "visable");
        currStyle.setProperty("--animationFcn", "scaleX(1)");
        currInstructionStyle.setProperty("--animationFcn1", "scaleX(1)");
        currInstructionStyle.setProperty("--isVisible1", "visable");
        var restOptions = totalOptions.filter(num => num != currSelectionValue);
        restOptions.forEach(element => {
            optionText[element].style.fontWeight = 400;
            optionText[element].style.setProperty("--isVisible", "hidden")
            optionText[element].style.setProperty("--animationFcn", "scaleX(0)")
            instructions[element].style.setProperty("--animationFcn1", "scaleX(0)");
            instructions[element].style.setProperty("--isVisible1", "hidden");
        });
    }
    underline();

    slider.oninput = function(){ //keep listening slider input change
        underline();
    }
}

// ===================================for dat-gui setup
var params = { 
    left: -1.00,
    right: 1.00,
    top: -1.00,
    bottom: 1.00,
    near: 1.00,
    far: 100.00,
};
var params_fly = { 
    turning_angle: 0.00,
    up_down: 0.00,
    speed: 0.10,
};
var view = this;
var isFrustrum = false;
var isFly = false;
view.use_frustum = false;
view.fly = false;
var guileft, guiright, guitop, guibottom, guinear, guifar;
var guiArr_frustum, guiArr_fly;
function setControlPanel() {
    var gui = new dat.GUI();
    //text
    var sampleText = function () {
        this.use_perspective = "plz use keyboard control⌨️ ";
        this.color = "#ff0000";
        this.fontSize = 24;
        this.border = false;
        this.fontFamily = "sans-serif";
    };
    var text = new sampleText();
    gui.add(text, 'use_perspective')

    //frustrum controller
    var frustrumController = gui.add(view, 'use_frustum').listen();
    guileft = gui.add(params, 'left', -2.00, 0.00);
    guiright = gui.add(params, 'right', 0.00, 2.00);
    guitop = gui.add(params, 'top', -2.00, 0.00);
    guibottom = gui.add(params, 'bottom', 0.00, 2.00);
    guinear = gui.add(params, 'near', 0.10, 4.00);
    guifar = gui.add(params, 'far', 5, 150);
    guiArr_frustum = [guileft, guiright, guitop, guibottom, guinear, guifar];
    disableGui(guiArr_frustum); //by default
    frustrumController.onChange(function (value) {
        isFrustrum = value
        if (!isFrustrum) {
            disableGui(guiArr_frustum);
        }
        else {
            enableGui(guiArr_frustum);
        }
    });
    //fly
    var flyController = gui.add(view, 'fly').listen();
    guiFly1 = gui.add(params_fly, 'turning_angle', -1.00, 1.00);
    guiFly2 = gui.add(params_fly, 'up_down', -1.00, 1.00);
    guiFly3 = gui.add(params_fly, 'speed', -0.50, 1.00);
    guiArr_fly = [guiFly1, guiFly2, guiFly3];
    disableGui(guiArr_fly); //by default
    flyController.onChange(function (value) {
        isFly = value
        if (!isFly) {
            disableGui(guiArr_fly);
        }
        else {
            enableGui(guiArr_fly);
        }
    });
}
function disableGui(arr) {
    for (let i = 0; i < arr.length; i++) {
        arr[i].domElement.style.pointerEvents = "none"
        arr[i].domElement.style.opacity = .5;
    }
}
function enableGui(arr) {
    for (let i = 0; i < arr.length; i++) {
        arr[i].domElement.style.pointerEvents = "auto"
        arr[i].domElement.style.opacity = 1;
    }
}
// fly
function flyForward(){
    if(isFly){
        g_EyeZ -= 0.1 * params_fly.speed;
        g_LookZ -= 0.1 * params_fly.speed;
        //turning head right/left
        g_LookX += 0.05 * params_fly.turning_angle;
        //turning horizontally up/down
        g_EyeY += 0.05 * params_fly.up_down;
        g_LookY += 0.05 * params_fly.up_down;
    }
}

// ===================================for individual control button
function resizeCanvas(gl, arr, u_ProjMatrix, projMatrix, u_ViewMatrix, viewMatrix, u_ModelMatrix, modelMatrix) {
    canvas = document.getElementById('webgl');
    canvas.width = window.innerWidth * 1;
    canvas.height = window.innerHeight * 7 / 10;
    // console.log("(width, height):", window.innerWidth, window.innerHeight)
    //adding a overall drawing function here
    drawAll(gl, arr, u_ProjMatrix, projMatrix, u_ViewMatrix, viewMatrix, u_ModelMatrix, modelMatrix);
}

var hideGrid = false;
function gridDisplay(){
    if(hideGrid){
        //start
        hideGrid = false;
        document.querySelector('#showGrid').textContent = 'Show Plane';
    }else{
        hideGrid = true;
        document.querySelector('#showGrid').textContent = 'Show Grid';
    }
}
var hideSphere = false;
function sphereDisplay(){
    if(hideSphere){
        //start
        hideSphere = false;
        document.querySelector('#showSphere').textContent = 'Show Sphere';
    }else{
        hideSphere = true;
        document.querySelector('#showSphere').textContent = 'Hide Sphere';
    }
}

var isStop = false;
function stopMotion1(){
    if(isStop){
        //start
        isStop = false;

    }else{
        isStop = true;
    }
}

var g_jointAngle2 = 0;
function rotateMotion1(){
    g_jointAngle2 += 10 % 360;
}


function writeHtml() {
    document.getElementById('EyeAt').innerHTML =
        'Eye: (' + g_EyeX.toFixed(3) + ', ' + g_EyeY.toFixed(3) + ', ' + g_EyeZ.toFixed(3) + ")";
    document.getElementById('LookAt').innerHTML =
        'Look At: (' + g_LookX.toFixed(3) + ', ' + g_LookY.toFixed(3) + ', ' + g_LookZ.toFixed(3) + ")";
}

function initWindow() {
    window.addEventListener('resize', resizeCanvas, false);
}



// * ===================Keyboard event-handling Callbacks===========
// ref: https://keycode.info/ http://learnwebgl.brown37.net/07_cameras/camera_rotating_motion.html
function keyAD(ev) {
    if (ev.keyCode == 68) { // d
        g_EyeX += 0.1 * g_speed;
        g_LookX += 0.1 * g_speed;

    } else if (ev.keyCode == 65) { // a
        g_EyeX -= 0.1 * g_speed;
        g_LookX -= 0.1 * g_speed;

    } else { return; }
}

var g_fogDist = new Float32Array([55, 80]);
function keyWS(ev) {
    if (ev.keyCode == 83) { // w moving forward
        g_EyeZ += 0.1 * g_speed;
        g_LookZ += 0.1 * g_speed;
        if (g_fogDist[1] > g_fogDist[0]) g_fogDist[1] -= 1; // ! change fog visibility

    } else if (ev.keyCode == 87) { // s moving backward
        g_EyeZ -= 0.1 * g_speed;
        g_LookZ -= 0.1 * g_speed;
        g_fogDist[1]  += 1; // ! change fog visibility
    } else { return; }
}

function keyQE(ev) {
    if (ev.keyCode == 81) { // q
        g_EyeY += 0.1 * g_speed;
        g_LookY += 0.1 * g_speed;
    } else if (ev.keyCode == 69) { // e
        g_EyeY -= 0.1 * g_speed;
        g_LookY -= 0.1 * g_speed;

    } else { return; }
}

function keyArrowRotateRight(ev) {
    if (ev.keyCode == 39) { // ->
        g_LookX += 0.05 * g_speed; //unstable rate of rotation
    } else if (ev.keyCode == 37) { // <-
        g_LookX -= 0.05 * g_speed;
    } else { return; }
}

function keyArrowRotateUp(ev) {//change x from -1 to 1
    if (ev.keyCode == 38) { // up ^
        g_LookY += 0.05 * g_speed;
    } else if (ev.keyCode == 40) { // down v
        g_LookY -= 0.05 * g_speed;
    } else { return; }
}

var g_matlSel = 9;
function materialKeyPress(ev) {
        switch(ev.keyCode)
        {
            case 77:	// UPPER-case 'M' key:
            case 109:	// LOWER-case 'm' key:
                g_matlSel = (g_matlSel +1)%MATL_DEFAULT;	
                console.log(g_matlSel)// see materials_Ayerdi.js for list
                break;
            // case 83: // UPPER-case 's' key:
            //     matl0.K_shiny += 1.0;								// INCREASE shinyness, but with a
            //     if(matl0.K_shiny > 128.0) matl0.K_shiny = 128.0;	// upper limit.
            //     console.log('UPPERcase S: ++K_shiny ==', matl0.K_shiny,'\n');	
            //     break;
            // case 115:	// LOWER-case 's' key:
            //     matl0.K_shiny += -1.0;								// DECREASE shinyness, but with a
            //     if(matl0.K_shiny < 1.0) matl0.K_shiny = 1.0;		// lower limit.
            //     console.log('lowercase s: --K_shiny ==', matl0.K_shiny, '\n');
            //     break;
            default:
            break;
        }
}
    

// * ===================Keyboard event-handling Callbacks===========
function clearDrag() {
    // Called when user presses 'Clear' button in our webpage
    g_xMdragTot = 0.0;
    g_yMdragTot = 0.0;
}

function mouseWheel(en) {
    if (en.deltaY < 0) {
        g_viewScale -= 0.05;
    }
    else if (en.deltaY > 0) {
        g_viewScale += 0.05;
    }
}

function myMouseDown(ev) {
    var rect = ev.target.getBoundingClientRect();
    var xp = ev.clientX - rect.left;
    var yp = canvas.height - (ev.clientY - rect.top);

    // Convert to Canonical View Volume (CVV) coordinates too:
    var x = (xp - canvas.width / 2) / (canvas.width / 2);
    var y = (yp - canvas.height / 2) / (canvas.height / 2);

    g_isDrag = true;
    g_xMclik = x;
    g_yMclik = y;


};

var g_lamp0PosY, g_lamp0PosZ;
var g_eyePosY, g_eyePosZ;
function myMouseMove(ev) {
    if (g_isDrag == false) return;

    var rect = ev.target.getBoundingClientRect();
    var xp = ev.clientX - rect.left;
    var yp = canvas.height - (ev.clientY - rect.top);

    var x = (xp - canvas.width / 2) / (canvas.width / 2);
    var y = (yp - canvas.height / 2) / (canvas.height / 2);

    // g_lamp0.I_pos.elements.set([	 //TODO: somehow unable to change directly
    //     g_lamp0.I_pos.elements[0],
    //     g_lamp0.I_pos.elements[1] + 4.0*(x-g_xMclik),	// Horiz drag: change world Y
    //     g_lamp0.I_pos.elements[2] + 4.0*(y-g_yMclik) 	// Vert. drag: change world Z
    // ]);

    g_lamp0PosY = 8.0*(x-g_xMclik);
    g_lamp0PosZ = 8.0*(y-g_yMclik);
    g_eyePosY = 8.0*(x-g_xMclik);
    g_eyePosZ = 8.0*(y-g_yMclik);


    // find how far we dragged the mouse:
    g_xMdragTot += (x - g_xMclik);
    g_yMdragTot += (y - g_yMclik);
    
    g_xMclik = x;
    g_yMclik = y;
};

function myMouseUp(ev) {
    var rect = ev.target.getBoundingClientRect();
    var xp = ev.clientX - rect.left;
    var yp = canvas.height - (ev.clientY - rect.top);


    var x = (xp - canvas.width / 2) / (canvas.width / 2);
    var y = (yp - canvas.height / 2) / (canvas.height / 2);

    g_isDrag = false;
    g_xMdragTot += (x - g_xMclik);
    g_yMdragTot += (y - g_yMclik);
    // console.log('myMouseUp  (CVV coords  ):  x, y=\t',x,',\t',y);
    // dragQuat(x - g_xMclik, y - g_yMclik);
    // console.log("yclick: ", g_yMclik)

};

function dragQuat(xdrag, ydrag) {
    //from controlQuaterion.js
    var res = 5;
    var qTmp = new Quaternion(0, 0, 0, 1);
    var dist = Math.sqrt(xdrag * xdrag + ydrag * ydrag);
    qNew.setFromAxisAngle(-ydrag + 0.0001, xdrag + 0.0001, 0.0, dist * 150.0); // (why add tiny 0.0001? To ensure we never have a zero-length rotation axis)
    qTmp.multiply(qNew, qTot);			// apply new rotation to current rotation. 
    qTot.copy(qTmp);
};
