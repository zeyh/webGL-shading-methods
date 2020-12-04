/*
  Done: individual VBO
  Done: Ground-Plane vs Grid?
  Done: 3D View Control: z-up? really??
  Done: Single-Viewport 
  Done: general diffuse shading
  Done: Point light on the cube
  Done: Blinn Phong shading
  Done: Large, Slowly-spinning Sphere [move at (0,0,0)]
  Done: Assign different looking phong material to 3+ object
* Almost: user-selected distance dependencies??? does Foggy effect count?
* Almost: Add on screen instructions for each lighting scheme

? Doing: Rearrange Objects + 3 solid jointed obj 🤬
! TODO: lighting change with object movement...😠
! TODO: non-directional light source (headlight) on/off
! TODO: geometric shape distortions in shaders???
! TODO: Simple Texture Maps emmisive

! TODO: lighting/shading methods*4👇
! 70%: Phong lighting with Phong Shading, (no half-angles; uses true reflection angle)
! 70%: Blinn-Phong lighting with Phong Shading (requires ‘half-angle’, not reflection angle)
! 30%: Phong lighting with Gouraud Shading (computes colors per vertex; interpolates color only)
! 30%: Blinn-Phong lighting with Gouraud Shading (computes colors per vertex; interpolates color only)
*/

"use strict"
var canvas;	
var gl;	
var g_viewProjMatrix;
var g_modelMatrix;
var shaderingScheme;
var vboArray;

function initVBOs(currScheme){
    var grid = new VBO_genetic(diffuseVert, diffuseFrag, grid_vertices, grid_colors, grid_normals, null, 0);
    grid.init();
    var plane = new VBO_genetic(currScheme[0][0], currScheme[0][1], plane_vertices, plane_colors, plane_normals, plane_indices, currScheme[0][2], 11);
    plane.init();
    var cube = new VBO_genetic(currScheme[1][0], currScheme[1][1], cube_vertices, cube_colors, cube_normals, cube_indices, currScheme[1][2], 7);
    cube.init();
    var cube_red = new VBO_genetic(currScheme[2][0], currScheme[2][1], cube_vertices, cube_colors_white, cube_normals, cube_indices, currScheme[2][2], 18);
    cube_red.init();
    var cube_joint = new VBO_genetic(currScheme[0][0], currScheme[0][1], cube_vertices, cube_colors_white, cube_normals, cube_indices, currScheme[0][2], 15);
    cube_joint.init();
    var sphere = new VBO_genetic(currScheme[3][0], currScheme[3][1], sphere_vertices, sphere_colors, sphere_normals, sphere_indices, currScheme[3][2], 10);
    sphere.init();
    var sphere2 =  new VBO_genetic(currScheme[3][0], currScheme[3][1], sphere_vertices2, sphere_colors2, sphere_normals2, sphere_indices2, currScheme[3][2], 10);
    sphere2.init();
    var sphere3 =  new VBO_genetic(currScheme[3][0], currScheme[3][1], sphere_vertices, sphere_colors, sphere_normals, sphere_indices, currScheme[3][2], 18);
    sphere3.init(); //only material change
    var sphere4 =  new VBO_genetic(currScheme[3][0], currScheme[3][1],  sphere_vertices2, sphere_colors2, sphere_normals2, sphere_indices2, currScheme[3][2], 15);
    sphere4.init(); //only material change
    var sphere_drag = new VBO_genetic(currScheme[4][0], currScheme[4][1], sphere_vertices, sphere_colors, sphere_normals, sphere_indices, currScheme[4][2]);
    sphere_drag.init();
    var cube_fog = new VBO_genetic(currScheme[5][0], currScheme[5][1], cube_vertices, cube_colors_multi, cube_normals, cube_indices, currScheme[5][2]);
    cube_fog.init();


    vboArray = [grid, cube, sphere, cube_red, sphere_drag, cube_fog, plane, sphere2, cube_joint, sphere3, sphere4];
}
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
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    // gl.enable(gl.BLEND);// Enable alpha blending
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // Set blending function conflict with shadow...?
    g_modelMatrix = new Matrix4(); 

    shaderingScheme = { //! [plane, cube, cube2, sphere, sphere2, cube3]
        0:[
            [draggablePhongVert,draggablePhongFrag,3], //! [vert, frag shader, light Spec, material code]
            [draggablePhongVert,draggablePhongFrag,3],
            [draggablePhongVert,draggablePhongFrag,3],
            [draggablePhongVert,draggablePhongFrag,3],
            [draggablePhongVert,draggablePhongFrag,3],
            [fogVert,fogFrag,4]
        ],
        1:[
            [pointLightVert,pointLightFrag,1], //maybe a better way to structure this...
            [pointLightVert,pointLightFrag,1],
            [pointLightVert,pointLightFrag,1],
            [pointLightVert,pointLightFrag,1],
            [pointLightVert,pointLightFrag,1],
            [pointLightVert,pointLightFrag,1]
        ],
        2:[
            [phongVert,phongFrag,2],
            [phongVert,phongFrag,2],
            [phongVert,phongFrag,2],
            [phongVert,phongFrag,2],
            [phongVert,phongFrag,2],
            [phongVert,phongFrag,2],
        ],
        3:[
            [draggablePhongVert,draggablePhongFrag,3],
            [draggablePhongVert,draggablePhongFrag,3],
            [draggablePhongVert,draggablePhongFrag,3],
            [draggablePhongVert,draggablePhongFrag,3],
            [draggablePhongVert,draggablePhongFrag,3],
            [draggablePhongVert,draggablePhongFrag,3],
        ],
        4:[
            [fogVert,fogFrag,4],
            [fogVert,fogFrag,4],
            [fogVert,fogFrag,4],
            [fogVert,fogFrag,4],
            [fogVert,fogFrag,4],
            [fogVert,fogFrag,4],
        ],
    };
    // ! scheme selection
    var currScheme = shaderingScheme[g_schemeOpt]; 
    controlScheme(); //get the slider responsive

    
    var tick = function () {
        canvas.width = window.innerWidth * 1; //resize canvas
        canvas.height = window.innerHeight * 7 / 10;
        currentAngle = animate(currentAngle);
        g_cloudAngle = animateCloud();
        g_jointAngle = animateJoints();
        g_jointAngle2 = animateJoints2();
        
        // ! setting view control
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);    // Clear color and depth buffer
        gl.viewport(0, 0, canvas.width, canvas.height);
        g_viewProjMatrix = new Matrix4(); //should be the same for every vbo
        var aspectRatio = (gl.canvas.width) / (gl.canvas.height);
        g_viewProjMatrix.setPerspective(30.0, aspectRatio, 1, 100);
        g_viewProjMatrix.lookAt(g_EyeX, g_EyeY, g_EyeZ, g_LookX, g_LookY, g_LookZ, 0, 1, 0); //center/look-at point
        g_viewProjMatrix.scale(0.4 * g_viewScale, 0.4 * g_viewScale, 0.4 * g_viewScale); //scale everything
    
        drawAll(vboArray);
        window.requestAnimationFrame(tick, canvas);


    }
    tick();

}






