/*
* Done: individual VBO
* Done: Large, Slowly-spinning Sphere
* Done: Ground-Plane vs Grid?
* Done: 3D View Control: z-up? really??
* Done: Single-Viewport 
* Done: general diffuse shading
* Done: Point light on the cube
? Doing: Phong shading
! TODO: Gouraud/Phong shading*4
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
var vboArray;

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
        materialKeyPress(ev);
    };

    // Set the clear color and enable the depth test
    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    gl.enable(gl.DEPTH_TEST);
    // gl.enable(gl.BLEND);// Enable alpha blending
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // Set blending function conflict with shadow...?
    g_modelMatrix = new Matrix4(); 


    var grid = new VBO_genetic(diffuseVert, diffuseFrag, grid_vertices, grid_colors, grid_normals, null, 0);
    grid.init();

    //diffuse - 0
    var cube = new VBO_genetic(diffuseVert, diffuseFrag, cube_vertices, cube_colors, cube_normals, cube_indices, 0);
    cube.init();

    //pointLight - 1
    var cube_red = new VBO_genetic(pointLightVert, pointLightFrag, cube_vertices, cube_colors_white, cube_normals, cube_indices, 1);
    cube_red.init();

    //blinn phong shading - 2
    var sphere = new VBO_genetic(phongVert, phongFrag, sphere_vertices, sphere_colors, sphere_normals, sphere_indices, 2);
    sphere.init();

    //draggable light - 3
    var sphere_drag = new VBO_genetic(draggablePhongVert, draggablePhongFrag, sphere_vertices, sphere_colors, sphere_normals, sphere_indices, 3);
    sphere_drag.init();

    //Fog - 4
    var cube_fog = new VBO_genetic(fogVert, fogFrag, cube_vertices, cube_colors_multi, cube_normals, cube_indices, 4);
    cube_fog.init();

    vboArray = [grid, cube, sphere, cube_red, sphere_drag, cube_fog];

    var tick = function () {
        canvas.width = window.innerWidth * 1; //resize canvas
        canvas.height = window.innerHeight * 7 / 10;
        currentAngle = animate(currentAngle);
        g_cloudAngle = animateCloud();

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


function drawAll([grid, cube, sphere, cube_red, sphere_drag, cube_fog]){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);    // Clear color and depth buffer

    //draw cube
    pushMatrix(g_modelMatrix);
    g_modelMatrix.setScale(0.3,1.5,0.3);
    g_modelMatrix.rotate(currentAngle, 0,1,0);
    cube.switchToMe();
    cube.draw(g_modelMatrix, g_viewProjMatrix);
    g_modelMatrix = popMatrix();

    //draw point light cube
    pushMatrix(g_modelMatrix);
    g_modelMatrix.setTranslate(-3.4,2.1,0);
    g_modelMatrix.rotate(0.5, 1,0,0);
    g_modelMatrix.rotate(currentAngle, 0,1,0);
    g_modelMatrix.scale(1.2,0.45,1.2);
    cube_red.switchToMe();
    cube_red.draw(g_modelMatrix, g_viewProjMatrix);
    g_modelMatrix = popMatrix();

    // // draw cube with fog
    pushMatrix(g_modelMatrix);
    g_modelMatrix.setTranslate(2.5,1,0);
    g_modelMatrix.scale(0.6,0.6,0.6);
    g_modelMatrix.rotate(currentAngle, 0,1,0);
    cube_fog.switchToMe();
    cube_fog.draw(g_modelMatrix, g_viewProjMatrix);
    g_modelMatrix = popMatrix();

    //blinn phong lighting sphere
    pushMatrix(g_modelMatrix);
    g_modelMatrix.setScale(0.6,0.6,0.6);
    g_modelMatrix.translate(-4.2,1,0);
    sphere.switchToMe();
    sphere.draw(g_modelMatrix, g_viewProjMatrix);
    g_modelMatrix = popMatrix();


    //draw draggable light source on sphere
    if(!hideSphere){
        pushMatrix(g_modelMatrix);
        g_modelMatrix.setScale(1,1,1);
        g_modelMatrix.translate(0,3,0);
        // g_modelMatrix.rotate(currentAngle, 0,1,0);
        sphere_drag.switchToMe();
        sphere_drag.draw(g_modelMatrix, g_viewProjMatrix);
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