/* the different shaders details */

"use strict";
var diffuseVert =
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

var diffuseFrag =
    "#ifdef GL_ES\n" +
    "precision highp float;\n" +
    "#endif\n" +
    "varying vec4 v_Color;\n" +
    "void main() {\n" +
    "  gl_FragColor = v_Color;\n" +
    "}\n";

var pointLightVert =
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
    // Add the surface colors due to diffuse reflection and ambient reflection
    "  v_Color = vec4(diffuse + ambient, a_Color.a);\n" +
    "}\n";

var pointLightFrag =
    "#ifdef GL_ES\n" +
    "precision mediump float;\n" +
    "#endif\n" +
    "varying vec4 v_Color;\n" +
    "void main() {\n" +
    "  gl_FragColor = v_Color;\n" +
    "}\n";

var phongVert =
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
    "	 v_Kd = u_Kd; \n" + // find per-pixel diffuse reflectance from per-vertex
    //	'  v_Kd = vec3(1.0, 1.0, 0.0); \n'	+ // TEST ONLY; fixed at green
    "}\n";

var phongFrag =
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
    //  '  gl_FragColor = vec4(emissive, 1.0);\n' +
    //  '  gl_FragColor = vec4(emissive + ambient, 1.0);\n' +
    //  '  gl_FragColor = vec4(emissive + ambient + diffuse, 1.0);\n' +
    //  '  gl_FragColor = vec4(ambient + speculr , 1.0);\n' +
    "}\n";
