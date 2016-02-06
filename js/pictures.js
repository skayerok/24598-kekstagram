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

filters.addEventListener('click', function(evt) {
  var clickedElement = evt.target;
  if (clickedElement.classList.contains('filters-radio')) {
    setActiveFilter(clickedElement.id);
  }
});

var loadedPictures;
var filteredPictures;

function setActiveFilter(id) {
  filteredPictures = loadedPictures.slice(0);

  if (id === loadedPictures) {
    return;
  }

  switch (id) {
    case 'filter-popular':
      currentPage = 0;
      break;

    case 'filter-new':
      filteredPictures = filteredPictures.filter(function(element) {
        var twoWeeksAgo = new Date(new Date() - 14 * 24 * 60 * 60 * 1000);
        return Date.parse(element.date) > twoWeeksAgo;
      }).sort(function(a, b) {
        return Date.parse(b.date) - Date.parse(a.date);
      });
      currentPage = 0;
      break;

    case 'filter-discussed':
      filteredPictures.sort(function(a, b) {
        return a.comments - b.comments;
      });
      currentPage = 0;
      break;
  }

  renderPictures(filteredPictures, currentPage, true);
  isPicturesVisible();
}

var currentPage = 0;
var PAGE_SIZE = 12;

var scrollTimeout;

function isPicturesVisible() {
  var lastPictureOffset = document.querySelector('.pictures').lastChild.getBoundingClientRect();
  var viewPortSize = window.innerHeight;
  if (lastPictureOffset.top <= viewPortSize) {
    if (currentPage < Math.ceil(filteredPictures.length / PAGE_SIZE)) {
      renderPictures(filteredPictures, ++currentPage);
    }
  }
}

window.addEventListener('scroll', function() {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(isPicturesVisible, 100);
});

function renderPictures(pictures, pageNumber, replace) {
  if (replace) {
    picturesContainer.innerHTML = '';
  }
  var fragment = document.createDocumentFragment();

  var from = pageNumber * PAGE_SIZE;
  var to = from + PAGE_SIZE;
  var picturesToDisplay = pictures.slice(from, to);

  picturesToDisplay.forEach(function(element) {
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
    loadedPictures = JSON.parse(rawData);
    filteredPictures = loadedPictures;

    renderPictures(loadedPictures, currentPage);
    isPicturesVisible();
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
