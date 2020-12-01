"use strict"
var g_canvasID;	
var gl;	

function main() {
    console.log("I'm in webglDrawing.js version 2 right now...");
    g_canvasID = document.getElementById('webgl');
    gl = g_canvasID.getContext("webgl", { preserveDrawingBuffer: true});
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    window.addEventListener("mousedown", myMouseDown);
    window.addEventListener("mousemove", myMouseMove);
    window.addEventListener("mouseup", myMouseUp);
    window.addEventListener("wheel", mouseWheel);
    document.onkeydown = function (ev) {
        keyAD(ev);
        keyWS(ev);
        keyQE(ev);
        keyArrowRotateRight(ev);
        keyArrowRotateUp(ev);
    };

    // Set the clear color and enable the depth test
    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    gl.enable(gl.DEPTH_TEST);
    // gl.enable(gl.BLEND);// Enable alpha blending
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // Set blending function conflict with shadow...?

    var cube = new VBO_Cube();
    cube.init();
    cube.switchToMe();
    cube.adjust();
    cube.draw();



}
