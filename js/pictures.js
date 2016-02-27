'use strict';

var Gallery = require('./gallery');
var Photo = require('./photo');
var store = require('./pictureStore');

var picturesContainer = document.querySelector('.pictures');
var currentPage = 0;
/**
 * количество картинок, отрисовываемых за раз на странице
 * @type {Number}
 */
var PAGE_SIZE = 12;
var gallery = new Gallery();
var filters = document.querySelector('.filters');
filters.classList.add('hidden');


/**
 * загружает картинки, соответствующие текущему выбранному фильтру
 */
[].forEach.call(filters, function(element) {
  element.onclick = function(evt) {
    var clickedElement = evt.target;
    if (clickedElement.classList.contains('filters-radio')) {
      store.setFilter(clickedElement.id);
      currentPage = 0;
      renderPictures(currentPage, true);
    }
  };
});


/**
 * проверяет, виден ли конец страницы на экране
 * @return {boolean}
 */
function endVisible() {
  var lastPictureOffset = document.querySelector('.pictures').lastChild.getBoundingClientRect();
  var viewPortSize = window.innerHeight;
  if (lastPictureOffset.top <= viewPortSize) {
    if (currentPage < Math.ceil(store.getLength() / PAGE_SIZE)) {
      return true;
    }
  }
  return false;
}

var scrollTimeout;

/**
 * загружает еще PAGE_SIZE картинок, если достигнут конец страницы
 */
window.addEventListener('scroll', function() {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(function() {
    if (endVisible()) {
      renderPictures(++currentPage);
    }
  }, 100);
});


/**
* Отрисовывает картинки на странице
* @param  {number} pageNumber - номер "страницы", т.е. пачки картинок, подгружаемых при достижени конца страницы
* @param  {boolean=} replace - если true, то перед отрисовкой картинок очищает ранее загруженные картинки, используется при переключении фильтров
*/
function renderPictures(pageNumber, replace) {
  if (replace) {
    var picturesLength = picturesContainer.childNodes.length;
    for (var i = 0; i < picturesLength; i++) {
      picturesContainer.removeChild(picturesContainer.childNodes[0]);
    }
  }

  var fragment = document.createDocumentFragment();

  var picturesArr = store.getList();
  var begin = pageNumber * PAGE_SIZE;
  var to = begin + PAGE_SIZE;
  var pagePictures = picturesArr.slice(begin, to);
  var pictureNumber = PAGE_SIZE * pageNumber;

  pagePictures.forEach(function(element) {
    var pictureElement = new Photo(element);
    pictureElement.render();
    pictureElement.number = pictureNumber++;
    fragment.appendChild(pictureElement.element);
    pictureElement.onClick = function() {
      gallery.setCurrentPicture(pictureElement.number);
      gallery.show();
    };
  });
  picturesContainer.appendChild(fragment);
/* подгружает новые картинки до тех пор, пока виден конец страницы */
  while (endVisible()) {
    renderPictures(++currentPage);
  }
}


/**
* Загружает картинки по заданному url. Информация должна быть в формате JSON
* @param  {string} url - путь загрузки информации
*/
function getPictures(url) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.onload = function(evt) {
    picturesContainer.classList.remove('pictures-loading');

    try {
      var data = JSON.parse(evt.target.response);
      store.setList(data);
      store.setFilter();
      renderPictures(0);
    } catch (e) {
      //обработка ошибки
      console.log('ошибка обработки данных!');
    }

  };

  xhr.onloadstart = function() {
    picturesContainer.classList.add('pictures-loading');
  };

  xhr.onerror = function() {
    picturesContainer.classList.add('pictures-failure');
  };

  xhr.send();
}

getPictures('https://o0.github.io/assets/json/pictures.json');

filters.classList.remove('hidden');
