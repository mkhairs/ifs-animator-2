var settings = {
  textureSize: 1024,
  animating: false,
  animationSpeed: 100,
};

var gl = GL.create();
var mesh = GL.Mesh.plane();

var ifs;
var ifsRenderer;
var canvasGl, $canvasGl;
var canvas2d, $canvas2d;

var cancelNextInit = false;
function initIFS() {
  if (ifs) ifs.dispose();
  if (ifsRenderer) ifsRenderer.dispose();

  ifs = new IFS(gl, settings.textureSize);
  ifsRenderer = new IFSRenderer(ifs, gl.canvas, gl, canvas2d.getContext('2d'));
  ifsRenderer.animating = settings.animating;
  ifsRenderer.animationSpeed = settings.animationSpeed;

  ifs.brightness = 1.02;

  for (var i = 0; i < 3; i++) {
    var angle = Math.random() * 2 * Math.PI;
    var scale = Math.random() * 0.6 + 0.3;
    var a = Math.cos(angle) * scale;
    var d = Math.sin(angle) * scale;
    var item = {
      matrix: new GL.Matrix(
        a, -d, 0.0, Math.random() - 0.5,
        d, a, 0.0, Math.random() - 0.5,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
      ),
      color: [Math.random() * 100, Math.random() * 100, Math.random() * 100],
      _color: [1,1,1,1],
      rotationSpeed: 0 | Math.random() * 100 + 50
    };
    ifs.functions.push(item);
  }

  ifsRenderer.fitToScreen();
}

function applyPresetByName(name) {
  if (!ifs || !ifsRenderer || !name) return;

  var preset = IFS_PRESETS[name];
  if (!preset) return;

  ifs.globalTransform.matrix = new GL.Matrix();
  ifs.globalTransform.rotationSpeed = preset.globalRotationSpeed || 100;

  ifs.functions = [];

  for (var i = 0; i < preset.functions.length; i++) {
    var f = preset.functions[i];
    var matrix = new GL.Matrix([
      f.a, f.b, 0.0, f.e,
      f.c, f.d, 0.0, f.f,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0
    ]);

    ifs.functions.push({
      matrix: matrix,
      color: f.color || [Math.random() * 100, Math.random() * 100, Math.random() * 100],
      _color: [1, 1, 1, 1],
      rotationSpeed: typeof f.rotationSpeed === 'number' ? f.rotationSpeed : (50 + Math.random() * 100)
    });
  }

  if (typeof preset.brightness === 'number') {
    ifs.brightness = preset.brightness;
  }

  ifsRenderer.fitToScreen();
  ifs.reset();
}

var IFS_PRESETS = {
  'sierpinski-triangle': {
    brightness: 1.5,
    functions: [
      { a: 0.5, b: 0.0, c: 0.0, d: 0.5, e: -0.5, f: -0.5, color: [100, 20, 20] },
      { a: 0.5, b: 0.0, c: 0.0, d: 0.5, e: 0.5,  f: -0.5, color: [20, 100, 20] },
      { a: 0.5, b: 0.0, c: 0.0, d: 0.5, e: 0.0,  f: 0.366, color: [20, 20, 100] }
    ]
  },
  'sierpinski-carpet': {
    brightness: 1.5,
    functions: (function () {
      var fns = [];
      var s = 1.0 / 3.0;
      for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;
          fns.push({
            a: s, b: 0, c: 0, d: s,
            e: i * s, f: j * s,
            color: [60 + 30 * i, 60 + 30 * j, 100]
          });
        }
      }
      return fns;
    })()
  },
  'koch-snowflake': {
    brightness: 1.5,
    functions: [
      // 1. Scale by 1/3, no rotation
      { a: 1/3, b: 0, c: 0, d: 1/3, e: -1/2, f: -Math.sqrt(3)/6 },
      
      // 2. Scale by 1/3, Rotate +60 degrees
      { a: 1/6, b: -Math.sqrt(3)/6, c: Math.sqrt(3)/6, d: 1/6, e: -1/6, f: 0 },
      
      // 3. Scale by 1/3, Rotate -60 degrees
      { a: 1/6, b: Math.sqrt(3)/6, c: -Math.sqrt(3)/6, d: 1/6, e: 1/6, f: 0 },
      
      // 4. Scale by 1/3, no rotation
      { a: 1/3, b: 0, c: 0, d: 1/3, e: 1/2, f: -Math.sqrt(3)/6 }
    ]
  },
  'dragon-curve': {
    brightness: 1.5,
    functions: [
      { a: 0.5, b: -0.5, c: 0.5, d: 0.5, e: 0.0, f: 0.0 },
      { a: -0.5, b: -0.5, c: 0.5, d: -0.5, e: 1.0, f: 0.0 }
    ]
  },
  'pythagoras-tree': {
    brightness: 1.5,
    functions: [
      { a: 0.5, b: 0.0, c: 0.0, d: 0.5, e: 0.0, f: -0.5, color: [40, 80, 20] },
      { a: 0.35, b: -0.35, c: 0.35, d: 0.35, e: -0.3, f: 0.0, color: [30, 60, 20] },
      { a: 0.35, b: 0.35, c: -0.35, d: 0.35, e: 0.3, f: 0.0, color: [30, 60, 20] }
    ]
  },
  'hilbert-curve': {
    brightness: 1.5,
    functions: [
      { a: 0.5, b: 0.0, c: 0.0, d: 0.5, e: -0.5, f: -0.5 },
      { a: 0.0, b: 0.5, c: 0.5, d: 0.0, e: -0.5, f: 0.0 },
      { a: 0.0, b: 0.5, c: 0.5, d: 0.0, e: 0.0, f: 0.0 },
      { a: -0.5, b: 0.0, c: 0.0, d: -0.5, e: 0.5, f: 0.5 }
    ]
  },
  'peano-curve': {
    brightness: 1.5,
    functions: (function () {
      var fns = [];
      var s = 1.0 / 3.0;
      for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {
          fns.push({
            a: s, b: 0, c: 0, d: s,
            e: i * s, f: j * s
          });
        }
      }
      return fns;
    })()
  },
  'pascal-sierpinski': {
    brightness: 1.5,
    functions: [
      { a: 0.5, b: 0.0, c: 0.0, d: 0.5, e: -0.5, f: -0.5 },
      { a: 0.5, b: 0.0, c: 0.0, d: 0.5, e: 0.5, f: -0.5 },
      { a: 0.5, b: 0.0, c: 0.0, d: 0.5, e: 0.0, f: 0.5 }
    ]
  },
  'mandelbrot-style': {
    brightness: 1.5,
    functions: [
      { a: 0.9, b: -0.2, c: 0.2, d: 0.9, e: -0.2, f: 0.0 },
      { a: 0.4, b: 0.3, c: -0.3, d: 0.4, e: 0.6, f: 0.0 }
    ]
  },
  'julia-style': {
    brightness: 1.5,
    functions: [
      { a: 0.7, b: -0.3, c: 0.3, d: 0.7, e: -0.2, f: 0.0 },
      { a: 0.7, b: 0.3, c: -0.3, d: 0.7, e: 0.2, f: 0.0 }
    ]
  },
  'lorenz-style': {
    brightness: 1.5,
    functions: [
      { a: 0.5, b: -0.4, c: 0.4, d: 0.5, e: -0.4, f: 0.0 },
      { a: 0.5, b: 0.4, c: -0.4, d: 0.5, e: 0.4, f: 0.0 }
    ]
  },
  'menger-style': {
    brightness: 1.5,
    functions: (function () {
      var fns = [];
      var s = 1.0 / 3.0;
      for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;
          fns.push({
            a: s, b: 0, c: 0, d: s,
            e: i * s, f: j * s
          });
        }
      }
      return fns;
    })()
  },
  'l-system-style': {
    brightness: 1.5,
    functions: [
      { a: 0.5, b: 0.0, c: 0.0, d: 0.5, e: 0.0, f: -0.5 },
      { a: 0.35, b: -0.35, c: 0.35, d: 0.35, e: -0.3, f: 0.0 },
      { a: 0.35, b: 0.35, c: -0.35, d: 0.35, e: 0.3, f: 0.0 }
    ]
  },
  'weierstrass-style': {
    brightness: 1.5,
    functions: [
      { a: 0.5, b: 0.0, c: 0.0, d: 0.7, e: -0.5, f: 0.0 },
      { a: 0.5, b: 0.0, c: 0.0, d: 0.7, e: 0.0, f: 0.0 },
      { a: 0.5, b: 0.0, c: 0.0, d: 0.7, e: 0.5, f: 0.0 }
    ]
  },
  'fern-leaf': {
    brightness: 1.5,
    functions: [
      { a: 0.0, b: 0.0, c: 0.0, d: 0.16, e: 0.0, f: 0.0, color: [20, 80, 30] },
      { a: 0.85, b: 0.04, c: -0.04, d: 0.85, e: 0.0, f: 1.6, color: [30, 100, 40] },
      { a: 0.2, b: -0.26, c: 0.23, d: 0.22, e: 0.0, f: 1.6, color: [25, 90, 35] },
      { a: -0.15, b: 0.28, c: 0.26, d: 0.24, e: 0.0, f: 0.44, color: [35, 95, 45] }
    ]
  }
};

function saveIFS() {
  var m, c, result = "";
  function append(val) {
    result += (Math.round(val * 10000) / 10000) + "|";
  }

  append(ifs.brightness);
  append(ifsRenderer.animationSpeed);

  m = ifs.globalTransform.matrix.m;
  append(m[0]);
  append(m[1]);
  append(m[4]);
  append(m[5]);
  append(m[3]);
  append(m[7]);
  append(ifs.globalTransform.rotationSpeed);

  append(ifs.functions.length);
  for (var i = 0; i < ifs.functions.length; i++) {
    m = ifs.functions[i].matrix.m;
    append(m[0]);
    append(m[1]);
    append(m[4]);
    append(m[5]);
    append(m[3]);
    append(m[7]);

    c = ifs.functions[i].color;
    append(c[0]);
    append(c[1]);
    append(c[2]);

    append(ifs.functions[i].rotationSpeed);
  }
  return result;
}

function loadIFS(values) {
  var newIfs = new IFS(gl, settings.textureSize);
  var newIfsRenderer = new IFSRenderer(newIfs, gl.canvas, gl, canvas2d.getContext('2d'));
  newIfsRenderer.animating = settings.animating;

  values = values.split('|');
  var error = false, m, it = 0;
  function next() {
    if (it >= values.length) {
      error = true;
      return;
    }
    var v = values[it++];
    if (v.indexOf('.') != -1) v = parseFloat(v);
    else v = parseInt(v);
    if (isNaN(v)) error = true;
    return v;
  }

  newIfs.brightness = next();
  newIfsRenderer.animationSpeed = next();

  m = newIfs.globalTransform.matrix.m;
  m[0] = next(); if (error) return;
  m[1] = next(); if (error) return;
  m[4] = next(); if (error) return;
  m[5] = next(); if (error) return;
  m[3] = next(); if (error) return;
  m[7] = next(); if (error) return;
  newIfs.globalTransform.rotationSpeed = next(); if (error) return;

  var c, object, count;

  count = next(); if (error) return;

  for (var i = 0; i < count; i++) {
    object = {
      matrix: new GL.Matrix(),
      color: [0,0,0],
      _color: [1,1,1,1],
      rotationSpeed: 0
    };

    m = object.matrix.m;
    m[0] = next(); if (error) return;
    m[1] = next(); if (error) return;
    m[4] = next(); if (error) return;
    m[5] = next(); if (error) return;
    m[3] = next(); if (error) return;
    m[7] = next(); if (error) return;

    c = object.color;
    c[0] = next(); if (error) return;
    c[1] = next(); if (error) return;
    c[2] = next(); if (error) return;

    object.rotationSpeed = next(); if (error) return;
    newIfs.functions.push(object);
  }


  var wasAnimating = false;

  if (ifs) ifs.dispose();
  if (ifsRenderer) ifsRenderer.dispose();

  ifs = newIfs;
  ifsRenderer = newIfsRenderer;
}

gl.onupdate = function(seconds) {
  ifs.step(seconds);
  ifsRenderer.step(seconds);
};

var fading = false;

gl.ondraw = function() {
  ifs.update();
  if (epilepsySafeTimer == 0) {
    if (!fading) {
      fading = true;
      $canvasGl.animate({'opacity': 1}, 1000, 'swing', function() {fading = false;});
    }
  }
  else {
    fading = false;
    $canvasGl.stop(true).css('opacity', 0);
  }
  ifsRenderer.render();
};

gl.canvas.addEventListener('contextmenu', function(e) {
  e.preventDefault();
});

function glTextureToImage(texture) {
  // convert a WebGL texture to a data URL without disturbing the
  // visible canvas size; also take care of the implied y‑flip that
  // WebGL applies to textures so the screenshot looks correct.
  var width = texture.width, height = texture.height;
  var prevWidth = parseInt($canvasGl.css('width')),
      prevHeight = parseInt($canvasGl.css('height'));

  $canvasGl.css({width: width, height: height});
  canvasGl.width = width;
  canvasGl.height = height;

  gl.viewport(0, 0, width, height);

  // shader only needs to be created once; note the flip in the
  // y‑coordinate when sampling the texture.
  glTextureToImage.shader = glTextureToImage.shader || new GL.Shader([
    'varying vec2 coord;',

    'void main() {',
      'coord = (gl_Vertex.xy + 1.0) * 0.5;',
      'coord.y = 1.0 - coord.y;',                 // flip vertical
      'gl_Position.zw = gl_Vertex.zw;',
      'gl_Position.xy = gl_Vertex.xy;',
    '}'
  ].join('\n'), [
    'uniform sampler2D texture;',
    'varying vec2 coord;',

    'void main() {',
      'gl_FragColor = texture2D(texture, coord);',
    '}'
  ].join('\n'));

  texture.bind(0);
  glTextureToImage.shader.uniforms({
    texture: 0
  }).draw(mesh);
  texture.unbind(0);

  var result = canvasGl.toDataURL();

  // restore previous dimensions/style
  $canvasGl.css({width: prevWidth, height: prevHeight});
  canvasGl.width = prevWidth;
  canvasGl.height = prevHeight;
  gl.viewport(0, 0, prevWidth, prevHeight);

  return result;
}

function resize() {
  var sizeW = $('#fractal-container').width(),
      sizeH = $('#fractal-container').height();

  $canvasGl.css({width: sizeW, height: sizeH});
  canvasGl.width = sizeW;
  canvasGl.height = sizeH;

  gl.viewport(0, 0, sizeW, sizeH);

  $canvas2d.css({width: sizeW, height: sizeH});
  canvas2d.width = sizeW;
  canvas2d.height = sizeH;
}

function getUrlHash() {
  return decodeURIComponent(document.location.hash.substr(1));
}

$(document).ready(function() {
  canvasGl = gl.canvas
  $canvasGl = $(canvasGl);
  $canvas2d = $('#fractal-ui');
  canvas2d = $canvas2d[0];

  $(window).bind('hashchange', function() {
		loadIFS(getUrlHash());
	});

  loadIFS(getUrlHash());
  if (ifs === undefined) initIFS();

  $('#the-fractal').replaceWith($(canvasGl));
  $canvasGl.attr({'id': '#the-fractal', 'tabindex': '1'}).mousedown(function() { $(this).focus(); });

  gl.animate();

  $(window).resize(resize);
  resize();

  initGuiControls();
});