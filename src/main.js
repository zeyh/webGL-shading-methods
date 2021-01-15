/*
Dec 7, 2020
References: besides the inline links in index.html, the code is modified from 
    [Textbook Chapter 8,9,10] Fog.js, LightedCube.js, PointLightedCube.js, 2012 matsuda and kanda
    [Canvas ProjC Page] JT_VBObox-lib.js, JTSecondLight_perFragment.js, JTPointBlinnPhongSphere_perFragment.js
    [Previous projects] ProjectA, ProjectB
*/
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
  Done: Rearrange Objects + 3 solid jointed obj 
  Done: Add on screen instructions for each lighting scheme/ available keyboard/mouse interation options
  Done: Gouraud Shading
  Done: combine to get the 4 methods👇
  ✨lighting/shading methods*4👇
  100%: Phong lighting with Phong Shading, (no half-angles; uses true reflection angle)
  100%: Blinn-Phong lighting with Phong Shading (requires ‘half-angle’, not reflection angle)
  100%: Phong lighting with Gouraud Shading (computes colors per vertex; interpolates color only)
  100%: Blinn-Phong lighting with Gouraud Shading (computes colors per vertex; interpolates color only)
  Done: add second light switch on/off

! Bug🐞: 0. [setting with clearDrag @ htmlCallBack.js] lighting change with object movement...😠 

! TODO: 2. usercontrol:
            ❌ world-space position, 
            ✅ switch light on/off,
            ✅ set separate R,G,B values for each of the ambient, diffuse, and specular light amount
! TODO: 4. Simple Texture Maps emmisive

! future work😐: user-selected distance dependencies??? does Foggy effect count for 1/3?
! future work😠: modify [shaderinfo.js] and the [shadingScheme] object to be less repetitive...
! future work😐: geometric shape distortions in shaders???
*/

"use strict"
var canvas;	
var gl;	
var g_viewProjMatrix;
var g_modelMatrix;
var shadingScheme;
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
    // gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);// Enable alpha blending
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // Set blending function conflict with shadow...?
    g_modelMatrix = new Matrix4(); 

    // TODO: maybe a better way to structure this...
    shadingScheme = { //[plane, cube, cube2, sphere, sphere2, cube3] 
        0:[
            [draggableBlinnPhongVert,draggableBlinnPhongFrag,3], // [vert, frag shader, light Spec, material code]
            [draggableBlinnPhongVert,draggableBlinnPhongFrag,3], // ! all material applied & interations
            [draggableBlinnPhongVert,draggableBlinnPhongFrag,3],
            [draggableBlinnPhongVert,draggableBlinnPhongFrag,3],
            [draggableBlinnPhongVert,draggableBlinnPhongFrag,3],
            [draggableBlinnPhongVert,draggableBlinnPhongFrag,3]
        ],
        1:[
            [PhongPhongVert,PhongPhongFrag,5], // ! Phong Shading & Phong Lighting
            [PhongPhongVert,PhongPhongFrag,5],
            [PhongPhongVert,PhongPhongFrag,5],
            [PhongPhongVert,PhongPhongFrag,5],
            [PhongPhongVert,PhongPhongFrag,5],
            [PhongPhongVert,PhongPhongFrag,5],
        ],
        2:[
            [gouraudPhongVert,gouraudPhongFrag,5], // ! Gouraud Shading & Phong Lighting
            [gouraudPhongVert,gouraudPhongFrag,5],
            [gouraudPhongVert,gouraudPhongFrag,5],
            [gouraudPhongVert,gouraudPhongFrag,5],
            [gouraudPhongVert,gouraudPhongFrag,5],
            [gouraudPhongVert,gouraudPhongFrag,5],
        ],
        3:[
            [fogVert,fogFrag,4], // ! distance dependent
            [fogVert,fogFrag,4],
            [fogVert,fogFrag,4],
            [fogVert,fogFrag,4],
            [fogVert,fogFrag,4],
            [fogVert,fogFrag,4],
        ],
        4:[
            [draggableBlinnPhongVert,draggableBlinnPhongFrag,5],  // ! Phong Shading & Blinn Phong Lighting
            [draggableBlinnPhongVert,draggableBlinnPhongFrag,5],
            [draggableBlinnPhongVert,draggableBlinnPhongFrag,5],
            [draggableBlinnPhongVert,draggableBlinnPhongFrag,5],
            [draggableBlinnPhongVert,draggableBlinnPhongFrag,5],
            [draggableBlinnPhongVert,draggableBlinnPhongFrag,5],
        ],
        5:[
            [gouraudBlinnVert,gouraudBlinnFrag,5], 
            [gouraudBlinnVert,gouraudBlinnFrag,5], // ! Gouraud Shading & Blinn Phong Lighting
            [gouraudBlinnVert,gouraudBlinnFrag,5],
            [gouraudBlinnVert,gouraudBlinnFrag,5],
            [gouraudBlinnVert,gouraudBlinnFrag,5],
            [gouraudBlinnVert,gouraudBlinnFrag,5]
        ],
    };

    // ! scheme selection
    controlScheme(); //get the slider responsive
    controlSwitch(); //set the switch
    controlSwitch2();
    controlSwitch3();
    controlSwitch4();
    
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



// for debugging github pages...
var draggableBlinnPhongVert = 
    "struct MatlT {\n" +
    "		vec3 emit;\n" + // Ke: emissive -- surface 'glow' amount (r,g,b);
    "		vec3 ambi;\n" + // Ka: ambient reflectance (r,g,b)
    "		vec3 diff;\n" + // Kd: diffuse reflectance (r,g,b)
    "		vec3 spec;\n" + // Ks: specular reflectance (r,g,b)
    "		int shiny;\n" + // Kshiny: specular exponent (integer >= 1; typ. <200)
    "		};\n" +
    "attribute vec4 a_Position; \n" +
    "attribute vec4 a_Normal; \n" +
    // 	'uniform vec3 u_Kd; \n' +	//reflect entire sphere	 Later: as vertex attrib
    "uniform MatlT u_MatlSet[1];\n" + // Array of all materials.
    "uniform mat4 u_MvpMatrix; \n" +
    "uniform mat4 u_ModelMatrix; \n" +
    "uniform mat4 u_NormalMatrix; \n" +

    //-------------VARYING:Vertex Shader values sent per-pixel to Fragment shader:
    "varying vec3 v_Kd; \n" + // Phong Lighting: diffuse reflectance
    "varying vec4 v_Position; \n" +
    "varying vec3 v_Normal; \n" + // Why Vec3? its not a point, hence w==0

    "void main() { \n" +
    "  gl_Position = u_MvpMatrix * a_Position;\n" +
    "  v_Position = u_ModelMatrix * a_Position; \n" +
    "  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n" +
    "  v_Kd = u_MatlSet[0].diff; \n" + // find per-pixel diffuse reflectance from per-vertex
    "}\n";

var draggableBlinnPhongFrag =  // ! TODO: add second head light
    'precision highp float;\n' +
    'precision highp int;\n' +
  
    //--------------- GLSL Struct Definitions:
    'struct LampT {\n' +		// Describes one point-like Phong light source
    '	vec3 pos;\n' +			// (x,y,z,w); w==1.0 for local light at x,y,z position
    ' 	vec3 ambi;\n' +			// Ia ==  ambient light source strength (r,g,b)
    ' 	vec3 diff;\n' +			// Id ==  diffuse light source strength (r,g,b)
    '	vec3 spec;\n' +			// Is == specular light source strength (r,g,b)
    '}; \n' +

    'struct MatlT {\n' +		// Describes one Phong material by its reflectances:
    '		vec3 emit;\n' +			// Ke: emissive -- surface 'glow' amount (r,g,b);
    '		vec3 ambi;\n' +			// Ka: ambient reflectance (r,g,b)
    '		vec3 diff;\n' +			// Kd: diffuse reflectance (r,g,b)
    '		vec3 spec;\n' + 		// Ks: specular reflectance (r,g,b)
    '		int shiny;\n' +			// Kshiny: specular exponent (integer >= 1; typ. <200)
    '		};\n' +

    //-------------UNIFORMS: values set from JavaScript before a drawing command.
    'uniform LampT u_LampSet[2];\n' +		// Array of all light sources.
    'uniform MatlT u_MatlSet[1];\n' +		// Array of all materials.
    'uniform vec3 u_eyePosWorld; \n' + 	// Camera/eye location in world coords.

    //-------------VARYING:Vertex Shader values sent per-pixel to Fragment shader: 
    'varying vec3 v_Normal;\n' +			// Find 3D surface normal at each pix
    'varying vec4 v_Position;\n' +			// pixel's 3D pos too -- in 'world' coords
    'varying vec3 v_Kd;	\n' +			    // Find diffuse reflectance K_d per pix

    'void main() { \n' +
    '  vec3 normal = normalize(v_Normal); \n' +
    '  vec3 eyeDirection = normalize(u_eyePosWorld - v_Position.xyz); \n' +

    // Light Source 1
    '  vec3 lightDirection = normalize(u_LampSet[0].pos - v_Position.xyz);\n' +
    '  float nDotL = max(dot(lightDirection, normal), 0.0); \n' +
    // ? vvvvvvvvvvvvvvvvvvvvvvvv
    '  vec3 H = normalize(lightDirection + eyeDirection); \n' +
    '  float nDotH = max(dot(H, normal), 0.0); \n' +
    '  float e64 = pow(nDotH, float(u_MatlSet[0].shiny));\n' + // pow() won't accept integer exponents! Convert K_shiny!  
    // ? ^^^^^^^^^^^^^^^^^^^^^^^^
    '  vec3 emissive = u_MatlSet[0].emit;' +
    '  vec3 ambient = u_LampSet[0].ambi * u_MatlSet[0].ambi;\n' +
    '  vec3 diffuse = u_LampSet[0].diff * v_Kd * nDotL;\n' +
    '  vec3 speculr = u_LampSet[0].spec * u_MatlSet[0].spec * e64;\n' +

    //Light Source 2 (headlight)
    '  vec3 lightDirection2 = normalize(u_LampSet[1].pos - v_Position.xyz);\n' +
    '  float nDotL2 = max(dot(lightDirection2, normal), 0.0); \n' +
    // ? vvvvvvvvvvvvvvvvvvvvvvvv
    '  vec3 H2 = normalize(lightDirection2 + eyeDirection); \n' +
    '  float nDotH2 = max(dot(H2, normal), 0.0); \n' +
    '  float e64_2 = pow(nDotH2, float(u_MatlSet[0].shiny));\n' + // pow() won't accept integer exponents! Convert K_shiny!  
    // ? ^^^^^^^^^^^^^^^^^^^^^^^^
    '  vec3 ambient2 = u_LampSet[1].ambi * u_MatlSet[0].ambi;\n' +
    '  vec3 diffuse2 = u_LampSet[1].diff * v_Kd * nDotL2;\n' +
    '  vec3 speculr2 = u_LampSet[1].spec * u_MatlSet[0].spec * e64_2;\n' +

    '  gl_FragColor = vec4(emissive + ambient + diffuse + speculr + ambient2 + diffuse2 + speculr2 , 1.0);\n' +
    '}\n';


var gouraudPhongVert = // ! test blinn phong with gouraud 
    'precision highp float;\n' +
    'precision highp int;\n' +
    'attribute vec4 a_Position; \n' +		
    'attribute vec4 a_Normal; \n' +			

    'uniform mat4 u_MvpMatrix; \n' +
    'uniform mat4 u_ModelMatrix; \n' + 		
    'uniform mat4 u_NormalMatrix; \n' +  	
    'uniform vec3 u_eyePosWorld; \n' + 	
    

    'struct MatlT {\n' +		// Describes one Phong material by its reflectances:
    '		vec3 emit;\n' +			// Ke: emissive -- surface 'glow' amount (r,g,b);
    '		vec3 ambi;\n' +			// Ka: ambient reflectance (r,g,b)
    '		vec3 diff;\n' +			// Kd: diffuse reflectance (r,g,b)
    '		vec3 spec;\n' + 		// Ks: specular reflectance (r,g,b)
    '		int shiny;\n' +			// Kshiny: specular exponent (integer >= 1; typ. <200)
    '		};\n' +

    'struct LampT {\n' +		// Describes one point-like Phong light source
	'	vec3 pos;\n' +			// (x,y,z,w); w==1.0 for local light at x,y,z position
	' 	vec3 ambi;\n' +			// Ia ==  ambient light source strength (r,g,b)
	' 	vec3 diff;\n' +			// Id ==  diffuse light source strength (r,g,b)
	'	vec3 spec;\n' +			// Is == specular light source strength (r,g,b)
    '}; \n' +
    
    'uniform MatlT u_MatlSet[1];\n' +	
    'uniform LampT u_LampSet[1];\n' +
    'varying vec3 v_Color;\n' +

    'void main() { \n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    '  vec4 position = u_ModelMatrix * a_Position; \n' +
    "  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal)); \n" + 
    '  vec3 eyeDirection = normalize(u_eyePosWorld.xyz - position.xyz); \n' +
    '  vec3 lightDirection = normalize(u_LampSet[0].pos - position.xyz);\n' +

    '  vec3 Kd = u_MatlSet[0].diff; \n' +		// find per-pixel diffuse reflectance from per-vertex
    '  float nDotL = max(dot(lightDirection, normal), 0.0); \n' + //cosine-falloff fact for diffuse
    // ? vvvvvvvvvvvvvvvvvvvvvvvv
    '  vec3 reflec = normalize(2.0*(normal * nDotL) - lightDirection);\n' + // ? phong no half
    '  float rDotV = max(dot(reflec, eyeDirection), 0.0); \n' +
    '  float e64 = pow(rDotV, float(u_MatlSet[0].shiny));\n' +
    // ? ^^^^^^^^^^^^^^^^^^^^^^^^
    '  vec3 emissive = u_MatlSet[0].emit;' +
    '  vec3 ambient = u_LampSet[0].ambi * u_MatlSet[0].ambi;\n' +
    '  vec3 diffuse = u_LampSet[0].diff * Kd * nDotL;\n' +
    '  vec3 speculr = u_LampSet[0].spec * u_MatlSet[0].spec * e64;\n' +

    '  v_Color =  emissive + ambient + diffuse + speculr;\n' +
    '}\n';

var gouraudPhongFrag  =
    'precision highp float;\n' +
    'precision highp int;\n' +
    'varying vec3 v_Color;\n' +
    'void main() { \n' +
    '  gl_FragColor = vec4(v_Color, 1.0);\n' +
    '}\n';

var gouraudBlinnVert = // ! test blinn phong with gouraud 
    'precision highp float;\n' +
    'precision highp int;\n' +
    'attribute vec4 a_Position; \n' +		
    'attribute vec4 a_Normal; \n' +			

    'uniform mat4 u_MvpMatrix; \n' +
    'uniform mat4 u_ModelMatrix; \n' + 		
    'uniform mat4 u_NormalMatrix; \n' +  	
    'uniform vec3 u_eyePosWorld; \n' + 	
    

    'struct MatlT {\n' +		// Describes one Phong material by its reflectances:
    '		vec3 emit;\n' +			// Ke: emissive -- surface 'glow' amount (r,g,b);
    '		vec3 ambi;\n' +			// Ka: ambient reflectance (r,g,b)
    '		vec3 diff;\n' +			// Kd: diffuse reflectance (r,g,b)
    '		vec3 spec;\n' + 		// Ks: specular reflectance (r,g,b)
    '		int shiny;\n' +			// Kshiny: specular exponent (integer >= 1; typ. <200)
    '		};\n' +

    'struct LampT {\n' +		// Describes one point-like Phong light source
	'	vec3 pos;\n' +			// (x,y,z,w); w==1.0 for local light at x,y,z position
	' 	vec3 ambi;\n' +			// Ia ==  ambient light source strength (r,g,b)
	' 	vec3 diff;\n' +			// Id ==  diffuse light source strength (r,g,b)
	'	vec3 spec;\n' +			// Is == specular light source strength (r,g,b)
    '}; \n' +
    
    'uniform MatlT u_MatlSet[1];\n' +	
    'uniform LampT u_LampSet[1];\n' +
    'varying vec3 v_Color;\n' +

    'void main() { \n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    '  vec4 position = u_ModelMatrix * a_Position; \n' +
    "  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal)); \n" + 
    '  vec3 eyeDirection = normalize(u_eyePosWorld.xyz - position.xyz); \n' +
    '  vec3 lightDirection = normalize(u_LampSet[0].pos - position.xyz);\n' +

    '  vec3 Kd = u_MatlSet[0].diff; \n' +		// find per-pixel diffuse reflectance from per-vertex
    '  float nDotL = max(dot(lightDirection, normal), 0.0); \n' + //cosine-falloff fact for diffuse
    // ? vvvvvvvvvvvvvvvvvvvvvvvv
    '  vec3 H = normalize(lightDirection + eyeDirection);\n' + // ? <calculate half
    '  float nDotH = max(dot(H, normal), 0.0); \n' +
    '  float e64 = pow(nDotH, float(u_MatlSet[0].shiny));\n' +
    // ? ^^^^^^^^^^^^^^^^^^^^^^^^
    '  vec3 emissive = u_MatlSet[0].emit;' +
    '  vec3 ambient = u_LampSet[0].ambi * u_MatlSet[0].ambi;\n' +
    '  vec3 diffuse = u_LampSet[0].diff * Kd * nDotL;\n' +

    '  vec3 speculr = u_LampSet[0].spec * u_MatlSet[0].spec * e64;\n' +

    '  v_Color =  emissive + ambient + diffuse + speculr;\n' +
    '}\n';

var gouraudBlinnFrag  =
    'precision highp float;\n' +
    'precision highp int;\n' +
    'varying vec3 v_Color;\n' +
    'void main() { \n' +
    '  gl_FragColor = vec4(v_Color, 1.0);\n' +
    '}\n';


var PhongPhongVert = 
    "struct MatlT {\n" +
    "		vec3 emit;\n" + // Ke: emissive -- surface 'glow' amount (r,g,b);
    "		vec3 ambi;\n" + // Ka: ambient reflectance (r,g,b)
    "		vec3 diff;\n" + // Kd: diffuse reflectance (r,g,b)
    "		vec3 spec;\n" + // Ks: specular reflectance (r,g,b)
    "		int shiny;\n" + // Kshiny: specular exponent (integer >= 1; typ. <200)
    "		};\n" +
    "attribute vec4 a_Position; \n" +
    "attribute vec4 a_Normal; \n" +
    // 	'uniform vec3 u_Kd; \n' +	//reflect entire sphere	 Later: as vertex attrib
    "uniform MatlT u_MatlSet[1];\n" + // Array of all materials.
    "uniform mat4 u_MvpMatrix; \n" +
    "uniform mat4 u_ModelMatrix; \n" +
    "uniform mat4 u_NormalMatrix; \n" +

    //-------------VARYING:Vertex Shader values sent per-pixel to Fragment shader:
    "varying vec3 v_Kd; \n" + // Phong Lighting: diffuse reflectance
    "varying vec4 v_Position; \n" +
    "varying vec3 v_Normal; \n" + // Why Vec3? its not a point, hence w==0

    "void main() { \n" +
    "  gl_Position = u_MvpMatrix * a_Position;\n" +
    "  v_Position = u_ModelMatrix * a_Position; \n" +
    "  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n" +
    "  v_Kd = u_MatlSet[0].diff; \n" + // find per-pixel diffuse reflectance from per-vertex
    "}\n";

var PhongPhongFrag =  
    'precision highp float;\n' +
    'precision highp int;\n' +
  
    //--------------- GLSL Struct Definitions:
    'struct LampT {\n' +		// Describes one point-like Phong light source
    '	vec3 pos;\n' +			// (x,y,z,w); w==1.0 for local light at x,y,z position
    ' 	vec3 ambi;\n' +			// Ia ==  ambient light source strength (r,g,b)
    ' 	vec3 diff;\n' +			// Id ==  diffuse light source strength (r,g,b)
    '	vec3 spec;\n' +			// Is == specular light source strength (r,g,b)
    '}; \n' +

    'struct MatlT {\n' +		// Describes one Phong material by its reflectances:
    '		vec3 emit;\n' +			// Ke: emissive -- surface 'glow' amount (r,g,b);
    '		vec3 ambi;\n' +			// Ka: ambient reflectance (r,g,b)
    '		vec3 diff;\n' +			// Kd: diffuse reflectance (r,g,b)
    '		vec3 spec;\n' + 		// Ks: specular reflectance (r,g,b)
    '		int shiny;\n' +			// Kshiny: specular exponent (integer >= 1; typ. <200)
    '		};\n' +

    //-------------UNIFORMS: values set from JavaScript before a drawing command.
    'uniform LampT u_LampSet[1];\n' +		// Array of all light sources.
    'uniform MatlT u_MatlSet[1];\n' +		// Array of all materials.
    'uniform vec3 u_eyePosWorld; \n' + 	// Camera/eye location in world coords.

    //-------------VARYING:Vertex Shader values sent per-pixel to Fragment shader: 
    'varying vec3 v_Normal;\n' +				// Find 3D surface normal at each pix
    'varying vec4 v_Position;\n' +			// pixel's 3D pos too -- in 'world' coords
    'varying vec3 v_Kd;	\n' +						// Find diffuse reflectance K_d per pix

    'void main() { \n' +
    '  vec3 normal = normalize(v_Normal); \n' +
    '  vec3 lightDirection = normalize(u_LampSet[0].pos - v_Position.xyz);\n' +
    '  vec3 eyeDirection = normalize(u_eyePosWorld - v_Position.xyz); \n' +
    '  float nDotL = max(dot(lightDirection, normal), 0.0); \n' +
  
    // ? vvvvvvvvvvvvvvvvvvvvvvvv
    '  vec3 reflec = normalize(2.0*(normal * nDotL) - lightDirection); \n' + // ? phong no half
    '  float rDotV = max(dot(reflec, eyeDirection), 0.0); \n' +
    '  float e64 = pow(rDotV, float(u_MatlSet[0].shiny));\n' + // pow() won't accept integer exponents! Convert K_shiny!  
    // ? ^^^^^^^^^^^^^^^^^^^^^^^^
    '  vec3 emissive = u_MatlSet[0].emit;' +
    '  vec3 ambient = u_LampSet[0].ambi * u_MatlSet[0].ambi;\n' +
    '  vec3 diffuse = u_LampSet[0].diff * v_Kd * nDotL;\n' +
    '  vec3 speculr = u_LampSet[0].spec * u_MatlSet[0].spec * e64;\n' +
    '  gl_FragColor = vec4(emissive + ambient + diffuse + speculr , 1.0);\n' +
    '}\n';


var fogVert = 
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
    'uniform vec4 u_eyePosWorld;\n' +     // Position of eye point (world coordinates)
    'varying vec4 v_Color;\n' +
    'varying float v_Dist;\n' +
    'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    '  v_Color = a_Color;\n' +
       // Calculate the distance to each vertex from eye point
    '  v_Dist = distance(u_ModelMatrix * a_Position, u_eyePosWorld);\n' +
    '}\n';

var fogFrag =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'uniform vec3 u_FogColor;\n' + // Color of Fog
    'uniform vec2 u_FogDist;\n' +  // Distance of Fog (starting point, end point)
    'varying vec4 v_Color;\n' +
    'varying float v_Dist;\n' +
    'void main() {\n' +
       // Calculation of fog factor (factor becomes smaller as it goes further away from eye point)
    '  float fogFactor = clamp((u_FogDist.y - v_Dist) / (u_FogDist.y - u_FogDist.x), 0.0, 1.0);\n' +
       // Stronger fog as it gets further: u_FogColor * (1 - fogFactor) + v_Color * fogFactor
    '  vec3 color = mix(u_FogColor, vec3(v_Color), fogFactor);\n' +
    '  gl_FragColor = vec4(color, v_Color.a);\n' +
    '}\n';   


// * =============================== NOT used ===============================================================================
var diffuseVert = // * not used but could be used with lightSpec 0
    "precision highp float;\n" +
    "attribute vec4 a_Position;\n" +
    "attribute vec3 a_Color;\n" +
    "attribute vec3 a_Normal;\n" +
    "varying vec4 v_Color;\n" +
    "uniform mat4 u_MvpMatrix;\n" +
    "uniform mat4 u_ModelMatrix;\n" + // Model matrix
    "uniform mat4 u_NormalMatrix;\n" +
    "void main() {\n" +
    "  vec4 transVec = u_NormalMatrix * vec4(a_Normal, 0.0);\n" +
    "  vec3 normVec = normalize(transVec.xyz);\n" +
    "  vec3 lightVec = vec3(0.1, 0.5, 0.7);\n" +
    "  gl_Position = u_MvpMatrix * a_Position;\n" +
    "  vec4 vertexPosition = u_ModelMatrix * a_Position;\n" +
    "  v_Color = vec4(0.7*a_Color + 0.3*dot(normVec,lightVec), 1.0);\n" +
    "}\n";

var diffuseFrag = // * not used but could be used with lightSpec 0
    "#ifdef GL_ES\n" +
    "precision highp float;\n" +
    "#endif\n" +
    "varying vec4 v_Color;\n" +
    "void main() {\n" +
    "  gl_FragColor = v_Color;\n" +
    "}\n";

var gouraudVert = // * not used but could be used with lightSpec 3
    "attribute vec4 a_Position;\n" +
    "attribute vec4 a_Color;\n" +
    "attribute vec4 a_Normal;\n" +
    "uniform mat4 u_MvpMatrix;\n" +
    "uniform mat4 u_ModelMatrix;\n" + // Model matrix
    "uniform mat4 u_NormalMatrix;\n" + // Coordinate transformation matrix of the normal
    "uniform vec3 u_LightColor;\n" + // Light color
    "uniform vec3 u_LightPosition;\n" + // Position of the light source
    "uniform vec3 u_AmbientLight;\n" + // Ambient light color
    "varying vec4 v_Color;\n" +
    "void main() {\n" +
    "  gl_Position = u_MvpMatrix * a_Position;\n" +
    // Recalculate the normal based on the model matrix and make its length 1.
    "  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n" +
    // Calculate world coordinate of vertex
    "  vec4 vertexPosition = u_ModelMatrix * a_Position;\n" +
    // Calculate the light direction and make it 1.0 in length
    "  vec3 lightDirection = normalize(u_LightPosition - vec3(vertexPosition));\n" +
    // Calculate the dot product of the normal and light direction
    "  float nDotL = max(dot(normal, lightDirection), 0.0);\n" +
    // Calculate the color due to diffuse reflection
    "  vec3 diffuse = u_LightColor * a_Color.rgb * nDotL;\n" +
    // Calculate the color due to ambient reflection
    "  vec3 ambient = u_AmbientLight * a_Color.rgb;\n" +
    "  vec3 emissive = vec3(0.1, 0.05, 0.07);\n" +
    "  vec3 speculr = vec3(0.1, 0.05, 0.07);\n" +
    // Add the surface colors due to diffuse reflection and ambient reflection
    "  v_Color = vec4(emissive + diffuse + ambient + speculr, a_Color.a);\n" +
    "}\n";

var gouraudFrag = // * not used but could be used with lightSpec 2
    "#ifdef GL_ES\n" +
    "precision mediump float;\n" +
    "#endif\n" +
    "varying vec4 v_Color;\n" +
    "void main() {\n" +
    "  gl_FragColor = v_Color;\n" +
    "}\n";

var blinnphongVert = // * not used but could be used with lightSpec 1
    "attribute vec4 a_Position; \n" +
    "attribute vec4 a_Normal; \n" +
    // "attribute vec4 a_color;\n" + //just not used...		use kd instead
    "uniform vec3 u_Kd; \n" +
    "uniform mat4 u_MvpMatrix; \n" +
    "uniform mat4 u_ModelMatrix; \n" +
    "uniform mat4 u_NormalMatrix; \n" +
    "varying vec3 v_Kd; \n" +
    "varying vec4 v_Position; \n" +
    "varying vec3 v_Normal; \n" + // Why Vec3? its not a point, hence w==0
    "void main() { \n" +
    "  gl_Position = u_MvpMatrix * a_Position;\n" +
    "  v_Position = u_ModelMatrix * a_Position; \n" +
    "  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n" +
    "  v_Kd = u_Kd; \n" + // find per-pixel diffuse reflectance from per-vertex
    //	'  v_Kd = vec3(1.0, 1.0, 0.0); \n'	+ // TEST ONLY; fixed at green
    "}\n";

var blinnphongFrag = // * not used but could be used with lightSpec 1
    "#ifdef GL_ES\n" +
    "precision mediump float;\n" +
    "#endif\n" +
    // first light source:
    "uniform vec4 u_Lamp0Pos;\n" + // Phong Illum: position
    "uniform vec3 u_Lamp0Amb;\n" + // Phong Illum: ambient
    "uniform vec3 u_Lamp0Diff;\n" + // Phong Illum: diffuse
    "uniform vec3 u_Lamp0Spec;\n" + // Phong Illum: specular
    // first material definition: you write 2nd, 3rd, etc.
    "uniform vec3 u_Ke;\n" + // Phong Reflectance: emissive
    "uniform vec3 u_Ka;\n" + // Phong Reflectance: ambient
    // Phong Reflectance: diffuse? -- use v_Kd instead for per-pixel value
    "uniform vec3 u_Ks;\n" + // Phong Reflectance: specular
    //  'uniform int u_Kshiny;\n' +				// Phong Reflectance: 1 < shiny < 200
    "uniform vec4 u_eyePosWorld; \n" + // Camera/eye location in world coords.
    "varying vec3 v_Normal;\n" + // Find 3D surface normal at each pix
    "varying vec4 v_Position;\n" + // pixel's 3D pos too -- in 'world' coords
    "varying vec3 v_Kd;	\n" + // Find diffuse reflectance K_d per pix
    // Ambient? Emissive? Specular? almost
    // NEVER change per-vertex: I use'uniform'

    "void main() { \n" +
    "  vec3 normal = normalize(v_Normal); \n" + // Normalize! !!IMPORTANT!! TROUBLE if you don't!
    // Calculate the light direction vector, make it unit-length (1.0).
    "  vec3 lightDirection = normalize(u_Lamp0Pos.xyz - v_Position.xyz);\n" +
    "  float nDotL = max(dot(lightDirection, normal), 0.0); \n" + //(see http://en.wikipedia.org/wiki/Blinn-Phong_shading_model)
    "  vec3 eyeDirection = normalize(u_eyePosWorld.xyz - v_Position.xyz); \n" +
    "  vec3 H = normalize(lightDirection + eyeDirection); \n" +
    "  float nDotH = max(dot(H, normal), 0.0); \n" + // (use max() to discard any negatives from lights below the surface)
    // Apply the 'shininess' exponent K_e:
    "  float e02 = nDotH*nDotH; \n" +
    "  float e04 = e02*e02; \n" +
    "  float e08 = e04*e04; \n" +
    "  float e16 = e08*e08; \n" +
    "  float e32 = e16*e16; \n" +
    "  float e64 = e32*e32;	\n" +
    // Calculate the final color from diffuse reflection and ambient reflection
    "  vec3 emissive = u_Ke;" +
    "  vec3 ambient = u_Lamp0Amb * u_Ka;\n" +
    "  vec3 diffuse = u_Lamp0Diff * v_Kd * nDotL;\n" +
    "  vec3 speculr = u_Lamp0Spec * u_Ks * e64;\n" +
    "  gl_FragColor = vec4(emissive + ambient + diffuse + speculr , 1.0);\n" +
    "}\n";

var phongVert =  
    'attribute vec4 a_Position;\n' +
    "attribute vec4 a_Color;\n" +
    //  'attribute vec4 a_Color;\n' + // Defined constant in main()
    'attribute vec4 a_Normal;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform mat4 u_ModelMatrix;\n' +    // Model matrix
    'uniform mat4 u_NormalMatrix;\n' +   // Transformation matrix of the normal
    'varying vec4 v_Color;\n' +
    'varying vec3 v_Normal;\n' +
    'varying vec3 v_Position;\n' +
    'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    // Calculate the vertex position in the world coordinate
    '  v_Position = vec3(u_ModelMatrix * a_Position);\n' +
    '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
    '  v_Color = a_Color;\n' + 
    '}\n';

var phongFrag =  
    'attribute vec4 a_Position;\n' +
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'uniform vec3 u_LightColor;\n' +     // Light color
    'uniform vec3 u_LightPosition;\n' +  // Position of the light source
    'uniform vec3 u_AmbientLight;\n' +   // Ambient light color
    'varying vec3 v_Normal;\n' +
    'varying vec3 v_Position;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    // Normalize the normal because it is interpolated and not 1.0 in length any more
    '  vec3 normal = normalize(v_Normal);\n' +
    // Calculate the light direction and make it 1.0 in length
    '  vec3 lightDirection = normalize(u_LightPosition - v_Position);\n' +
    // The dot product of the light direction and the normal
    '  float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
    // Calculate the final color from diffuse reflection and ambient reflection
    '  vec3 diffuse = u_LightColor * v_Color.rgb * nDotL;\n' +
    '  vec3 ambient = u_AmbientLight * v_Color.rgb;\n' +
    '  gl_FragColor = vec4(diffuse + ambient, v_Color.a);\n' +
    '}\n';


