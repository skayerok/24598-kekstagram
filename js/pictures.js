'use strict';

var filters = document.querySelector('.filters');
filters.classList.add('hidden');

var picturesContainer = document.querySelector('.pictures');

function getElementFromTemplate(data) {
  var pictureTemplate = document.querySelector('#picture-template');

  var element = null;
  if ('content' in pictureTemplate) {
    element = pictureTemplate.content.children[0].cloneNode(true);
  } else {
    element = pictureTemplate.children[0].cloneNode(true);
  }

  element.querySelector('.picture-comments').textContent = data.comments;
  element.querySelector('.picture-likes').textContent = data.likes;

  var oldPicture = element.querySelector('img');

  var newPicture = new Image(182, 182);

  newPicture.onload = function() {
    element.replaceChild(newPicture, oldPicture);
  };

  newPicture.onerror = function() {
    element.classList.add('picture-load-failure');
  };

  newPicture.src = data.url;

  return element;
}

function getPictures() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'http://o0.github.io/assets/json/pictures.json');
  xhr.onload = function(evt) {
    var rawData = evt.target.response;
    var loadedPicture = JSON.parse(rawData);
  };

  xhr.send();
}

getPictures();


// pictures.forEach(function(element) {
//   var loadedPicture = getElementFromTemplate(element);
//   picturesContainer.appendChild(loadedPicture);
// });

filters.classList.remove('hidden');

