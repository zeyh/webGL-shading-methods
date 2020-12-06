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

var gouraudVert = // !  Phong lighting w/ Gouraud Shading (computes colors per vertex; interpolates color only)
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

var gouraudFrag = // !  Phong lighting w/ Gouraud Shading (computes colors per vertex; interpolates color only)
    "#ifdef GL_ES\n" +
    "precision mediump float;\n" +
    "#endif\n" +
    "varying vec4 v_Color;\n" +
    "void main() {\n" +
    "  gl_FragColor = v_Color;\n" +
    "}\n";

var blinnphongVert = // ! Blinn-Phong lighting with Phong Shading (requires ‘half-angle’, not reflection angle)
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

var blinnphongFrag = // ! Blinn-Phong lighting with Phong Shading (requires ‘half-angle’, not reflection angle)
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

var draggableBlinnPhongVert = // ! TODO: add second head light
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
  
    '  vec3 H = normalize(lightDirection + eyeDirection); \n' +
    '  float nDotH = max(dot(H, normal), 0.0); \n' +

    '  float e64 = pow(nDotH, float(u_MatlSet[0].shiny));\n' + // pow() won't accept integer exponents! Convert K_shiny!  
    '  vec3 emissive = u_MatlSet[0].emit;' +
    '  vec3 ambient = u_LampSet[0].ambi * u_MatlSet[0].ambi;\n' +
    '  vec3 diffuse = u_LampSet[0].diff * v_Kd * nDotL;\n' +
    '  vec3 speculr = u_LampSet[0].spec * u_MatlSet[0].spec * e64;\n' +
    '  gl_FragColor = vec4(emissive + ambient + diffuse + speculr , 1.0);\n' +
    '}\n';

var phongVert =  // ! Phong lighting with Phong Shading, (no half-angles; uses true reflection angle)
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

var phongFrag =  // ! Phong lighting with Phong Shading, (no half-angles; uses true reflection angle)
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


var testVert = // ! test blinn phong with gouraud 
    'attribute vec4 a_Position; \n' +		
    'attribute vec4 a_Normal; \n' +			
    'uniform mat4 u_MvpMatrix; \n' +
    'uniform mat4 u_ModelMatrix; \n' + 		
    'uniform mat4 u_NormalMatrix; \n' +  	
    'varying vec3 v_Normal; \n' +	
    'varying vec4 v_Position; \n' +	
    'varying vec4 v_Color;\n' +

    'varying vec3 v_Kd; \n' +
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
    
    'void main() { \n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    '  v_Position = u_ModelMatrix * a_Position; \n' +
    '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
    '  v_Kd = u_MatlSet[0].diff; \n' +		// find per-pixel diffuse reflectance from per-vertex
    '}\n';

var testFrag  =
    'precision highp float;\n' +
    'precision highp int;\n' +

    'struct LampT {\n' +		// Describes one point-like Phong light source
    '		vec3 pos;\n' +			// (x,y,z,w); w==1.0 for local light at x,y,z position
    ' 	vec3 ambi;\n' +			// Ia ==  ambient light source strength (r,g,b)
    ' 	vec3 diff;\n' +			// Id ==  diffuse light source strength (r,g,b)
    '		vec3 spec;\n' +			// Is == specular light source strength (r,g,b)
    '}; \n' +

    'struct MatlT {\n' +		// Describes one Phong material by its reflectances:
    '		vec3 emit;\n' +			// Ke: emissive -- surface 'glow' amount (r,g,b);
    '		vec3 ambi;\n' +			// Ka: ambient reflectance (r,g,b)
    '		vec3 diff;\n' +			// Kd: diffuse reflectance (r,g,b)
    '		vec3 spec;\n' + 		// Ks: specular reflectance (r,g,b)
    '		int shiny;\n' +			// Kshiny: specular exponent (integer >= 1; typ. <200)
    '		};\n' +

    'uniform LampT u_LampSet[2];\n' +	//?
    'uniform MatlT u_MatlSet[1];\n' +	//?

    'uniform vec3 u_eyePosWorld; \n' + 
    'varying vec3 v_Normal;\n' +			
    'varying vec4 v_Position;\n' +			
    'varying vec3 v_Kd;	\n' +						// Find diffuse reflectance K_d per pix

    'void main() { \n' +
    '  vec3 normal = normalize(v_Normal); \n' +
    '  vec3 lightDirection = normalize(u_LampSet[0].pos - v_Position.xyz);\n' +
    '  vec3 eyeDirection = normalize(u_eyePosWorld - v_Position.xyz); \n' +
    '  float nDotL = max(dot(lightDirection, normal), 0.0); \n' +
    '  vec3 H = normalize(lightDirection + eyeDirection); \n' +
    '  float nDotH = max(dot(H, normal), 0.0); \n' +
    '  float e64 = pow(nDotH, float(u_MatlSet[0].shiny));\n' +
    '  vec3 emissive = u_MatlSet[0].emit;' +
    '  vec3 ambient = u_LampSet[0].ambi * u_MatlSet[0].ambi;\n' +
    '  vec3 diffuse = u_LampSet[0].diff * v_Kd * nDotL;\n' +
    '  vec3 speculr = u_LampSet[0].spec * u_MatlSet[0].spec * e64;\n' +

    '  vec3 headLightDirection = normalize(u_LampSet[1].pos - v_Position.xyz);\n' + //?
    '  float nDotHL = max(dot(headLightDirection, normal), 0.0); \n' +
    '  vec3 HH = normalize(headLightDirection + eyeDirection); \n' +
    '  float nDotHH = max(dot(HH, normal), 0.0); \n' +
    '  float e64_2 = pow(nDotHH, float(u_MatlSet[0].shiny));\n' +

    '  vec3 diffuse2 = u_LampSet[1].diff * v_Kd * nDotHL;\n' +
    '  vec3 speculr2 = u_LampSet[1].spec * u_MatlSet[0].spec * e64_2;\n' +
    '  gl_FragColor = vec4(emissive + ambient + diffuse + speculr + diffuse2 + speculr2, 1.0);\n' +
    '}\n';

