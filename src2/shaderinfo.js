/* the different shaders details */

"use strict"
var diffuseVert = 
"precision highp float;\n" +    

'attribute vec4 a_Position0;\n' +
'attribute vec3 a_Color0;\n' +
'attribute vec3 a_Normal0;\n' +

'varying vec4 v_Color0;\n' +
'uniform mat4 u_MvpMatrix0;\n' +
'uniform mat4 u_NormalMatrix0;\n' +

'void main() {\n' +
'  vec4 transVec0 = u_NormalMatrix0 * vec4(a_Normal0, 0.0);\n' +
'  vec3 normVec0 = normalize(transVec0.xyz);\n' +
'  vec3 lightVec0 = vec3(0.1, 0.5, 0.7);\n' +	
'  gl_Position = u_MvpMatrix0 * a_Position0;\n' +
'  v_Color0 = vec4(0.7*a_Color0 + 0.3*dot(normVec0,lightVec0), 1.0);\n' +
'}\n';

var diffuseFrag = 
'#ifdef GL_ES\n' +
'precision highp float;\n' +
'#endif\n' +
'varying vec4 v_Color0;\n' +
'void main() {\n' +
'  gl_FragColor = v_Color0;\n' +
'}\n'; 