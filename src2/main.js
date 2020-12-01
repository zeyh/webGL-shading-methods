/*
* Done: individual VBO
? Doing: Large, Slowly-spinning Sphere
! TODO: Ground-Plane vs Grid?
! TODO: 3D View Control: z-up? really??
! TODO: Large, Slowly-spinning Sphere
! TODO: Single-Viewport 
! TODO: general diffuse shading
! TODO: 3-Jointed Shape w/ diffuse shading*3 
! TODO: Point light on the sphere
! TODO: Gouraud/Phong shading
! TODO: different-looking Phong Materials*3 -"materials_Ayerdi.js”
! TODO: user-adjustable 3D light source
! TODO: Interactive switching between all available lighting/shading methods*2
! TODO: lighting/shading methods*4
! TODO: user-switched materials for individual 3d part*1
! TODO: user-selected distance dependencies???
! TODO: second, ‘headlight’ light-source on/off
! TODO: geometric shape distortions in shaders???
! TODO: Simple Texture Maps emmisive
*/

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


    var tick = function () {
        g_canvasID.width = window.innerWidth * 1; //resize canvas
        g_canvasID.height = window.innerHeight * 7 / 10;
        currentAngle = animate(currentAngle);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);    // Clear color and depth buffer
        gl.viewport(0, 0, g_canvasID.width, g_canvasID.height);
        

        drawAll();
        window.requestAnimationFrame(tick, g_canvasID);


    }
    tick();

}

function drawAll(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);    // Clear color and depth buffer
    var cube = new VBO_genetic(cube_vertices, cube_colors, cube_normals, cube_indices);
    cube.init();
    cube.switchToMe();
    cube.adjust();
    cube.draw();

    // var sphere = new VBO_genetic(sphere_vertices, sphere_colors, sphere_normals, sphere_indices);
    // sphere.init();
    // sphere.switchToMe();
    // sphere.adjust();
    // sphere.draw();
}