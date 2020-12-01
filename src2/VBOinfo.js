


var cube_vertices = new Float32Array([
    1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // v0-v1-v2-v3 front
    1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // v0-v3-v4-v5 right
    1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
   -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // v1-v6-v7-v2 left
   -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // v7-v4-v3-v2 down
    1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // v4-v7-v6-v5 back
]);
var cube_colors = new Float32Array([
    0, 0.5, 1,   0, 0.5, 1,   0, 0.5, 1,   0, 0.5, 1,     // v0-v1-v2-v3 front
    0, 0.5, 1,   0, 0.5, 1,   0, 0.5, 1,  0, 0.5, 1,     // v0-v3-v4-v5 right
    0, 0.5, 1,   0, 0.5, 1,   0, 0.5, 1,   0, 0.5, 1,     // v0-v5-v6-v1 up
    0, 0.5, 1,    0, 0.5, 1,   0, 0.5, 1,   0, 0.5, 1,      // v1-v6-v7-v2 left
    0, 0.5, 1,    0, 0.5, 1,   0, 0.5, 1,  0, 0.5, 1,      // v7-v4-v3-v2 down
    0, 0.5, 1,    0, 0.5, 1,   0, 0.5, 1,   0, 0.5, 1, 　    // v4-v7-v6-v5 back
]);
var cube_normals = new Float32Array([
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
]);
var cube_indices = new Uint8Array([
    0, 1, 2,   0, 2, 3,    // front
    4, 5, 6,   4, 6, 7,    // right
    8, 9,10,   8,10,11,    // up
   12,13,14,  12,14,15,    // left
   16,17,18,  16,18,19,    // down
   20,21,22,  20,22,23     // back
]);

var [sphere_vertices, sphere_colors,sphere_indices] = generate_sphereVBOinfo(10, 0.9);
var sphere_normals = sphere_vertices;

function generate_sphereVBOinfo(sphere_div, colorFactor){
    var SPHERE_DIV = sphere_div;
  
    var i, ai, si, ci;
    var j, aj, sj, cj;
    var p1, p2;
  
    var vertices = [];
    var colors = [];
    var indices = [];

    // Generate coordinates
    for (j = 0; j <= SPHERE_DIV; j++) {
      aj = j * Math.PI / SPHERE_DIV;
      sj = Math.sin(aj);
      cj = Math.cos(aj);
      for (i = 0; i <= SPHERE_DIV; i++) {
        ai = i * 2 * Math.PI / SPHERE_DIV;
        si = Math.sin(ai);
        ci = Math.cos(ai);
  
        vertices.push(si * sj);  // X
        vertices.push(cj);       // Y
        vertices.push(ci * sj);  // Z
      }
    }
  
    for (j = 0; j <= SPHERE_DIV; j++) {
        for (i = 0; i <= SPHERE_DIV; i++) {
          colors.push(200/255*colorFactor);  // X
          colors.push(200/255*colorFactor);       // Y
          colors.push(200/255*colorFactor);  // Z
        }
      }
    // Generate indices
    for (j = 0; j < SPHERE_DIV; j++) {
        for (i = 0; i < SPHERE_DIV; i++) {
        p1 = j * (SPHERE_DIV+1) + i;
        p2 = p1 + (SPHERE_DIV+1);

        indices.push(p1);
        indices.push(p2);
        indices.push(p1 + 1);

        indices.push(p1 + 1);
        indices.push(p2);
        indices.push(p2 + 1);
        }
    }
    return [vertices, colors, indices];
}