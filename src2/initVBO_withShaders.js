"use strict"
function VBO_Cube() {
    // ! diffuse shading
    this.VERT_SRC =
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

    this.FRAG_SRC =
        '#ifdef GL_ES\n' +
        'precision highp float;\n' +
        '#endif\n' +
        'varying vec4 v_Color0;\n' +
        'void main() {\n' +
        '  gl_FragColor = v_Color0;\n' +
        '}\n';

    // ! VBO contents
    this.vertices = new Float32Array([
        1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // v0-v1-v2-v3 front
        1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // v0-v3-v4-v5 right
        1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
       -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // v1-v6-v7-v2 left
       -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // v7-v4-v3-v2 down
        1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // v4-v7-v6-v5 back
    ]);
    this.colors = new Float32Array([
        0, 0.5, 1,   0, 0.5, 1,   0, 0.5, 1,   0, 0.5, 1,     // v0-v1-v2-v3 front
        0, 0.5, 1,   0, 0.5, 1,   0, 0.5, 1,  0, 0.5, 1,     // v0-v3-v4-v5 right
        0, 0.5, 1,   0, 0.5, 1,   0, 0.5, 1,   0, 0.5, 1,     // v0-v5-v6-v1 up
        0, 0.5, 1,    0, 0.5, 1,   0, 0.5, 1,   0, 0.5, 1,      // v1-v6-v7-v2 left
        0, 0.5, 1,    0, 0.5, 1,   0, 0.5, 1,  0, 0.5, 1,      // v7-v4-v3-v2 down
        0, 0.5, 1,    0, 0.5, 1,   0, 0.5, 1,   0, 0.5, 1, 　    // v4-v7-v6-v5 back
    ]);
    this.normals = new Float32Array([
        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
        1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
       -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
        0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
        0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
    ]);
    this.indices = new Uint8Array([
        0, 1, 2,   0, 2, 3,    // front
        4, 5, 6,   4, 6, 7,    // right
        8, 9,10,   8,10,11,    // up
       12,13,14,  12,14,15,    // left
       16,17,18,  16,18,19,    // down
       20,21,22,  20,22,23     // back
    ]);

    this.vertexBuffer;
    this.colorBuffer;
    this.indexBuffer;
    this.numIndices = this.indices.length;
    // ! Attributes
    this.shaderLoc; 
    this.a_PosLoc;
    this.a_ColrLoc;
    this.a_NormLoc;
    // ! Uniform locations & values in our shaders
    this.MvpMat = new Matrix4(); // Transforms CVV axes to model axes.
    this.u_MvpMatLoc; // GPU location for u_ModelMat uniform
    this.NormMat = new Matrix4(); // Transforms CVV axes to model axes.
    this.u_NormMatLoc; // GPU location for u_ModelMat uniform
}

VBO_Cube.prototype.init = function(){
    this.shaderLoc = createProgram(gl, this.VERT_SRC, this.FRAG_SRC);
    if (!this.shaderLoc) {
        console.log(
            this.constructor.name +
                ".init() failed to create executable Shaders on the GPU. Bye!"
        );
        return;
    }else{
        // console.log('You called: '+ this.constructor.name + '.init() fcn!');
    }

    // ! switching gl program to this one
    gl.program = this.shaderLoc; 

    // ! init VBO
    this.vertexBuffer = initArrayBufferForLaterUse(gl, this.vertices, 3, gl.FLOAT);
    this.colorBuffer = initArrayBufferForLaterUse(gl, this.colors, 3, gl.FLOAT);
    this.normalBuffer = initArrayBufferForLaterUse(gl, this.normals, 3, gl.FLOAT);
    this.indexBuffer = initElementArrayBufferForLaterUse(gl, this.indices, gl.UNSIGNED_BYTE);
    if (!this.vertexBuffer || !this.colorBuffer || !this.normalBuffer || !this.indexBuffer) {
        console.log(
            this.constructor.name + ".init() failed to create VBO in GPU. Bye!"
        );
        return;
    }

    // ! init attribute locations
    this.a_PosLoc = gl.getAttribLocation(this.shaderLoc, "a_Position0");
    this.a_ColrLoc = gl.getAttribLocation(this.shaderLoc, "a_Color0");
    this.a_NormLoc = gl.getAttribLocation(this.shaderLoc, "a_Normal0");
    this.u_MvpMatLoc = gl.getUniformLocation(this.shaderLoc, "u_MvpMatrix0");
    this.u_NormMatLoc = gl.getUniformLocation(this.shaderLoc, "u_NormalMatrix0");
    if (this.a_PosLoc < 0 || this.a_ColrLoc < 0 || this.a_NormLoc < 0 || !this.u_MvpMatLoc || !this.u_NormMatLoc) {
        console.log(
            this.constructor.name +
                ".init() failed to get the GPU location of attributes"
        );
        return -1; // error exit.
    }
}

VBO_Cube.prototype.switchToMe = function () { //similar to previous set-up for draw()
    gl.useProgram(this.shaderLoc);
    initAttributeVariable(gl, this.a_PosLoc, this.vertexBuffer);
    if (this.colorBuffer != undefined) {
        initAttributeVariable(gl, this.a_ColrLoc, this.colorBuffer);
    }
    if (this.normalBuffer != undefined) {
        initAttributeVariable(gl, this.a_NormLoc, this.normalBuffer);
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
}

VBO_Cube.prototype.isReady = function (){ //sanity check
    var isOK = true;
    if (gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc) {
        console.log(
            this.constructor.name +
                ".isReady() false: shader program at this.shaderLoc not in use!"
        );
        isOK = false;
    }
    if(gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING) != this.indexBuffer){
        console.log(
            this.constructor.name +
                ".isReady() false: vbo at this.indexBuffer not in use!"
        );
        isOK = false;
    }
    return isOK;
}

VBO_Cube.prototype.adjust = function () { //any matrix transformations🍀
    if (this.isReady() == false) {
        console.log(
            "ERROR! before" +
                this.constructor.name +
                ".adjust() call you needed to call this.switchToMe()!!"
        );
    }
    var g_modelMatrix = new Matrix4(); 
    var g_viewProjMatrix = new Matrix4(); //should be the same for every vbo

    g_modelMatrix.scale(0.5,0.2,0.5)
    g_modelMatrix.rotate(currentAngle, 0,1,0)

    this.MvpMat.set(g_viewProjMatrix);
    this.MvpMat.multiply(g_modelMatrix);
    gl.uniformMatrix4fv(this.u_MvpMatLoc,  false,  this.MvpMat.elements ); 

    this.NormMat.setInverseOf(g_modelMatrix);
	this.NormMat.transpose();
    gl.uniformMatrix4fv(this.u_NormMatLoc, false, this.NormMat.elements);
};

VBO_Cube.prototype.draw = function () { //finally drawing🙏
    if (this.isReady() == false) {
        console.log(
            "ERROR! before" +
                this.constructor.name +
                ".draw() call you needed to call this.switchToMe()!!"
        );
    }
    if (this.indexBuffer != undefined) {
        gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_BYTE, 0);
    }
    else {
        gl.drawArrays(gl.LINES, 0, this.numIndices); //for ground grid
    }

}

// ! general attribute init function =================================================
function initAttributeVariable(gl, a_attribute, buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);
}

function initArrayBufferForLaterUse(gl, data, num, type){
    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return null;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer); 
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    buffer.num = num;
    buffer.type = type;

    return buffer;
}

function initElementArrayBufferForLaterUse(gl, indices, type) {
    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return null;
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    buffer.type = type;

    return buffer;
}
