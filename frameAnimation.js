const svg="http://www.w3.org/2000/svg";
const xlink="http://www.w3.org/1999/xlink";
const durationMotion = 2;
const durationStill = 2;

var frames;
var captions;
var frameCounter;
var cameraFrame;
var camera;
var viewBox;

var menuScreenId = 'menu';
var animId = 'cameraMotion';

function createViewBoxFromRect(rect) {
  // create viewBox string from rectangle (SVGRect)
  var newViewBox = rect.getAttribute('x');
  newViewBox = newViewBox + ' ' + rect.getAttribute('y');
  newViewBox = newViewBox + ' ' + rect.getAttribute('width');
  newViewBox = newViewBox + ' ' + rect.getAttribute('height');

  return newViewBox;
}

function createAnimIdFromFrame(frame) {
  return animId + '-' + frame.id;
}

function addViewBoxAnimation(viewBox, seq, begin) {

  // create animate element
  var cameraMotion = document.createElementNS(svg, 'animate');
  cameraMotion.setAttribute('id', createAnimIdFromFrame(frames[seq]));
  cameraMotion.setAttribute('to', viewBox);
  cameraMotion.setAttribute('begin', begin);
  cameraMotion.setAttribute('dur', durationMotion + 's');

  cameraMotion.setAttribute('attributeName', 'viewBox')
  cameraMotion.setAttribute('fill', 'freeze');
  cameraMotion.setAttribute('keySplines', '0.25 0 0.5 1');
  cameraMotion.setAttribute('keyTimes', '0; 1');
  cameraMotion.setAttribute('calcMode','spline');

  // add animate element to camera
  camera.appendChild(cameraMotion);
}

function setVisibility(seq, useAnimation) {
  var animationId = createAnimIdFromFrame(frames[seq]);

  setVisibilityFigure(seq, animationId, useAnimation);
  if (typeof captions[seq] !== 'undefined') {
    setVisibilityCaption(captions[seq], animationId);
  }

}

function setVisibilityFigure(seq, animationId, useAnimation) {
  // =======================
  // Visibility for figures
  //
  // hide all figures
  var setVisibility;
  frames[seq].parentElement.setAttribute('opacity', '0');

  if (useAnimation) {
    // create animate element
    setVisibility = document.createElementNS(svg, 'animate');
    setVisibility.setAttribute('dur', '2s');
  } else {
    // create set element
    setVisibility = document.createElementNS(svg, 'set');
  }
  setVisibility.setAttribute('id', animationId + '-visible');
  setVisibility.setAttribute('attributeName', 'opacity')
  setVisibility.setAttribute('to', '1');
  setVisibility.setAttribute('fill', 'freeze');
  setVisibility.setAttribute('begin', animationId + '.begin+0s');

  frames[seq].parentElement.appendChild(setVisibility.cloneNode(true));
}

function setVisibilityCaption(caption, animationId) {
  // =======================
  // Visibility for captions
  var delayStart = durationMotion - 0.5;
  var delayTspan = 0.5;
  var tspans = caption.getElementsByTagName('tspan');
  var tspanAnimIn;
  var tspanAnimOut;

  var setVisibility = document.createElementNS(svg, 'animate');
  setVisibility.setAttribute('attributeName', 'opacity');
  setVisibility.setAttribute('dur', '1s');
  setVisibility.setAttribute('fill', 'freeze');

  for (var i = 0; i < tspans.length; i++) {
    tspanAnimIn = animationId + '-captionIn' + i;
    setVisibility.setAttribute('to', '1');
    setVisibility.setAttribute('id', tspanAnimIn);
    setVisibility.setAttribute('begin', animationId + '.begin+' + (delayStart + delayTspan * i) + 's');
    tspans[i].appendChild(setVisibility.cloneNode(true));

    tspanAnimOut = animationId + '-captionOut' + i;
    setVisibility.setAttribute('to', '0');
    setVisibility.setAttribute('id', tspanAnimOut);
    setVisibility.setAttribute('begin', tspanAnimIn + '.end+' + delayTspan + 's');

    tspans[i].appendChild(setVisibility.cloneNode(true));

  }

}

function initGlobalVariables() {
  // get all frames in the SVG
  frames = document.getElementsByClassName('frame');
  camera = document.getElementById('camera');
  captions = camera.getElementsByClassName('caption');
}

function initAnimation() {
  var newViewBox;
  var beginViewBoxAnim;
  var endViewBoxAnim;
  var cameraMotion;

  for (var i = 0; i < frames.length; i++) {
    cameraFrame = frames[i];
    newViewBox = createViewBoxFromRect(cameraFrame);

    if (i == 0) {
      setVisibility(i, true)
      beginViewBoxAnim = 'menuOut.end+1s';
    } else {
      setVisibility(i, false)
      if (captions[i-1] !== undefined) {
        // get last animation child of last tspan of caption
        var finalCaption = captions[i-1].lastElementChild.lastElementChild;
        beginViewBoxAnim = finalCaption.id + '.end+' + durationStill + 's'
      } else {
        beginViewBoxAnim = createAnimIdFromFrame(frames[(i-1)]) + '.end'
        beginViewBoxAnim = beginViewBoxAnim + '+' + durationStill + 's';
      }
    }

    //add animate element to move to next frame new viewBox
    addViewBoxAnimation(newViewBox, i, beginViewBoxAnim);

  }
}

function groupCaptions() {
  var captionsGroup = document.getElementById('captions');
  var totalCaptions = captions.length;

  for (var i = 0; i < totalCaptions; i++) {
    captionsGroup.appendChild(captions[0]);

  }
}

function cleanupGiftCaptions() {
  // cleanup gift frame captions for finale
  var frame = document.getElementById('frame-gift');
  var caption = document.getElementById('caption-gift');

  var anim;
  var animBegin;

  // clear giftLine1 after familyLine2 appears
  anim = document.getElementById('giftLine1').lastElementChild;
  animBegin = document.getElementById('familyLine2').firstElementChild.id;
  animBegin = animBegin + '.end+0s';
  anim.setAttribute('begin', animBegin);

  // clear giftLine2 after giftLine3 would appear (normal)

  // keep giftLine3 until the end (no out animation)
  anim = document.getElementById('giftLine3').lastElementChild;
  document.getElementById('giftLine3').removeChild(anim);

}

function cleanupFamilyCaptions() {
  // cleanup family frame captions for finale
  // cleanup gift frame captions for finale
  var frame = document.getElementById('frame-family');
  var caption = document.getElementById('caption-family');

  var anim;
  var animBegin;

  // move to family frame after giftLine2 clears
  anim = document.getElementById(createAnimIdFromFrame(frame));
  animBegin = document.getElementById('giftLine2').firstElementChild.id;
  animBegin = animBegin + '.end+' + durationStill + 's'
  anim.setAttribute('begin', animBegin);

  // clear familyLine2 after beLine3 would appear
  anim = document.getElementById('familyLine2').lastElementChild;
  animBegin = document.getElementById('familyLine3').firstElementChild.id;
  animBegin = animBegin + '.end+0s';
  anim.setAttribute('begin', animBegin);

  // display familyLine4 after familyLine3 ends
  anim = document.getElementById('familyLine4').firstElementChild;
  animBegin = document.getElementById('familyLine3').lastElementChild.id;
  animBegin = animBegin + '.end+' + (durationStill * 2) + 's';
  anim.setAttribute('begin', animBegin);

  // keep familyLine4 until the end (no out animation)
  anim = document.getElementById('familyLine4').lastElementChild;
  document.getElementById('familyLine4').removeChild(anim);

}

function initMenuInOut() {
  var menu = document.getElementById('menu');

  var anim = document.createElementNS(svg, 'animate');
  anim.setAttribute('attributeName', 'opacity');
  anim.setAttribute('from', '1');
  anim.setAttribute('to', '0');
  anim.setAttribute('begin', 'buttonPlay.click');
  anim.setAttribute('dur','1s');
  anim.setAttribute('id', 'menuOut');
  anim.setAttribute('fill', 'freeze');

  menu.appendChild(anim);


}

document.addEventListener('DOMContentLoaded', function() {
  initGlobalVariables();
  initAnimation();
  groupCaptions();
  cleanupGiftCaptions();
  cleanupFamilyCaptions();
  initMenuInOut();
});
