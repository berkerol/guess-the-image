/* global images Image createTextInput createButtonGroup createDatalist deleteOptionFromDatalist createElement createRow createModalButton createModal keyDownHandler keyUpHandler */
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const containerElements = document.getElementsByClassName('container');

const fillStyle = '#ddd';
const strokeStyle = '#000';

const defaultRows = 10;
const defaultCols = 15;
const defaultLimit = 20;
const defaultDel = true;
let rows;
let cols;
let limit;
let del;

let image;
let imageName;
let imageIndex;
let scaledWidth;
let scaledHeight;
let startX;
let startY;
let remaining;

window.locked = true;

const panels = [];

const modalElements = [[['Rows', 'rows', 3, 99, 'number'], ['Columns', 'cols', 3, 99, 'number']], [['Limit', 'limit', 0, 9999, 'number'], ['<u>D</u>elete photo after round', 'del', 'd', 'check']]];
const headerElements = ['h5', 'Remaining: <span id="remaining"></span>', 'my-auto'];
const buttonElements = [['success', 'if(!locked)window.guess()', 'g', 'search', '<u>G</u>uess'], ['primary', 'if(!locked)random()', 'r', 'random', '<u>R</u>andom'], ['danger', 'if(!locked)giveUp()', 'u', 'times', 'Give <u>U</u>p'], ['info', 'restart()', 'e', 'sync', 'R<u>e</u>start'], ['info', '', 's', 'cog', '<u>S</u>ettings']];
const header = createRow('d-flex justify-content-center', [createElement(...headerElements), createButtonGroup('btn-group', buttonElements)]);
const buttonGroup = header.children[1];
createModalButton(buttonGroup, 4);
const textInputDiv = document.createElement('div');
textInputDiv.className = 'my-auto ms-4 me-4';
textInputDiv.appendChild(createTextInput('guess'));
header.insertBefore(textInputDiv, buttonGroup);
document.getElementsByClassName('container')[0].appendChild(header);
createModal(modalElements);
const imageNames = [];
for (const image of images) {
  imageNames.push(image.substring(7, image.length - 4));
}
document.getElementsByClassName('container')[0].appendChild(createDatalist('guess', 'guessDatalist', imageNames));
resetInputs();
restart();
resizeHandler();
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);
document.addEventListener('mousedown', mouseDownHandler);
window.addEventListener('resize', resizeHandler);

function resetInputs () {
  rows = defaultRows;
  cols = defaultCols;
  limit = defaultLimit;
  del = defaultDel;
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

window.guess = function () {
  const input = document.getElementById('guess');
  const guess = input.value.toLowerCase();
  input.value = '';
  if (guess === imageName.toLowerCase()) {
    end('Congratulations, your guess is correct.');
  } else {
    window.alert('Your guess is not correct, try again.');
  }
};

window.random = function () {
  open(Math.floor(Math.random() * panels.length));
};

window.giveUp = function () {
  end(`The image was ${imageName}.`);
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
  window.locked = false;
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
    end(`You reached the limit, the image was ${imageName}.`);
  } else if (panels.length === 0) {
    end(`Everything is visible, the image was ${imageName}.`);
  } else {
    draw();
  }
}

function end (message) {
  panels.length = 0;
  draw();
  if (del) {
    images.splice(imageIndex, 1);
    deleteOptionFromDatalist('guessDatalist', imageName);
  }
  window.locked = true;
  window.alert(message + '\nRestart the game!');
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
  canvas.height = window.innerHeight - (containerElements.length === 0 ? 0 : containerElements[0].clientHeight);
  updatePanels();
}
