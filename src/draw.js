

"use strict"
function drawJointAssemblies(cube_joint){
    pushMatrix(g_modelMatrix); 
        g_modelMatrix.setTranslate(-3.7, 2.3, 2.0);    //base
        g_modelMatrix.rotate(-180, 0.0, 1.0, 0.0);
        g_modelMatrix.rotate(80, 0.0, 0.0, 1.0);

        var baseHeight = 0.0;
        //seg1
        var seg1Length = 0.5;
        g_modelMatrix.translate(0.0, baseHeight, 0.0); 
        g_modelMatrix.rotate(g_jointAngle*2, 0.0, 0.0, 1.0);
        pushMatrix(g_modelMatrix);
            g_modelMatrix.scale(0.18, seg1Length, 0.18);
            cube_joint.switchToMe();
            cube_joint.draw(g_modelMatrix, g_viewProjMatrix);
        g_modelMatrix = popMatrix();
    
       //seg2
       var seg2Length = 0.5;
       g_modelMatrix.translate(0.0, seg1Length, 0.0); 
       g_modelMatrix.rotate(g_jointAngle*2, 0.0, 0.0, 1.0);
       pushMatrix(g_modelMatrix);
           g_modelMatrix.scale(0.17, seg2Length, 0.17);
           cube_joint.switchToMe();
           cube_joint.draw(g_modelMatrix, g_viewProjMatrix);
        g_modelMatrix = popMatrix();

        //seg 3
        pushMatrix(g_modelMatrix);
            g_modelMatrix.translate(0.4, seg2Length+0.7, 0.0); 
            g_modelMatrix.rotate(g_jointAngle*2, 0.0, 0.0, 1.0);
            g_modelMatrix.rotate(-60, 0,0,1);
            g_modelMatrix.scale(0.06, 0.45, 0.06);
            cube_joint.switchToMe();
            cube_joint.draw(g_modelMatrix, g_viewProjMatrix);
        g_modelMatrix = popMatrix();

        //seg3
        var seg3Length = 0.4;
        g_modelMatrix.translate(0.0, seg2Length, 0.0); 
        g_modelMatrix.rotate(g_jointAngle*2, 0.0, 0.0, 1.0);
        pushMatrix(g_modelMatrix);
            g_modelMatrix.scale(0.15, seg3Length, 0.15);
            cube_joint.switchToMe();
            cube_joint.draw(g_modelMatrix, g_viewProjMatrix);
        g_modelMatrix = popMatrix();



        //seg4
        var seg4Length = 0.7;
        g_modelMatrix.translate(0.0, seg3Length+0.5, 0.0); 
        g_modelMatrix.rotate(g_jointAngle*2, 0.0, 0.0, 1.0);
        pushMatrix(g_modelMatrix);
            g_modelMatrix.scale(0.13, seg4Length, 0.13);
            cube_joint.switchToMe();
            cube_joint.draw(g_modelMatrix, g_viewProjMatrix);
        g_modelMatrix = popMatrix();
    
        //seg5
        var seg5Length = 0.4;
        g_modelMatrix.translate(0.0, seg4Length+seg5Length/2, 0.0); 
        g_modelMatrix.rotate(g_jointAngle*2, 0.0, 0.0, 1.0);
        pushMatrix(g_modelMatrix);
            g_modelMatrix.scale(0.1, seg5Length, 0.1);
            cube_joint.switchToMe();
            cube_joint.draw(g_modelMatrix, g_viewProjMatrix);
        g_modelMatrix = popMatrix();

    g_modelMatrix = popMatrix();
}

function drawJointAssemblies2(cube_joint2) {
    pushMatrix(g_modelMatrix);

        var baseHeight = 0.1;
        //seg1
        var seg1Length = 0.4;
        g_modelMatrix.translate(0.0, baseHeight, 0.0); 
        g_modelMatrix.rotate(g_jointAngle2*10, 0.0, 0.0, 1.0);
        pushMatrix(g_modelMatrix);
            g_modelMatrix.scale(0.05, seg1Length, seg1Length);
            cube_joint2.switchToMe();
            cube_joint2.draw(g_modelMatrix, g_viewProjMatrix);
        g_modelMatrix = popMatrix();

        //seg2
        var seg2Length = 0.4;
        g_modelMatrix.translate(0.0, seg1Length, 0.0); 
        g_modelMatrix.rotate(g_jointAngle2*10, 0.0, 0.0, 1.0);
        pushMatrix(g_modelMatrix);
            g_modelMatrix.scale(0.05, seg2Length, seg2Length);
            cube_joint2.switchToMe();
            cube_joint2.draw(g_modelMatrix, g_viewProjMatrix);
        g_modelMatrix = popMatrix();

        //seg3
        var seg3Length = 0.4;
        g_modelMatrix.translate(0.0, seg2Length, 0.0); 
        g_modelMatrix.rotate(g_jointAngle2*10, 0.0, 0.0, 1.0);
        pushMatrix(g_modelMatrix);
            g_modelMatrix.scale(0.05, seg3Length, seg3Length);
            cube_joint2.switchToMe();
            cube_joint2.draw(g_modelMatrix, g_viewProjMatrix);
        g_modelMatrix = popMatrix();

        //seg4
        var seg4Length = 0.4;
        g_modelMatrix.translate(0.0, seg3Length, 0.0); 
        g_modelMatrix.rotate(g_jointAngle2*10, 0.0, 0.0, 1.0);
        pushMatrix(g_modelMatrix);
            g_modelMatrix.scale(0.05, seg4Length, seg4Length);
            cube_joint2.switchToMe();
            cube_joint2.draw(g_modelMatrix, g_viewProjMatrix);
        g_modelMatrix = popMatrix();

        //seg5
        var seg5Length = 0.4;
        g_modelMatrix.translate(0.0, seg4Length, 0.0); 
        g_modelMatrix.rotate(g_jointAngle2*10, 0.0, 0.0, 1.0);
        pushMatrix(g_modelMatrix);
            g_modelMatrix.scale(0.05, seg5Length, seg5Length);
            cube_joint2.switchToMe();
            cube_joint2.draw(g_modelMatrix, g_viewProjMatrix);
        g_modelMatrix = popMatrix();

        //seg6
        var seg6Length = 0.4;
        g_modelMatrix.translate(0.0, seg5Length, 0.0); 
        g_modelMatrix.rotate(g_jointAngle2*10, 0.0, 0.0, 1.0);
        pushMatrix(g_modelMatrix);
            g_modelMatrix.scale(0.05, seg6Length, seg6Length);
            cube_joint2.switchToMe();
            cube_joint2.draw(g_modelMatrix, g_viewProjMatrix);
        g_modelMatrix = popMatrix();

    g_modelMatrix = popMatrix();
}


function drawAll([grid, cube, sphere, cube_red, sphere_drag, cube_fog, plane, sphere2, cube_joint, sphere3, sphere4]){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);    // Clear color and depth buffer

    // table wood
    pushMatrix(g_modelMatrix);
    g_modelMatrix.setTranslate(-4,-0.5,4);
    g_modelMatrix.scale(1.7,1,3.2);
    cube.switchToMe();
    cube.draw(g_modelMatrix, g_viewProjMatrix);
    g_modelMatrix = popMatrix();

    // table steel
    pushMatrix(g_modelMatrix);
    g_modelMatrix.setTranslate(-8,-0.4,-10);
    g_modelMatrix.scale(4.1,0.15,3.1);
    cube.switchToMe();
    cube.draw(g_modelMatrix, g_viewProjMatrix);
    g_modelMatrix = popMatrix();
    pushMatrix(g_modelMatrix);
    g_modelMatrix.setTranslate(-8,-0.33,-10);
    g_modelMatrix.scale(4,0.14,3);
    cube_red.switchToMe();
    cube_red.draw(g_modelMatrix, g_viewProjMatrix);
    g_modelMatrix = popMatrix();

    // clock 1
    pushMatrix(g_modelMatrix);
    g_modelMatrix.setScale(0.4,0.2,0.8);
    g_modelMatrix.translate(-7,3,7);
    sphere.switchToMe();
    sphere.draw(g_modelMatrix, g_viewProjMatrix);
    g_modelMatrix = popMatrix();

    pushMatrix(g_modelMatrix);
    g_modelMatrix.setTranslate(-2.6,0.62,4.72);
    g_modelMatrix.rotate(currentAngle,0,0,1)
    g_modelMatrix.scale(0.14,0.14,0.14);
    sphere2.switchToMe();
    sphere2.draw(g_modelMatrix, g_viewProjMatrix);
    g_modelMatrix = popMatrix();

    // clock 2
    pushMatrix(g_modelMatrix);
    g_modelMatrix.setScale(0.6,0.2,0.8);
    g_modelMatrix.translate(-0.5,0,7);
    g_modelMatrix.rotate(100,1,0,0);
    sphere3.switchToMe();
    sphere3.draw(g_modelMatrix, g_viewProjMatrix);
    g_modelMatrix = popMatrix();

    pushMatrix(g_modelMatrix);
    g_modelMatrix.setTranslate(0.4,0,6.2);
    g_modelMatrix.rotate(currentAngle,1,0,0)
    g_modelMatrix.scale(0.2,0.2,0.2);
    sphere4.switchToMe();
    sphere4.draw(g_modelMatrix, g_viewProjMatrix);
    g_modelMatrix = popMatrix();

    //jointed cube
    pushMatrix(g_modelMatrix);
        g_modelMatrix.setTranslate(-4,2.8,2);
        g_modelMatrix.scale(0.2,1,0.2);
        // g_modelMatrix.rotate(currentAngle, 0,1,0);
        cube_joint.switchToMe();
        cube_joint.draw(g_modelMatrix, g_viewProjMatrix);
    g_modelMatrix = popMatrix();
    pushMatrix(g_modelMatrix);
        g_modelMatrix.setTranslate(-4,1,2); 
        g_modelMatrix.scale(0.23,1.3,0.23);
        cube_joint.switchToMe();
        cube_joint.draw(g_modelMatrix, g_viewProjMatrix);
    g_modelMatrix = popMatrix();

    //Joint Assembly
    drawJointAssemblies(cube_joint);

    pushMatrix(g_modelMatrix);
    g_modelMatrix.setTranslate(-0.2, 1.5, 2.2);    //base
    g_modelMatrix.rotate(-90, 1,0,1);
    g_modelMatrix.scale(0.5,0.5,0.5);
    drawJointAssemblies2(cube_red) ;
    g_modelMatrix = popMatrix();

    pushMatrix(g_modelMatrix);
    g_modelMatrix.setTranslate(-1.6, 0.8,4);
    g_modelMatrix.scale(0.4,0.4,0.4);
    drawJointAssemblies2(cube_red) ;
    g_modelMatrix = popMatrix();

    pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(1.5, 0,0);
    g_modelMatrix.rotate(90, 1,0,1);
    drawJointAssemblies2(cube_red) ;
    g_modelMatrix = popMatrix();


    // //draw point light cube
    // pushMatrix(g_modelMatrix);
    // g_modelMatrix.setTranslate(-3.4,2.1,0);
    // g_modelMatrix.rotate(0.5, 1,0,0);
    // g_modelMatrix.rotate(currentAngle, 0,1,0);
    // g_modelMatrix.scale(1.2,0.45,1.2);
    // cube_red.switchToMe();
    // cube_red.draw(g_modelMatrix, g_viewProjMatrix);
    // g_modelMatrix = popMatrix();



    // // // draw cube with fog
    // pushMatrix(g_modelMatrix);
    // g_modelMatrix.setTranslate(2.5,1,0);
    // g_modelMatrix.scale(0.6,0.6,0.6);
    // g_modelMatrix.rotate(currentAngle, 0,1,0);
    // cube_fog.switchToMe();
    // cube_fog.draw(g_modelMatrix, g_viewProjMatrix);
    // g_modelMatrix = popMatrix();




    //draw draggable light source on sphere
    if(hideSphere){
        pushMatrix(g_modelMatrix);
        g_modelMatrix.setScale(2,2,2);
        // g_modelMatrix.translate(0,3,0);
        g_modelMatrix.rotate(currentAngle, 0,1,0);
        sphere_drag.switchToMe();
        sphere_drag.draw(g_modelMatrix, g_viewProjMatrix);
        g_modelMatrix = popMatrix();
    }

    //draw grid
    if(!hideGrid){
        pushMatrix(g_modelMatrix);
        g_viewProjMatrix.rotate(-90.0, 1, 0, 0);
        g_viewProjMatrix.translate(0.0, 0.0, -0.6);
        g_viewProjMatrix.scale(0.4, 0.4, 0.4);
        grid.switchToMe();
        grid.draw(g_modelMatrix, g_viewProjMatrix);
        g_modelMatrix = popMatrix();
    }else{
        pushMatrix(g_modelMatrix);
        g_viewProjMatrix.rotate(-90.0, 1, 0, 0);
        g_viewProjMatrix.translate(0.0, 0.0, -0.6);
        g_viewProjMatrix.scale(0.4, 0.4, 0.4);
        plane.switchToMe();
        plane.draw(g_modelMatrix, g_viewProjMatrix);
        g_modelMatrix = popMatrix();
    }
}