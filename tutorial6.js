var gl;
var shaderProgram;
var mMatrix = mat4.create();
var vMatrix = mat4.create();
var pMatrix = mat4.create();
var cuboVertexPositionBuffer;
var cuboVertexColorBuffer;
var cuboVertexIndexBuffer;
var predioTextura;
var xRot = 0;
var yRot = 0;
var xRot = 0;
var xVelo = 0;
var yRot = 0;
var yVelo = 0;
var z = -5.0;
var filtro = 0;
var ultimo = 0;
var mMatrixPilha = [];
var caixaTexturas = Array();
var teclasPressionadas = {};


$(function () {
  iniciaWebGL();
});

function iniciaWebGL() {
  var canvas = $('#canvas-webgl')[0];
  iniciarGL(canvas); // Definir como um canvas 3D
  iniciarShaders();  // Obter e processar os Shaders
  iniciarBuffers();  // Enviar o triângulo e quadrado na GPU
  iniciarAmbiente(); // Definir background e cor do objeto
  iniciarTextura();
  document.onkeydown = eventoTeclaPress;
  document.onkeyup = eventoTeclaSolta;
  
  tick();    // Usar os itens anteriores e desenhar
}
function iniciarGL(canvas) {
    try {
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
        if (!gl) {
            alert("Não pode inicializar WebGL, desculpe");
        }
    }
}
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
    shaderProgram.vertexTextureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.vertexTextureCoordAttribute);
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, "uVMatrix");
    shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram, "uMMatrix");

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
  


    cuboVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cuboVertexPositionBuffer);
    vertices = [
        // Front face
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,

        // Back face
        -1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,

        // Top face
        -1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0,

        // Right face
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,

        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    cuboVertexPositionBuffer.itemSize = 3;
    cuboVertexPositionBuffer.numItems = 4;

    cuboVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cuboVertexTextureCoordBuffer);
    var coordTextura = [
        // Frente
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,

        // Trás
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,

        // Topo
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,

        // Base
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,

        // Direita
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,

        // Esquerda
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coordTextura), gl.STATIC_DRAW);
    cuboVertexTextureCoordBuffer.itemSize = 2;
    cuboVertexTextureCoordBuffer.numItems = 24;
    
      cuboVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cuboVertexIndexBuffer);

    var indices = [
        0, 1, 2, 0, 2, 3, // Frente
        4, 5, 6, 4, 6, 7, // Trás
        8, 9, 10, 8, 10, 11, // Topo
        12, 13, 14, 12, 14, 15, // Base
        16, 17, 18, 16, 18, 19, // Direita
        20, 21, 22, 20, 22, 23 // Esquerda
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    cuboVertexIndexBuffer.itemSize = 1;
    cuboVertexIndexBuffer.numItems = 36;
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

    /*---Retire as chamadas para mPushMatrix e mPopMatrix---*/

    /*---Altere a translação---*/
    mat4.translate(mMatrix, mMatrix, [0.0, 0.0, z]);

    /*---Remova a antiga rotação do cubo---*/
    /*---Adicione estas 3 linhas---*/
    mat4.rotate(mMatrix, mMatrix, degToRad(xRot), [1, 0, 0]);
mat4.rotate(mMatrix, mMatrix, degToRad(yRot), [0, 1, 0]);


    gl.bindBuffer(gl.ARRAY_BUFFER, cuboVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cuboVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    /*---substitua cuboVertexColorBuffer por cuboVertexTextureCoordBuffer---*/
    /*---substitua vertexColorAttribute por vertexTextureCoordAttribute---*/
    gl.bindBuffer(gl.ARRAY_BUFFER, cuboVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexTextureCoordAttribute, cuboVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0); /*---Adicione estas 3 linhas antes de drawElements---*/
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, caixaTexturas[filtro]);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cuboVertexIndexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, cuboVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

function setMatrixUniforms() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform,
    false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.vMatrixUniform,
    false, vMatrix);
  gl.uniformMatrix4fv(shaderProgram.mMatrixUniform,
    false, mMatrix);
}

function iniciarTextura()
{
    var imagemCaixa = new Image();
    for(var i = 0; i < 3; i++)
    {
      var textura = gl.createTexture();
      textura.image = imagemCaixa;
      caixaTexturas.push(textura);
    }
    imagemCaixa.onload = function()
    {
      tratarTextura(caixaTexturas);
    }
    imagemCaixa.src = "caixa.gif";
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");


}

function tratarTextura(textura) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, caixaTexturas[0]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, caixaTexturas[0].image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  
    gl.bindTexture(gl.TEXTURE_2D, caixaTexturas[1]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, caixaTexturas[1].image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  
    gl.bindTexture(gl.TEXTURE_2D, caixaTexturas[2]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, caixaTexturas[2].image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
  
    gl.bindTexture(gl.TEXTURE_2D, null);
}


function tick()
{
  requestAnimFrame(tick);
  tratarTeclado();
  desenharCena();
  animar();
}
  function animar()
  {
    var agora = new Date().getTime();
    if(ultimo != 0)
    {
      var diferenca = agora - ultimo;
      xRot  += ((xVelo*diferenca)/1000.0) % 360.0;
      yRot  += ((yVelo*diferenca)/1000.0) % 360.0;
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

  function eventoTeclaPress(evento) {
    teclasPressionadas[evento.keyCode] = true;
  
    if (String.fromCharCode(evento.keyCode) == "F")
      filtro = (filtro+1) % 3;
  }
  
  function eventoTeclaSolta(evento) {
    teclasPressionadas[evento.keyCode] = false;
  }

  function tratarTeclado() {
    if (teclasPressionadas[33]) {
      // Page Up
      z -= 0.05;
    }
    if (teclasPressionadas[34]) {
      // Page Down
      z += 0.05;
    }
    if (teclasPressionadas[37]) {
      // Esquerda
      yVelo -= 1;
    }
    if (teclasPressionadas[39]) {
      // Direita
      yVelo += 1;
    }
    if (teclasPressionadas[38]) {
      // Cima
      xVelo -= 1;
    }
    if (teclasPressionadas[40]) {
      // Baixo
      xVelo += 1;
    }
  }