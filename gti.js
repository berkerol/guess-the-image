/* global images Image */
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const fillStyle = '#ddd';
const strokeStyle = '#000';

const defaultRows = 10;
const defaultCols = 15;
const defaultLimit = 20;
const defaultDel = true;
let rows = defaultRows;
let cols = defaultCols;
let limit = defaultLimit;
let del = defaultDel;

let image;
let imageName;
let imageIndex;
let scaledWidth;
let scaledHeight;
let startX;
let startY;
let remaining;
let locked;

const panels = [];

canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 38;
resetInputs();
restart();
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);
document.addEventListener('mousedown', mouseDownHandler);
window.addEventListener('resize', resizeHandler);

function resetInputs () {
  document.getElementById('rows').value = rows;
  document.getElementById('cols').value = cols;
  document.getElementById('limit').value = limit;
  document.getElementById('del').checked = del;
}

window.save = function () {
  rows = +document.getElementById('rows').value;
  cols = +document.getElementById('cols').value;
  limit = +document.getElementById('limit').value;
  del = document.getElementById('del').checked;
};

function guess () {
  const input = document.getElementById('guess');
  const guess = input.value.toLowerCase();
  input.value = '';
  if (guess === imageName.toLowerCase()) {
    exit('Congratulations, your guess is correct.');
  } else {
    window.alert('Your guess is not correct, try again.');
  }
}

window.random = function () {
  open(Math.floor(Math.random() * panels.length));
};

window.giveUp = function () {
  exit(`The image was ${imageName}.`);
};

function restart () {
  imageIndex = Math.floor(Math.random() * images.length);
  const imageFile = images[imageIndex];
  image = new Image();
  image.onload = function () {
    panels.length = 0;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        panels.push([0, 0, 0, 0, i, j]);
      }
    }
    updatePanels();
  };
  image.src = imageFile;
  imageName = imageFile.substring(7, imageFile.length - 4);
  if (limit === 0) {
    remaining = rows * cols;
  } else {
    remaining = limit;
  }
  document.getElementById('remaining').innerHTML = remaining;
  locked = false;
}

function updatePanels () {
  const widthScale = image.width > canvas.width ? canvas.width / image.width : 1;
  const heightScale = image.height > canvas.height ? canvas.height / image.height : 1;
  const scale = Math.min(widthScale, heightScale);
  scaledWidth = image.width * scale;
  scaledHeight = image.height * scale;
  startX = (canvas.width - scaledWidth) / 2;
  startY = (canvas.height - scaledHeight) / 2;
  const rectWidth = scaledWidth / cols;
  const rectHeight = scaledHeight / rows;
  for (const panel of panels) {
    panel[0] = startX + panel[5] * rectWidth;
    panel[1] = startX + (panel[5] + 1) * rectWidth;
    panel[2] = startY + panel[4] * rectHeight;
    panel[3] = startY + (panel[4] + 1) * rectHeight;
  }
  draw();
}

function draw () {
  ctx.fillStyle = fillStyle;
  ctx.strokeStyle = strokeStyle;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, startX, startY, scaledWidth, scaledHeight);
  for (const panel of panels) {
    ctx.beginPath();
    ctx.moveTo(panel[0], panel[2]);
    ctx.lineTo(panel[1], panel[2]);
    ctx.lineTo(panel[1], panel[3]);
    ctx.lineTo(panel[0], panel[3]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

function open (i) {
  panels.splice(i, 1);
  document.getElementById('remaining').innerHTML = --remaining;
  if (remaining === 0) {
    exit(`You reached the limit, the image was ${imageName}.`);
  } else if (panels.length === 0) {
    exit(`Everything is visible, the image was ${imageName}.`);
  } else {
    draw();
  }
}

function exit (message) {
  panels.length = 0;
  draw();
  if (del) {
    images.splice(imageIndex, 1);
  }
  locked = true;
  window.alert(message + '\nRestart the game!');
}

function keyDownHandler (e) {
  if (e.keyCode === 13 && !locked) {
    e.preventDefault();
    guess();
  }
}

function keyUpHandler (e) {
  if (e.keyCode === 82) {
    rows = defaultRows;
    cols = defaultCols;
    limit = defaultLimit;
    del = defaultDel;
    resetInputs();
  }
}

function mouseDownHandler (e) {
  const x = e.clientX - canvas.offsetLeft;
  const y = e.clientY - canvas.offsetTop;
  for (let i = panels.length - 1; i >= 0; i--) {
    const panel = panels[i];
    if (x >= panel[0] && x <= panel[1] && y >= panel[2] && y <= panel[3]) {
      open(i);
      break;
    }
  }
}

function resizeHandler () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 38;
  updatePanels();
}
