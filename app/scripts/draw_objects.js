function createSphere(){
    // Draws a Sphere --- To do for the assignment.
    let res = 9
    let r = 9
    let start_x = -2;
    let end_x = 2;
    let start_z = -2;
    let end_z = 2;
    let size_x = (end_x - start_x) / res
    let size_z = (end_z - start_z) / res
    let index = 0
    ///// Creates vertices
    var vert5 = [];

    for(y = -90; y <= 90; y += 180/r){
        h = Math.sin(y/180*Math.PI)
        radius = Math.cos(y/180*Math.PI)
        for(a = 0; a < 360; a += 360/r){
            
            x = Math.cos(a/180*Math.PI)*radius
            z = Math.sin(a/180*Math.PI)*radius
            let n1 = Math.cos(a/180*Math.PI) * Math.cos(y/180*Math.PI)**2;
            let n2 = Math.sin(y/180*Math.PI) * Math.cos(y/180*Math.PI);
            let n3 = Math.cos(y/180*Math.PI)**2 * Math.sin(a/180*Math.PI);
            let size = Math.sqrt(n1**2 + n2**2 + n3**2);

            vert5[index] = [x, h, z, n1/size, n2/size, n3/size];
            index ++;
        }
        // if(y===0){break;}
    }
    // console.log(vert5)
    ////// Creates indices
    var ind5 = [];
    // t = 360/res
    t = r
    for(i = 0; i < r; i ++) {
        for(j = 0; j < t; j ++) {
            ind5[i*t**2 + j*t + 0] = i*t + j;
            ind5[i*t**2 + j*t + 2] = i*t + (j+1)%t;
            ind5[i*t**2 + j*t + 1] = i*t + j+(t+0);

            ind5[i*t**2 + j*t + 3] = i*t + (j+1)%t;
            ind5[i*t**2 + j*t + 4] = i*t + j+t;
            ind5[i*t**2 + j*t + 5] = i*t + (j+1)%t+t;
        }
    }
    
    
    // make proper vertex and index arrays
    let vertices = [];
    let indices = [];
    let totMesh = 0;
    let startVertex = [0];
    let startIndex = [0];
    for(i = 0; i < vert5.length; i++) {
        vertices[(i + startVertex[totMesh]) * 3 + 0 ] = vert5[i][0];
        vertices[(i + startVertex[totMesh]) * 3 + 1 ] = vert5[i][1];
        vertices[(i + startVertex[totMesh]) * 3 + 2 ] = vert5[i][2];
    }
    for(i = 0; i < ind5.length; i++) {
        indices[i + startIndex[totMesh]] = startVertex[totMesh] + ind5[i];
    }
    totMesh ++;	
    startVertex[totMesh] = startVertex[totMesh-1] + vert5.length;
    startIndex[totMesh] = startIndex[totMesh-1] + ind5.length;
    let ret = {};
    ret.vertices = vertices;
    ret.indices = indices; 
    return ret;
}
    
    
function createTriangle(){
    let ret = {};
    ret.vertices = [-1, 0, 0,
                    0, 0, -1,
                    0, 0, 0];
    ret.indices = [0, 2, 1, 0, 1, 2];
    return ret;
}


function createF(){
    let ret = {};
    ret.vertices = new Float32Array([
        // left column front
        0,   0,  0,
        0, 150,  0,
        30,   0,  0,
        0, 150,  0,
        30, 150,  0,
        30,   0,  0,

        // top rung front
        30,   0,  0,
        30,  30,  0,
        100,   0,  0,
        30,  30,  0,
        100,  30,  0,
        100,   0,  0,

        // middle rung front
        30,  60,  0,
        30,  90,  0,
        67,  60,  0,
        30,  90,  0,
        67,  90,  0,
        67,  60,  0,

        // left column back
          0,   0,  30,
         30,   0,  30,
          0, 150,  30,
          0, 150,  30,
         30,   0,  30,
         30, 150,  30,

        // top rung back
         30,   0,  30,
        100,   0,  30,
         30,  30,  30,
         30,  30,  30,
        100,   0,  30,
        100,  30,  30,

        // middle rung back
         30,  60,  30,
         67,  60,  30,
         30,  90,  30,
         30,  90,  30,
         67,  60,  30,
         67,  90,  30,

        // top
          0,   0,   0,
        100,   0,   0,
        100,   0,  30,
          0,   0,   0,
        100,   0,  30,
          0,   0,  30,

        // top rung right
        100,   0,   0,
        100,  30,   0,
        100,  30,  30,
        100,   0,   0,
        100,  30,  30,
        100,   0,  30,

        // under top rung
        30,   30,   0,
        30,   30,  30,
        100,  30,  30,
        30,   30,   0,
        100,  30,  30,
        100,  30,   0,

        // between top rung and middle
        30,   30,   0,
        30,   60,  30,
        30,   30,  30,
        30,   30,   0,
        30,   60,   0,
        30,   60,  30,

        // top of middle rung
        30,   60,   0,
        67,   60,  30,
        30,   60,  30,
        30,   60,   0,
        67,   60,   0,
        67,   60,  30,

        // right of middle rung
        67,   60,   0,
        67,   90,  30,
        67,   60,  30,
        67,   60,   0,
        67,   90,   0,
        67,   90,  30,

        // bottom of middle rung.
        30,   90,   0,
        30,   90,  30,
        67,   90,  30,
        30,   90,   0,
        67,   90,  30,
        67,   90,   0,

        // right of bottom
        30,   90,   0,
        30,  150,  30,
        30,   90,  30,
        30,   90,   0,
        30,  150,   0,
        30,  150,  30,

        // bottom
        0,   150,   0,
        0,   150,  30,
        30,  150,  30,
        0,   150,   0,
        30,  150,  30,
        30,  150,   0,

        // left side
        0,   0,   0,
        0,   0,  30,
        0, 150,  30,
        0,   0,   0,
        0, 150,  30,
        0, 150,   0]);

    ret.vertexNormals = new Float32Array([
        // left column front
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        // top rung front
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        // middle rung front
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        // left column back
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        // top rung back
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        // middle rung back
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        // top
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        // top rung right
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        // under top rung
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        // between top rung and middle
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        // top of middle rung
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        // right of middle rung
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        // bottom of middle rung.
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        // right of bottom
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        // bottom
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        // left side
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0]);
    ret.indices = [];
    for(let i = 0; i<ret.vertices.length/3; i++){
        ret.indices.push(i);
    }
    return ret;
}
