'use strict';

var filters = document.querySelector('.filters');
filters.classList.add('hidden');

var picturesContainer = document.querySelector('.pictures');

function getElementFromTemplate(data) {
  var pictureTemplate = document.querySelector('#picture-template');

  var element = null;
  if ('content' in pictureTemplate) {
    element = pictureTemplate.content.childNodes[1].cloneNode(true);
  } else {
    element = pictureTemplate.childNodes[1].cloneNode(true);
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

function updateLoadedPictures(loadedPictures) {
  for (var i = 0; i < filters.length; i++) {
    filters[i].onclick = function(evt) {
      var clickedElementId = evt.target.id;
      setActiveFilter(clickedElementId, loadedPictures);
    };
  }
}

function setActiveFilter(id, loadedPictures) {
  var filteredPictures = loadedPictures.slice(0);

  if (id === loadedPictures) {
    return;
  }

  switch (id) {
    case 'filter-popular':
      break;

    case 'filter-new':
      filteredPictures = filteredPictures.filter(function(element) {
        var twoWeeksAgo = new Date(new Date() - 14 * 24 * 60 * 60 * 1000);
        return Date.parse(element.date) > twoWeeksAgo;
      }).sort(function(a, b) {
        return Date.parse(b.date) - Date.parse(a.date);
      });
      break;

    case 'filter-discussed':
      filteredPictures.sort(function(a, b) {
        return a.comments - b.comments;
      });
      break;
  }

  renderPictures(filteredPictures);
}

function renderPictures(pictures) {
  picturesContainer.innerHTML = '';
  var fragment = document.createDocumentFragment();

  pictures.forEach(function(element) {
    var loadedPicture = getElementFromTemplate(element);
    fragment.appendChild(loadedPicture);
  });
  picturesContainer.appendChild(fragment);
}

function getPictures() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'http://o0.github.io/assets/json/pictures.json');
  xhr.onload = function(evt) {
    picturesContainer.classList.remove('pictures-loading');
    var rawData = evt.target.response;
    var loadedPictures = JSON.parse(rawData);

    renderPictures(loadedPictures);

    updateLoadedPictures(loadedPictures);
  };

  xhr.onloadstart = function() {
    picturesContainer.classList.add('pictures-loading');
  };

  xhr.onerror = function() {
    picturesContainer.classList.add('pictures-failure');
  };

  xhr.send();
}

getPictures();

filters.classList.remove('hidden');
