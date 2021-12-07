/*
 * The Mandelbrot Set, in HTML5 canvas and javascript.
 * https://github.com/cslarsen/mandelbrot-js
 *
 * Copyright (C) 2012, 2018 Christian Stigen Larsen
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.  You may obtain
 * a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 */

/*
 * Global variables:
 */
const zoomStart = 4
let zoom = zoomStart // inverse scaling factor, independent of the size of the image
const lookAtDefault = [0, 0]
let lookAt = lookAtDefault
let xRange = [0, 0]
let yRange = [0, 0]
const escapeRadius = 4
const interiorColor = [0, 0, 0, 255]
const solidLineColor = [255, 0, 0, 255]
let reInitCanvas = true // Whether to reload canvas size, etc
let renderId = 0 // To zoom before current render is finished
const updateTimeout = 500 // number of ms after showing the the scanline
const superSamples = 1 // number of samples in each pixel

/*
 * Initialize canvas
 */
let canvas = document.getElementById('canvasMandelbrot')
const size = document.getElementById('canvasContainer').offsetWidth
canvas.width  = size
canvas.height = size
let ctx = canvas.getContext('2d')
let img = ctx.createImageData(canvas.width, 1)

function getColorPicker()
{
  const p = document.getElementById("colorScheme").value
  if (p == "pickColorHSV1") return pickColorHSV1
  if (p == "pickColorHSV2") return pickColorHSV2
  if (p == "pickColorHSV3") return pickColorHSV3
  if (p == "pickColorGrayscale2") return pickColorGrayscale2
  return pickColorGrayscale
}

/*
 * Main renderer equation.
 *
 * Returns number of iterations and values of Z_{n}^2 = Tr + Ti at the time
 * we either converged (n == iterations) or diverged.  We use these to
 * determined the color at the current pixel.
 *
 * The Mandelbrot set is rendered taking
 *
 *     Z_{n+1} = Z_{n}^2 + C
 *
 * with C = x + iy, based on the "look at" coordinates.
 *
 * The Julia set can be rendered by taking
 *
 *     Z_{0} = C = x + iy
 *     Z_{n+1} = Z_{n} + K
 *
 * for some arbitrary constant K.  The point C for Z_{0} must be the
 * current pixel we're rendering, but K could be based on the "look at"
 * coordinate, or by letting the user select a point on the screen.
 */
function iterateEquation(Cr, Ci, iterations)
{
  var Zr = 0
  var Zi = 0
  var Tr = 0
  var Ti = 0
  let n = 0
  while (n < iterations && (Tr+Ti) <= escapeRadius) {
    Zi = 2 * Zr * Zi + Ci
    Zr = Tr - Ti + Cr
    Tr = Zr * Zr
    Ti = Zi * Zi
    n++
  }

  /*
   * Four more iterations to decrease error term
   * see http://linas.org/art-gallery/escape/escape.html
   */
  for (let e = 0; e < 4; ++e) {
    Zi = 2 * Zr * Zi + Ci
    Zr = Tr - Ti + Cr
    Tr = Zr * Zr
    Ti = Zi * Zi
  }
  return [n, Tr, Ti]
}

/*
 * Update small info box in lower right hand side
 */
function updateInfoBox()
{
  // Update infobox
  console.debug('x=' + lookAt[0], ' y=' + lookAt[1], 's=' + zoom, ' w=' + canvas.width, 'pixels=' + (canvas.width*canvas.height/1000000.0).toFixed(1) + 'M')
}

/*
 * Return number with metric units
 */
function metric_units(number)
{
  const unit = ["", "k", "M", "G", "T", "P", "E"]
  const mag = Math.ceil((1+Math.log(number)/Math.log(10))/3)
  return "" + (number/Math.pow(10, 3*(mag-1))).toFixed(2) + unit[mag]
}

/*
 * Convert hue-saturation-value/luminosity to RGB.
 *
 * Input ranges:
 *   H =   [0, 360] (integer degrees)
 *   S = [0.0, 1.0] (float)
 *   V = [0.0, 1.0] (float)
 */
function hsv_to_rgb(h, s, v)
{
  if (v > 1.0) 
    v = 1.0
  const hp = h/60.0
  const c = v * s
  const x = c*(1 - Math.abs((hp % 2) - 1))
  let rgb = [0, 0, 0]

  if (0 <= hp && hp < 1) rgb = [c, x, 0]
  if (1 <= hp && hp < 2) rgb = [x, c, 0]
  if (2 <= hp && hp < 3) rgb = [0, c, x]
  if (3 <= hp && hp < 4) rgb = [0, x, c]
  if (4 <= hp && hp < 5) rgb = [x, 0, c]
  if (5 <= hp && hp < 6) rgb = [c, 0, x]

  const m = v - c
  rgb[0] += m
  rgb[1] += m
  rgb[2] += m

  rgb[0] *= 255
  rgb[1] *= 255
  rgb[2] *= 255
  return rgb
}

function addRGB(v, w)
{
  v[0] += w[0]
  v[1] += w[1]
  v[2] += w[2]
  return v
}

function divRGB(v, div)
{
  v[0] /= div
  v[1] /= div
  v[2] /= div
  return v
}

/*
 * Render the Mandelbrot set
 */
function draw()
{
  // debugger
  if (lookAt === null)
    lookAt = lookAtDefault
  if (zoom === null) 
    zoom = zoomStart

  zoom = 4 / parseFloat(document.getElementById('zoom').value)
  xRange = [lookAt[0]-zoom/2, lookAt[0]+zoom/2] // coordinates of the corners
  yRange = [lookAt[1]-zoom/2, lookAt[1]+zoom/2]

  if (reInitCanvas) // update canvas if necessary
  {
    reInitCanvas = false
    canvas = document.getElementById('canvasMandelbrot')
    const size = document.getElementById('canvasContainer').offsetWidth
    canvas.width  = size
    canvas.height = size
    ctx = canvas.getContext('2d')
    img = ctx.createImageData(canvas.width, 1) // one line of the canvas
  }

  const steps = parseInt(document.getElementById('steps').value, 10)
  // document.getElementById('zoom').value = zoom

  const dx = zoom / (0.5 + (canvas.width-1)) // real-world distance between two pixels
  // console.debug("dx", dx)

  updateInfoBox()

  // let pickColor = getColorPicker()
  const pickColor = pickColorHSV2

  // Only enable one render at a time
  renderId += 1

  function drawLineSuperSampled(Ci, Cr_init, Cr_step)
  {
    let Cr = Cr_init // real part
    let off = 0
    for (let x = 0; x < canvas.width; ++x) {
      let color = [0, 0, 0, 255]
      for (let s = 0; s < superSamples; ++s)
      {
        const rx = Math.random()*Cr_step
        const ry = Math.random()*Cr_step
        const p = iterateEquation(Cr - rx/2, Ci - ry/2, steps)
        color = addRGB(color, pickColor(steps, p[0], p[1], p[2]))
      }
      color = divRGB(color, superSamples)
      img.data[off++] = color[0]
      img.data[off++] = color[1]
      img.data[off++] = color[2]
      img.data[off++] = 255
      Cr += Cr_step
    }
  }

  function drawLine(Ci, Cr_init, Cr_step)
  {
    let Cr = Cr_init // real part of the first point
    let off = 0
    for (let x = 0; x < canvas.width; ++x) 
    {
      const p = iterateEquation(Cr, Ci, steps)
      const color = pickColor(steps, p[0], p[1], p[2])
      img.data[off++] = color[0]
      img.data[off++] = color[1]
      img.data[off++] = color[2]
      img.data[off++] = 255
      Cr += Cr_step
    }
  }

  /**
   * Draw a solid line when the rendering is slow 
   */
  function drawSolidLine()
  {
    let off = 0
    for (let x = 0; x < canvas.width; ++x)
    {
      img.data[off++] = solidLineColor[0]
      img.data[off++] = solidLineColor[1]
      img.data[off++] = solidLineColor[2]
      img.data[off++] = solidLineColor[3]
    }
  }

  function updateForm() {
    document.getElementById('_snapshot').value = canvas.toDataURL('image/png')
    document.getElementById('_cx').value = lookAt[0]
    document.getElementById('_cy').value = lookAt[1]
    document.getElementById('_scale').value = 4 / zoom
    document.getElementById('_maxiter').value = steps
  }

  function render()
  {
    const start = (new Date).getTime() // start time (for statistics)
    const startHeight = canvas.height // canvas height when the rendering started
    const startWidth = canvas.width
    let lastUpdate = start
    let pixels = 0 // number of computed pixels
    let Ci = yRange[0]
    let sy = 0 // index of the current line
    let drawLineFunc = superSamples>1 ? drawLineSuperSampled : drawLine
    let ourRenderId = renderId

    const scanline = function()
    {
      // stop drawing if the windows changed or a new render was launched
      if (renderId != ourRenderId || startHeight != canvas.height || startWidth != canvas.width )
      {
        return
      }

      drawLineFunc(Ci, xRange[0], dx)
      Ci += dx
      pixels += canvas.width
      ctx.putImageData(img, 0, sy)

      let now = (new Date).getTime()

      /*
       * Javascript is inherently single-threaded, and the way
       * you yield thread control back to the browser is MYSTERIOUS.
       *
       * People seem to use setTimeout() to yield, which lets us
       * make sure the canvas is updated, so that we can do animations.
       *
       * But if we do that for every scanline, it will take 100x longer
       * to render everything, because of overhead.  So therefore, we'll
       * do something in between.
       */
      if (sy++ < canvas.height) 
      {
        if ( (now - lastUpdate) >= updateTimeout ) 
        {
          // show the user where we're rendering
          drawSolidLine()
          ctx.putImageData(img, 0, sy)
          // Update speed and time taken
          const elapsedMS = now - start // elapsed time (in ms) from the beginning of the render
          const speed = Math.floor(pixels / elapsedMS)
          console.debug("render speed: " + metric_units(speed) + '/sec')

          // yield control back to browser, so that canvas is updated
          lastUpdate = now
          // 
          setTimeout(scanline, 0)
        } else
          scanline()
      }
      else
      {
        updateForm() // copy the canvas data only when the render is finished
        console.debug("Draw ended: ", ourRenderId)
      }
    }

    // Disallow redrawing while rendering
    scanline()
  }

  render()
}

// Some constants used with smoothColor
const logBase = 1.0 / Math.log(2.0)
const logHalfBase = Math.log(0.5)*logBase

function smoothColor(steps, n, Tr, Ti)
{
  /*
   * Original smoothing equation is
   *
   * var v = 1 + n - Math.log(Math.log(Math.sqrt(Zr*Zr+Zi*Zi)))/Math.log(2.0)
   *
   * but can be simplified using some elementary logarithm rules to
   */
  return n
  // return 5 + n - logHalfBase - Math.log(Math.log(Tr+Ti))*logBase
}

// simple map from number iterations to hue
function pickColorHSV1(steps, n, Tr, Ti)
{
  if (n == steps) // converged?
    return interiorColor

  const v = smoothColor(steps, n, Tr, Ti)
  const c = hsv_to_rgb(360.0*v/steps, 1.0, 1.0)
  return c
}

function pickColorHSV2(steps, n, Tr, Ti)
{
  if (n == steps) // converged?
    return interiorColor

  const v = smoothColor(steps, n, Tr, Ti)
  const c = hsv_to_rgb(360.0*v/steps, 1.0, 10.0*v/steps) // use also the value
  return c
}

function pickColorHSV3(steps, n, Tr, Ti)
{
  if (n == steps) // converged?
    return interiorColor

  const v = smoothColor(steps, n, Tr, Ti)
  let c = hsv_to_rgb(360.0*v/steps, 1.0, 10.0*v/steps)
  // swap red and blue
  const t = c[0]
  c[0] = c[2]
  c[2] = t
  return c
}

// scale by two and clamp
function pickColorGrayscale(steps, n, Tr, Ti)
{
  if (n == steps) // converged?
    return interiorColor

  let v = 255 * smoothColor(steps, n, Tr, Ti) / steps
  v = Math.floor(2 * v)
  if (v > 255) 
    v = 255
  return [v, v, v]
}

// do something strange in the interior of the fractal
function pickColorGrayscale2(steps, n, Tr, Ti)
{
  if (n == steps)  // converged?
  {
    let c = 255 - Math.floor(255.0*Math.sqrt(Tr+Ti)) % 255
    if (c < 0) c = 0
    if (c > 255) c = 255
    return [c, c, c, 255]
  }
  return pickColorGrayscale(steps, n, Tr, Ti)
}

function main()
{
  // decrease interations
  document.getElementById('dec_iterations').onclick = function(event)
  {
    let steps = parseInt(document.getElementById('steps').value, 10)
    steps = Math.max(1, Math.floor( steps / 2 ))
    document.getElementById('steps').value = steps
    draw()
  }

  // increase interations
  document.getElementById('inc_iterations').onclick = function(event)
  {
    let steps = parseInt(document.getElementById('steps').value, 10)
    steps = Math.floor( steps * 2 )
    document.getElementById('steps').value = steps
    draw()
  }

  document.getElementById('dec_zoom').onclick = function(event)
  {
    zoom *= 2
    document.getElementById('zoom').value = 4 / zoom
    draw()
  }

  document.getElementById('inc_zoom').onclick = function(event)
  {
    zoom /= 2
    document.getElementById('zoom').value = 4 / zoom
    draw()
  }

  /*
   * Reset the canvas
   */
  document.getElementById('resetButton').onclick = function(event)
  {
    document.getElementById('settingsForm').reset()
    zoom = zoomStart
    lookAt = lookAtDefault
    reInitCanvas = true
    draw()
  }

  /*
   * Zoom around a point
   */
  document.getElementById('canvasMandelbrot').onclick = function(event)
  {
    const rect = event.target.getBoundingClientRect()
    let x = event.clientX - rect.left // x position within the element
    let y = event.clientY - rect.top  // y position within the element
    const dx = (xRange[1] - xRange[0]) / (0.5 + (canvas.width -1))
    const dy = (yRange[1] - yRange[0]) / (0.5 + (canvas.height-1))
    x = xRange[0] + x*dx
    y = yRange[0] + y*dy
    lookAt = [x, y]
    if (event.shiftKey) {
      zoom /= 0.5
    } else {
      zoom *= 0.5
    }
    document.getElementById('zoom').value = 4 / zoom

    draw()
  }

  /*
   * When resizing the window, be sure to update all the canvas stuff.
   */
  window.onresize = function(event)
  {
    reInitCanvas = true
    draw()
  }

  draw()
}

main()