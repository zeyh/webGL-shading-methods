/*
* Done: individual VBO
* Done: Large, Slowly-spinning Sphere
* Done: Ground-Plane vs Grid?
* Done: 3D View Control: z-up? really??
* Done: Single-Viewport 
* Done: general diffuse shading
? Doing: Point light on the sphere
! TODO: Gouraud/Phong shading
! TODO: different-looking Phong Materials*3 -"materials_Ayerdi.js”
! TODO: user-adjustable 3D light source
! TODO: Interactive switching between all available lighting/shading methods*2
! TODO: lighting/shading methods*4
! TODO: user-switched materials for individual 3d part*1
! TODO: 3-Jointed Shape w/ diffuse shading*3 
! TODO: user-selected distance dependencies???
! TODO: second, ‘headlight’ light-source on/off
! TODO: geometric shape distortions in shaders???
! TODO: Simple Texture Maps emmisive
*/

"use strict"
var canvas;	
var gl;	
var g_viewProjMatrix;
var g_modelMatrix;

function main() {
    console.log("I'm in webglDrawing.js version 2 right now...");
    canvas = document.getElementById('webgl');
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
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
    g_modelMatrix = new Matrix4(); 


    var grid = new VBO_genetic(diffuseVert, diffuseFrag, grid_vertices, grid_colors, grid_normals, null);
    grid.init();
    var cube = new VBO_genetic(diffuseVert, diffuseFrag, cube_vertices, cube_colors, cube_normals, cube_indices);
    cube.init();
    var sphere = new VBO_genetic(diffuseVert, diffuseFrag, sphere_vertices, sphere_colors, sphere_normals, sphere_indices);
    sphere.init();
    var vboArray = [grid, cube, sphere];

    var tick = function () {
        canvas.width = window.innerWidth * 1; //resize canvas
        canvas.height = window.innerHeight * 7 / 10;
        currentAngle = animate(currentAngle);
        
        // ! setting view control
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);    // Clear color and depth buffer
        gl.viewport(0, 0, canvas.width, canvas.height);
        g_viewProjMatrix = new Matrix4(); //should be the same for every vbo
        var aspectRatio = (gl.canvas.width) / (gl.canvas.height);
        g_viewProjMatrix.setPerspective(45.0, aspectRatio, 1, 100);
        g_viewProjMatrix.lookAt(g_EyeX, g_EyeY, g_EyeZ, g_LookX, g_LookY, g_LookZ, 0, 1, 0); //center/look-at point
        g_viewProjMatrix.scale(0.4 * g_viewScale, 0.4 * g_viewScale, 0.4 * g_viewScale); //scale everything
    
        drawAll(vboArray);
        window.requestAnimationFrame(tick, canvas);


    }
    tick();

}

function drawAll([grid, cube, sphere]){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);    // Clear color and depth buffer

    //draw cube
    pushMatrix(g_modelMatrix);
    g_modelMatrix.setScale(0.5,0.5,0.5);
    g_modelMatrix.rotate(currentAngle, 0,1,0);
    cube.switchToMe();
    cube.draw(g_modelMatrix, g_viewProjMatrix);
    g_modelMatrix = popMatrix();

    //draw sphere
    if(!hideSphere){
        pushMatrix(g_modelMatrix);
        g_modelMatrix.setScale(1,1,1);
        g_modelMatrix.translate(0,3,0);
        g_modelMatrix.rotate(currentAngle, 0,1,0);
        sphere.switchToMe();
        sphere.draw(g_modelMatrix, g_viewProjMatrix);
        g_modelMatrix = popMatrix();
    }

    //draw grid
    if(!hideGrid){
        pushMatrix(g_modelMatrix);
        g_viewProjMatrix.rotate(-90.0, 1, 0, 0);
        g_viewProjMatrix.translate(0.0, 0.0, -0.6);
        g_viewProjMatrix.scale(0.4, 0.4, 0.4);
        grid.switchToMe();
        grid.draw(g_modelMatrix, g_viewProjMatrix);
        g_modelMatrix = popMatrix();
    }





}