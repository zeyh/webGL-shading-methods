// adapted from Shadow_highp.js (c) 2012 matsuda and tanaka
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec3 a_Color;\n' +

    'uniform mat4 u_MvpMatrix;\n' +
    'uniform mat4 u_NormalMatrix;\n' +
    'attribute vec3 a_Normal;\n' +
    'varying vec4 v_Color;\n' +

    'void main() {\n' +
    '  vec4 transVec = u_NormalMatrix * vec4(a_Normal, 0.0);\n' +
    '  vec3 normVec = normalize(transVec.xyz);\n' +
    '  vec3 lightVec = vec3(0.1, 0.5, 0.7);\n' +	
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    '  v_Color = vec4(0.7*a_Color + 0.3*dot(normVec,lightVec), 1.0);\n' +
    '}\n';

// Fragment shader program for regular drawing
var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision highp float;\n' +
    '#endif\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_FragColor = v_Color;\n' +
    '}\n';
