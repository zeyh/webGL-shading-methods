"use strict"
function VBO_genetic(vertSrc, fragSrc, vertices, colors, normals, indices) {
    // ! diffuse shading
    this.VERT_SRC = vertSrc;
    this.FRAG_SRC = fragSrc;

    // ! VBO contents
    this.vertices =  new Float32Array(vertices); //just to make sure...
    this.colors =  new Float32Array(colors);
    this.normals =  new Float32Array(normals);
    this.indices = new Uint8Array(indices);

    this.vertexBuffer;
    this.colorBuffer;
    this.indexBuffer;
    this.numIndices = this.indices.length;
    if(this.indices.length <= 0){
        this.numIndices = this.vertices.length/3; //assume floats per vertex = 3
    }
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

VBO_genetic.prototype.init = function(){
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
    if(this.indices.length > 0){
        this.indexBuffer = initElementArrayBufferForLaterUse(gl, this.indices, gl.UNSIGNED_BYTE);
        if (!this.indexBuffer) {
            console.log(
                this.constructor.name + ".init() for [indices] failed to create VBO in GPU. Bye!"
            );
            return;
        }
    }
    if (!this.vertexBuffer || !this.colorBuffer || !this.normalBuffer) {
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

VBO_genetic.prototype.switchToMe = function () { //similar to previous set-up for draw()
    gl.useProgram(this.shaderLoc);
    initAttributeVariable(gl, this.a_PosLoc, this.vertexBuffer);
    if (this.colorBuffer != undefined) {
        initAttributeVariable(gl, this.a_ColrLoc, this.colorBuffer);
    }
    if (this.normalBuffer != undefined) {
        initAttributeVariable(gl, this.a_NormLoc, this.normalBuffer);
    }
    if(this.indexBuffer != undefined) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    }
}

VBO_genetic.prototype.isReady = function (){ //very brief sanity check
    var isOK = true;
    if (gl.getParameter(gl.CURRENT_PROGRAM) != this.shaderLoc) {
        console.log(
            this.constructor.name +
                ".isReady() false: shader program at this.shaderLoc not in use!"
        );
        isOK = false;
    }
    if(this.indices.length > 0 &&  gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING) != this.indexBuffer){
        console.log(
            this.constructor.name +
                ".isReady() false: vbo at this.indexBuffer not in use!"
        );
        isOK = false;
    }
    return isOK;
}


VBO_genetic.prototype.draw = function (g_modelMatrix, g_viewProjMatrix) { //finally drawing🙏
    if (this.isReady() == false) {
        console.log(
            "ERROR! before" +
                this.constructor.name +
                ".draw() call you needed to call this.switchToMe()!!"
        );
    }
    this.MvpMat.set(g_viewProjMatrix);
    this.MvpMat.multiply(g_modelMatrix);
    gl.uniformMatrix4fv(this.u_MvpMatLoc,  false,  this.MvpMat.elements); 

    this.NormMat.setInverseOf(g_modelMatrix);
	this.NormMat.transpose();
    gl.uniformMatrix4fv(this.u_NormMatLoc, false, this.NormMat.elements);
    if (this.indexBuffer != undefined) {
        gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_BYTE, 0);
    }
    else {
        gl.drawArrays(gl.LINES, 0, this.numIndices); //special case for ground grid 
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
