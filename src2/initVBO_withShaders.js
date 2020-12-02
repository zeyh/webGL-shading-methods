"use strict"
var g_lamp0, g_matl0, g_matlSel; //for user event controls

function VBO_genetic(vertSrc, fragSrc, vertices, colors, normals, indices, lightSpec) {
    // ! diffuse shading
    this.VERT_SRC = vertSrc;
    this.FRAG_SRC = fragSrc;
    this.lightSpec = lightSpec;

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
    this.ModelMat = new Matrix4();
    this.u_ModelMatLoc;

    // ! point light (spec == 1)
    this.u_LightColor;
    this.u_LightPosition;
    this.u_AmbientLight;

    this.u_eyePosWorld;

    // ! phong  (spec == 2) individual
    if(this.lightSpec == 2){
        // for Phong light source:
        this.u_Lamp0Pos;
        this.u_Lamp0Amb;
        this.u_Lamp0Diff;
        this. u_Lamp0Spec;
        // for Phong material/reflectance
        this.u_Ke;
        this.u_Ka;
        this.u_Kd;
        this.u_Ks;
    }

    // ! (draggable spec == 3) as light source and material
    if(this.lightSpec == 3){
        g_lamp0 = new LightsT();
        g_matlSel= MATL_RED_PLASTIC;	
        g_matl0 = new Material(g_matlSel);
    }

    if(this.lightSpec == 4){
        this.u_FogColor;
        this.u_FogDist;
    }

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
    if (!this.vertexBuffer || !this.normalBuffer) {
        console.log(
            this.constructor.name + ".init() failed to create VBO in GPU. Bye!"
        );
        return;
    }
    if(this.lightSpec != 2 && this.lightSpec != 3){ //assign color if not phong
        this.colorBuffer = initArrayBufferForLaterUse(gl, this.colors, 3, gl.FLOAT);
        this.a_ColrLoc = gl.getAttribLocation(this.shaderLoc, "a_Color");
        if (this.a_ColrLoc < 0 || !this.colorBuffer) {
            console.log(
                this.constructor.name + ".init() failed to create VBO in GPU. Bye! [colorBuffer]"
            );
            return;
        }
    }


    // ! init attribute locations
    this.a_PosLoc = gl.getAttribLocation(this.shaderLoc, "a_Position");
    
    this.u_ModelMatLoc = gl.getUniformLocation(this.shaderLoc, 'u_ModelMatrix'); //may not be used and null for simple diffuse lighting
    this.u_MvpMatLoc = gl.getUniformLocation(this.shaderLoc, "u_MvpMatrix");
    if (this.a_PosLoc < 0  || !this.u_MvpMatLoc) {
        console.log(
            this.constructor.name +
                ".init() failed to get the GPU location of attributes"
        );
        return -1; // error exit.
    }
    // get normal
    if(this.lightSpec != 4){
        this.a_NormLoc = gl.getAttribLocation(this.shaderLoc, "a_Normal");
        this.u_NormMatLoc = gl.getUniformLocation(this.shaderLoc, "u_NormalMatrix");
        if (this.a_NormLoc < 0 || !this.u_NormMatLoc) {
            console.log(
                this.constructor.name +
                    ".init() failed to get the GPU location of attributes [normal]"
            );
            return -1; // error exit.
        }
    }
    // get eye
    if(this.lightSpec != 0 && this.lightSpec != 1){
        this.u_eyePosWorld = gl.getUniformLocation(this.shaderLoc, 'u_eyePosWorld');
        if (!this.u_eyePosWorld) {
            console.log('Failed to get matrix storage locations [u_eyePosWorld]');
            return;
        }
    }
    // get light
    if(this.lightSpec == 1){ //PointLight
        if ( !this.u_ModelMatLoc ) {
            console.log(
                this.constructor.name +
                    ".init() failed to get the GPU location of attributes [u_ModelMatLoc]"
            );return -1; // error exit.
        }
        this.u_LightColor = gl.getUniformLocation(this.shaderLoc, 'u_LightColor');
        this.u_LightPosition = gl.getUniformLocation(this.shaderLoc, 'u_LightPosition');
        this.u_AmbientLight = gl.getUniformLocation(this.shaderLoc, 'u_AmbientLight');
        if ( !this.u_LightColor || !this.u_LightPosition　|| !this.u_AmbientLight) { 
            console.log('Failed to get the light storage location');
            return;
        }
    }
    //get lamp
    if(this.lightSpec == 2){ //Blinn Phong
        //light source✨
        this.u_Lamp0Pos  = gl.getUniformLocation(this.shaderLoc, 	'u_Lamp0Pos');
        this.u_Lamp0Amb  = gl.getUniformLocation(this.shaderLoc, 	'u_Lamp0Amb');
        this.u_Lamp0Diff = gl.getUniformLocation(this.shaderLoc, 	'u_Lamp0Diff');
        this.u_Lamp0Spec = gl.getUniformLocation(this.shaderLoc,	'u_Lamp0Spec');
        if( !this.u_Lamp0Pos || !this.u_Lamp0Amb ||!this.u_Lamp0Diff ||!this.u_Lamp0Spec) {
            console.log('Failed to get the Lamp0 storage locations');
            return;
        }
        //Phong material/reflectance:
        this.u_Ke = gl.getUniformLocation(this.shaderLoc, 'u_Ke');
        this.u_Ka = gl.getUniformLocation(this.shaderLoc, 'u_Ka');
        this.u_Kd = gl.getUniformLocation(this.shaderLoc, 'u_Kd');
        this.u_Ks = gl.getUniformLocation(this.shaderLoc, 'u_Ks');
        if(!this.u_Ke || !this.u_Ka || !this.u_Kd ||!this.u_Ks) {
            console.log('Failed to get the Phong Reflectance storage locations');
            return;
        }
    }
    // get both lamp and material
    if(this.lightSpec == 3) { //draggable phong
        //reference in struct instead
        g_lamp0.u_pos  = gl.getUniformLocation(this.shaderLoc, 	'u_LampSet[0].pos');
        g_lamp0.u_ambi  = gl.getUniformLocation(this.shaderLoc, 'u_LampSet[0].ambi');
        g_lamp0.u_diff = gl.getUniformLocation(this.shaderLoc, 	'u_LampSet[0].diff');
        g_lamp0.u_spec = gl.getUniformLocation(this.shaderLoc,	'u_LampSet[0].spec');
        if( !g_lamp0.u_pos || !g_lamp0.u_ambi ||!g_lamp0.u_diff ||!g_lamp0.u_spec) {
            console.log('Failed to get the Lamp0 storage locations');
            return;
        }

        g_matl0.uLoc_Ke = gl.getUniformLocation(this.shaderLoc, 'u_MatlSet[0].emit');
        g_matl0.uLoc_Ka = gl.getUniformLocation(this.shaderLoc, 'u_MatlSet[0].ambi');
        g_matl0.uLoc_Kd = gl.getUniformLocation(this.shaderLoc, 'u_MatlSet[0].diff');
        g_matl0.uLoc_Ks = gl.getUniformLocation(this.shaderLoc, 'u_MatlSet[0].spec');
        g_matl0.uLoc_Kshiny = gl.getUniformLocation(this.shaderLoc, 'u_MatlSet[0].shiny');
        if(!g_matl0.uLoc_Ke || !g_matl0.uLoc_Ka || !g_matl0.uLoc_Kd  ||!g_matl0.uLoc_Ks || !g_matl0.uLoc_Kshiny) {
            console.log('Failed to get the Phong Reflectance storage locations');
            return;
        }
    }

    if(this.lightSpec == 4){
        this.u_FogColor = gl.getUniformLocation(gl.program, 'u_FogColor');
        this.u_FogDist = gl.getUniformLocation(gl.program, 'u_FogDist');
        if(!this.u_FogColor || !this.u_FogDist){
            console.log('Failed to get the storage location [FOG color && dist]');
            return;
        }
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
    if(this.lightSpec == 1){
        // Set the light color (white)
        gl.uniform3f(this.u_LightColor, 1.0, 0.5, 0.5);
        // Set the light direction (in the world coordinate)
        gl.uniform3f(this.u_LightPosition, -3.5, 1.0, 3.5);
        // Set the ambient light
        gl.uniform3f(this.u_AmbientLight, 0.5, 0.5, 0.5);
    }
    if(this.lightSpec == 2){
        // Position the first light source in World coords:  then Set its light output: 
        gl.uniform4f(this.u_Lamp0Pos, 6.0, 6.0, 6.0, 1.0);
        gl.uniform3f(this.u_Lamp0Amb,  0.4, 0.4, 0.4);		// ambient
        gl.uniform3f(this.u_Lamp0Diff, 1.0, 1.0, 1.0);		// diffuse
        gl.uniform3f(this.u_Lamp0Spec, 1.0, 1.0, 1.0);		// Specular

        // Set the Phong materials' reflectance:
        gl.uniform3f(this.u_Ke, 0.0, 0.0, 0.0);				// Ke emissive
        gl.uniform3f(this.u_Ka, 0.6, 0.2, 0.1);				// Ka ambient
        gl.uniform3f(this.u_Kd, 0.3, 0.6, 0.8);				// Kd diffuse
        gl.uniform3f(this.u_Ks, 0.8, 0.8, 0.8);				// Ks specular

        // Pass the eye position to u_eyePosWorld (uniform vec4 in phongFrag)
        gl.uniform4f(this.u_eyePosWorld, 2,4,5, 1);
        
    }
    if(this.lightSpec == 3){
        var	eyePosWorld = new Float32Array(3);	// x,y,z in world coords
        // if(g_eyePosY != undefined && g_eyePosZ != undefined){ //TODO: hightlight's not going with shadow change...
        //     // eyePosWorld.set([6.0, g_eyePosY, g_eyePosZ]);
        // }else{
        //     eyePosWorld.set([6.0, 0.0, 0.0]);
        // }
        eyePosWorld.set([6.0, 2.0, 5.0]);
        gl.uniform3fv(this.u_eyePosWorld, eyePosWorld);

        // Init World-coord. position & colors of first light source in global vars;
        if(g_lamp0PosY != undefined && g_lamp0PosZ != undefined){ //TODO: somehow unable to change directly in mouseMove(ev)
            g_lamp0.I_pos.elements.set( [6.0, g_lamp0PosY, g_lamp0PosZ]);
        }else{
            g_lamp0.I_pos.elements.set( [6.0, 5.0, 5.0]);
        }
        g_lamp0.I_ambi.elements.set([0.4, 0.4, 0.4]);
        g_lamp0.I_diff.elements.set([1.0, 1.0, 1.0]);
        g_lamp0.I_spec.elements.set([1.0, 1.0, 1.0]);

        gl.uniform3fv(g_lamp0.u_pos,  g_lamp0.I_pos.elements.slice(0,3));
        gl.uniform3fv(g_lamp0.u_ambi, g_lamp0.I_ambi.elements);		// ambient
        gl.uniform3fv(g_lamp0.u_diff, g_lamp0.I_diff.elements);		// diffuse
        gl.uniform3fv(g_lamp0.u_spec, g_lamp0.I_spec.elements);		// Specular
      
        gl.uniform3fv(g_matl0.uLoc_Ke, g_matl0.K_emit.slice(0,3));				// Ke emissive
        gl.uniform3fv(g_matl0.uLoc_Ka, g_matl0.K_ambi.slice(0,3));				// Ka ambient
        gl.uniform3fv(g_matl0.uLoc_Kd, g_matl0.K_diff.slice(0,3));				// Kd	diffuse
        gl.uniform3fv(g_matl0.uLoc_Ks, g_matl0.K_spec.slice(0,3));				// Ks specular
        gl.uniform1i(g_matl0.uLoc_Kshiny, parseInt(g_matl0.K_shiny, 10)); 
    }

    if(this.lightSpec == 4){
        var fogColor = new Float32Array([0.3, 0.3, 0.3]);
        // Distance of fog [where fog starts, where fog completely covers object]
        // Position of eye point (world coordinates)
        var eye = new Float32Array([25, 65, 35, 1.0]);
        gl.uniform3fv(this.u_FogColor, fogColor); // Colors
        gl.uniform2fv(this.u_FogDist, g_fogDist);   // Starting point and end point
        gl.uniform4fv(this.u_eyePosWorld, eye);           // Eye point
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

    if(this.lightSpec == 2){
        gl.uniform4f(this.u_Lamp0Pos, 6.0-g_cloudAngle*2, 3.0, 6.0, 1.0);
        gl.uniform4f(this.u_eyePosWorld, 2-g_cloudAngle,4,5, 1);
    }

    if(this.lightSpec == 3){
        // gl.uniform3fv(this.u_eyePosWorld, [6.0+g_xMclik, 0.0, 0.0]);
        // console.log(g_lamp0PosY, g_lamp0PosZ);
        if(g_lamp0PosY != undefined && g_lamp0PosZ != undefined){
            g_lamp0.I_pos.elements.set( [6.0, g_lamp0PosY, g_lamp0PosZ]);
        }
    }

    this.ModelMat.set(g_modelMatrix);
    gl.uniformMatrix4fv(this.u_ModelMatLoc, false, this.ModelMat.elements);

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
