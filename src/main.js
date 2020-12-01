/*
* Almost Done: Ground-Plane vs Grid?
* Almost Done: 3D View Control: z-up? really??
* Done: Large, Slowly-spinning Sphere
* Done: Single-Viewport 
* Done: general diffuse shading
? Doing: 3-Jointed Shape w/ diffuse shading*3 
? Doing: Point light on the sphere
? Doing: Gouraud/Phong shading
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
var canvas;
var gl;

function main() {
    // Retrieve <canvas> element
    console.log("I'm in webglDrawing.js right now...");
    canvas = document.getElementById('webgl');
    // setControlPanel(); //init DAT.GUI for controllers for frustrums
    // Get the rendering context for WebGL
    gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders for regular drawing
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) { //bind normal program to gl.program too...
        console.log('Failed to intialize shaders.');
        return;
    }

    gl.program.u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    gl.program.u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    if (!gl.program.u_MvpMatrix || !gl.program.u_NormalMatrix) {
        console.log('Failed to get the storage location of attribute or uniform variable from normalProgram');
        return;
    }

    // ! Set the vertex information
    // var triangle = initVertexBuffersForTriangle(gl);
    // var cube = initVertexBuffersForShape4(gl);
    // var thunder2 = initVertexBuffersForShape2(gl, 0.5);
    // var thunder = initVertexBuffersForShape2(gl, 1);
    // var semiSphere = initVertexBuffersForShape1(gl);
    var sphere = initVertexBuffersForSphere(gl, 0.6);
    var cube2 = initVertexBuffersForCube2(gl);
    var groundPlane = initVertexBuffersForGroundPlane(gl);
    var groundGrid = initVertexBuffersForGroundGrid(gl);
    // if (!triangle || !cube || !groundGrid || !thunder 
    //     || !semiSphere || !axis || !groundPlane || !sphere ) {
    //     console.log('Failed to set the vertex information');
    //     return;
    // }
    if ( !sphere ) {
        console.log('Failed to set the vertex information');
        return;
    }
    if ( !cube2 ) {
        console.log('Failed to set the vertex information');
        return;
    }
    if ( !groundGrid ||  !groundPlane) {
        console.log('Failed to set the vertex information');
        return;
    }

    // ! vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    // var cube3 = new VBO_Cube3();
    // cube3.init(gl);
    // ! ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^


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



    // var vbArray = [triangle, cube, thunder, groundGrid, semiSphere, axis, thunder2, axis2, groundPlane, sphere];
    var vbArray = [null, null, null, groundGrid, null, null, null, null, groundPlane, sphere, cube2];
    var tick = function () {
        canvas.width = window.innerWidth * 1; //resize canvas
        canvas.height = window.innerHeight * 7 / 10;
        currentAngle = animate(currentAngle);
        g_cloudAngle = animateCloud();
        if(!isStop){
            g_jointAngle = animateJoints();
        }
        g_time = showCurTime();


        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);    // Clear color and depth buffer
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        drawAll(gl, gl.program, vbArray, currentAngle, viewProjMatrix) // ! I'm drawin

        window.requestAnimationFrame(tick, canvas);
    };
    tick();
}


function initFramebufferObject(gl) { //not used
    var framebuffer, texture, depthBuffer;

    // Define the error handling function
    var error = function () {
        if (framebuffer) gl.deleteFramebuffer(framebuffer);
        if (texture) gl.deleteTexture(texture);
        if (depthBuffer) gl.deleteRenderbuffer(depthBuffer);
        return null;
    }

    // Create a frame buffer object (FBO)
    framebuffer = gl.createFramebuffer();
    if (!framebuffer) {
        console.log('Failed to create frame buffer object');
        return error();
    }

    // Create a texture object and set its size and parameters
    texture = gl.createTexture(); // Create a texture object
    if (!texture) {
        console.log('Failed to create texture object');
        return error();
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    // Create a renderbuffer object and Set its size and parameters
    depthBuffer = gl.createRenderbuffer(); // Create a renderbuffer object
    if (!depthBuffer) {
        console.log('Failed to create renderbuffer object');
        return error();
    }
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);

    // Attach the texture and the renderbuffer object to the FBO
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

    // Check if FBO is configured correctly
    var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (gl.FRAMEBUFFER_COMPLETE !== e) {
        console.log('Frame buffer object is incomplete: ' + e.toString());
        return error();
    }

    framebuffer.texture = texture; // keep the required object

    // Unbind the buffer object
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);

    return framebuffer;
}
