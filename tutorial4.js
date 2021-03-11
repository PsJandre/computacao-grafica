var mMatrix = mat4.create();
var vMatrix = mat4.create();
var pMatrix = mat4.create();
var triangleVertexPositionBuffer;
var triangleVertexColorBuffer;
var squareVertexPositionBuffer;
var squareVertexColorBuffer;
var rPiramide = 0;
  var rCubo = 0;
var mMatrixPilha = [];


$(function () {
  iniciaWebGL();
});
function iniciaWebGL() {
  var canvas = $('#canvas-webgl')[0];
  iniciarGL(canvas); // Definir como um canvas 3D
  iniciarShaders();  // Obter e processar os Shaders
  iniciarBuffers();  // Enviar o triângulo e quadrado na GPU
  iniciarAmbiente(); // Definir background e cor do objeto
 tick();    // Usar os itens anteriores e desenhar
}
function iniciarGL(canvas) {
  try {
    gl = canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  }
  catch (e) {
    if (!gl)
      alert("Não pode inicializar WebGL, desculpe");
  }
}
var shaderProgram;
function iniciarShaders() {
  var vertexShader = getShader(gl, "#shader-vs");
  var fragmentShader = getShader(gl, "#shader-fs");

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Não pode inicializar shaders");
  }

  gl.useProgram(shaderProgram);

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram,
    "uPMatrix");
  shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram,
    "uVMatrix");
  shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram,
    "uMMatrix");


}

function getShader(gl, id) {
  var shaderScript = $(id)[0];
  if (!shaderScript) {
    return null;
  }

  var str = "";
  var k = shaderScript.firstChild;
  while (k) {
    if (k.nodeType == 3)
      str += k.textContent;
    k = k.nextSibling;
  }

  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  }
  else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  }
  else {
    return null;
  }

  gl.shaderSource(shader, str);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}
function iniciarBuffers() {
  triangleVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
  var vertices = [
    0.0, 1.0, 0.0,
    -1.0, -1.0, 0.0,
    1.0, -1.0, 0.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  triangleVertexPositionBuffer.itemSize = 3;
  triangleVertexPositionBuffer.numItems = 3;

  triangleVertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
  var cores = [
      1.0, 0.0, 0.0, 1.0,
      0.0, 1.0, 0.0, 1.0,
      0.0, 0.0, 1.0, 1.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cores), gl.STATIC_DRAW);
  triangleVertexColorBuffer.itemSize = 4;
  triangleVertexColorBuffer.numItems = 3;

  squareVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
  vertices = [
    1.0, 1.0, 0.0,
    -1.0, 1.0, 0.0,
    1.0, -1.0, 0.0,
    -1.0, -1.0, 0.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  squareVertexPositionBuffer.itemSize = 3;
  squareVertexPositionBuffer.numItems = 4;
  squareVertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
  cores = []
  for (var i=0; i < 4; i++) {
    cores = cores.concat([0.5, 0.5, 1.0, 1.0]);
  }
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cores), gl.STATIC_DRAW);
  squareVertexColorBuffer.itemSize = 4;
  squareVertexColorBuffer.numItems = 4;
}
function iniciarAmbiente() {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
}
function desenharCena() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  mat4.perspective(pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
  mat4.identity(mMatrix);
  mat4.identity(vMatrix);

  // Desenhando Triângulo
  var translation = vec3.create();
  vec3.set(translation, -1.5, 1.0, -7.0);
  mat4.translate(mMatrix, mMatrix, translation);
  mPushMatrix();
  mat4.rotate(mMatrix, mMatrix, degToRad(rPiramide), [0, 1, 0]);
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  setMatrixUniforms();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, triangleVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);
  mPopMatrix(); 
  // Desenhando o Quadrado
  vec3.set(translation, 3.0, 0.0, 0.0);
  mat4.translate(mMatrix, mMatrix, translation);
  mPushMatrix();
  mat4.rotate(mMatrix, mMatrix, degToRad(rCubo), [1, 1, 1]);
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  setMatrixUniforms();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, squareVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
  setMatrixUniforms();

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
  mPopMatrix();
}

function setMatrixUniforms() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform,
    false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.vMatrixUniform,
    false, vMatrix);
  gl.uniformMatrix4fv(shaderProgram.mMatrixUniform,
    false, mMatrix);
}

function tick()
{
  requestAnimFrame(tick);
  desenharCena();
  animar();
}
var ultimo = 0;
  function animar()
  {
    var agora = new Date().getTime();
    if(ultimo != 0)
    {
      var diferenca = agora - ultimo;
      rPiramide  += ((90*diferenca)/1000.0) % 360.0;
  rCubo += ((75*diferenca)/1000.0) % 360.0;
    }
    ultimo = agora;
  }
  function mPushMatrix() {
    var copy = mat4.clone(mMatrix);
    mMatrixPilha.push(copy);
  }
  function mPopMatrix() {
    if (mMatrixPilha.length == 0) {
      throw "inválido popMatrix!";
    }
    mMatrix = mMatrixPilha.pop();
  }
  function degToRad(graus) {
    return graus * Math.PI / 180;
  }