'use strict';

var Gallery = require('./gallery');
var Photo = require('./photo');
var store = require('./pictureStore');

module.exports = function() {

  var picturesContainer = document.querySelector('.pictures');
  /**
   * номер страницы (пачки изображений) по счету, отображаемых на странице
   * @type {Number}
   */
  var currentPage = 0;
  /**
   * количество картинок, отрисовываемых за раз на странице
   * @type {Number}
   */
  var PAGE_SIZE = 12;
  var gallery = new Gallery();
  /**
   * текущий выбранный фильтр
   * @type {String}
   */
  var activeFilter = localStorage.getItem('activeFilter') || 'filter-popular';
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
   * отслеживает изменения хэша страницы в адресной строке
   */
  window.addEventListener('hashchange', checkHash);


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
        location.hash = 'photo/' + pictureElement.getUrl();
      };
    });
    picturesContainer.appendChild(fragment);
  /* подгружает новые картинки до тех пор, пока виден конец страницы */
    while (endVisible()) {
      renderPictures(++currentPage);
    }
  }

  /**
   * проверяет, соответствует ли текущий хэш страницы регулярному выражению, т.е. ссылке на какую-нибудь картинку и
   * загружает эту картинку
   * @return {string} ссылка на картинку
   */
  function checkHash() {
    var hashValid = location.hash.match(/#photo\/(\S+)/);
    if (hashValid) {
      gallery.setCurrentPicture(hashValid[1]);
      gallery.show();
    }
  }

  /**
   * ставит checked у активного фильтра
   * @param  {Strubg} filter id фильтра
   */
  function checkFilter(filter) {
    document.getElementById(filter).checked = true;
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
        store.setFilter(activeFilter);
        checkFilter(activeFilter);
        renderPictures(0);
        checkHash();
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
};
