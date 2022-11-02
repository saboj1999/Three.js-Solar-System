/**
 * vertex data = [...]
 * create buffer
 * load vertexdata into buffer
 * 
 * create vertex shader
 * create fragment shader
 * create shader program
 * attach shaders to program
 * 
 * enable vertex attributes
 * 
 * draw arrays
 * 
 * */
const { mat2, mat2d, mat3, mat4, quat, quat2, vec2, vec3, vec4 } = glMatrix; // needed for newer versions of webGL


const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    throw new Error('WebGL not supported');
}



let vertexData = [];

// vertexData = torus(10, 6, 2*Math.PI/24.5, 2*Math.PI/24.5);

let vertexData2 = sphere(5, 2*Math.PI/60, 2*Math.PI/40);

// vertexData = cylinder(7.24, 15, 2*Math.PI/50, .7);

// vertexData = mirrorAllAxes(vertexData, 7.5);

vertexData = floor(1000, 401, 5, 10);

const colorData = getColorData(vertexData, 12, [1, 1, 1], [0, 0, 0]);
const colorData2 = getColorData(vertexData2, 12, randomColor(), randomColor());


const matrix = mat4.create();
const cameraMatrix = mat4.create();
let eye = vec4.fromValues(0, 0, 1e-4, 1);


// mat4.translate(matrix, matrix, [.2, .5, 0]);

// mat4.scale(matrix, matrix, [0.12/12, 0.12/12, 0.12/12]);

//mat4.rotateZ(matrix, matrix, Math.PI/2);

document.addEventListener('keydown', function(event) {
    let speed = 1;
    if (event.code == 'KeyD') { // right

        //mat4.rotateY(matrix, matrix, -speed);
        
        // here is where we will do the matrix and vector multiplication

        mat4.translate(matrix, matrix, [-speed, 0, 0])
        // vec4.transformMat4(eye, eye, matrix);
        // mat4.lookAt(cameraMatrix, eye, [0,0,0,1], [0,1,0,1]);

    }else  if (event.code == 'KeyA') { // left


        mat4.translate(matrix, matrix, [speed, 0, 0])
        // vec4.transformMat4(eye, eye, rotateRight);
        // mat4.lookAt(cameraMatrix, eye, [0,0,0,1], [0,1,0,1]);
  
    } else if (event.code == 'KeyW') { // forward

        mat4.translate(matrix, matrix, [0, 0, speed]);
        // vec4.transformMat4(eye, eye, zoomIn);
        // mat4.lookAt(cameraMatrix, eye, [0,0,0,1], [0,1,0,1]);

    } else if (event.code == 'KeyS') { // backward

        mat4.translate(matrix, matrix, [0, 0, -speed]);
        // vec4.transformMat4(eye, eye, zoomOut);
        // mat4.lookAt(cameraMatrix, eye, [0,0,0,1], [0,1,0,1]);

    } else if (event.code == 'Space') { // up

        mat4.translate(matrix, matrix, [0, -speed, 0]);
        // vec4.transformMat4(eye, eye, zoomOut);
        // mat4.lookAt(cameraMatrix, eye, [0,0,0,1], [0,1,0,1]);

    } else if (event.keyCode == 16) { // down -->left shift

        mat4.translate(matrix, matrix, [0, speed, 0]);

    } else if (event.keyCode == 38) { // look down --> up arrow

        mat4.rotateX(cameraMatrix, cameraMatrix, 2*Math.PI/64); // cameraMatrix works but only on one axis

    } else if (event.keyCode == 40) { // look up --> down arrow

        mat4.rotateX(cameraMatrix, cameraMatrix, -2*Math.PI/64);

    } else if (event.keyCode == 39) { // look right --> right arrow

        mat4.rotateY(matrix, matrix, 2*Math.PI/64); // camera matrix works right-left OR up-down

    } else if (event.keyCode == 37) { // look left --> left arrow

        mat4.rotateY(matrix, matrix, -2*Math.PI/64);
    }

  });

  mat4.lookAt(cameraMatrix, eye, [0,0,0,1], [0,1,0,1]); 

const projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix, 
      90 * Math.PI/180, // vertical field-of-view (angle, radians)
      canvas.width/canvas.height, // aspect W/H
      1e-4, // near cull distance
      1e4 // far cull distance
);

  
  mat4.translate(matrix, matrix, [0, -10, -30]);

  mat4.invert(cameraMatrix, cameraMatrix);

function animate() {
    requestAnimationFrame(animate);

    // add rotations here
    // mat4.rotateZ(matrix, matrix, Math.PI/4 / 60);
    // mat4.rotateX(matrix, matrix, -Math.PI/4 / 50);
    // mat4.rotateY(matrix, matrix, -Math.PI/4 / 40);

    const object1 = createModelView(vertexData, colorData);


    gl.uniformMatrix4fv(object1.matrix, false, matrix); // loading the matrices onto the GPU
    gl.uniformMatrix4fv(object1.cameraMatrix, false, cameraMatrix);
    gl.uniformMatrix4fv(object1.projectionMatrix, false, projectionMatrix);

    gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);

    const object2 = createModelView(vertexData2, colorData2);

    gl.uniformMatrix4fv(object2.matrix, false, matrix); // loading the matrices onto the GPU
    gl.uniformMatrix4fv(object2.cameraMatrix, false, cameraMatrix);
    gl.uniformMatrix4fv(object2.projectionMatrix, false, projectionMatrix);

    gl.drawArrays(gl.TRIANGLES, 0, vertexData2.length / 3);


    // send new matrix
    //draw new arrays
}

animate(); 