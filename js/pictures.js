/*eslint strict: [2, "function"]*/
/*global Photo: true, Gallery: true*/
(function() {
  'use strict';

  var picturesContainer = document.querySelector('.pictures');
  // var pictureTemplate = document.querySelector('#picture-template');
  var currentPage = 0;
  var PAGE_SIZE = 12;
  var gallery = new Gallery();
  var filters = document.querySelector('.filters');
  filters.classList.add('hidden');

  var store = new PictureStore();

/**
* Записывает массив с информацией о картинках в свою локальную переменную list при помощи метода
* setList, и отдает сохраненный массив при попощи метода getList
* @type {object} PictureStore - массив элементов в формате JSON с информацией о картинках
* @return {object}  этот же массив
*/
  function PictureStore() {
    var _list = [],
      _filter = [];

    function getList() {
      return [].concat(_filter);
    }

    function setFilter(id) {
      switch (id) {

        case 'filter-new':
          _filter = _list.filter(function(element) {
            var twoWeeksAgo = new Date(new Date() - 14 * 24 * 60 * 60 * 1000);
            return Date.parse(element.date) > twoWeeksAgo;
          }).sort(function(a, b) {
            return Date.parse(b.date) - Date.parse(a.date);
          });
          break;

        case 'filter-discussed':
          _filter = [].concat(_list).sort(function(a, b) {
            return b.comments - a.comments;
          });
          break;

        default:
          _filter = [].concat(_list);
          break;
      }
    }

    function setList(newItems) {
      _list = _list.concat(newItems);
    }

    function getLength() {
      return _list.length;
    }

    return {
      getList: getList,
      setList: setList,
      getLength: getLength,
      setFilter: setFilter
    };
  }


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


  // [].forEach.call(picturesContainer.childNodes, function(element) {
  //   element.preventDefault();
  //   element.addEventListener('click', gallery.show);
  // });



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

  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function() {
      if (endVisible()) {
        renderPictures(++currentPage);
      }
    }, 100);
  });


  function pictureClickHandler(evt) {
    evt.preventDefault();
    gallery.show();
  }

/**
 * Отрисовывает картинки на странице
 * @param  {object.<Array>} pictures - массив с картинками и информацией о них
 * @param  {number} pageNumber - номер "страницы"
 * @param  {boolean} replace - если true, то перед отрисовкой картинок очищает ранее загруженные картинки
 */
  function renderPictures(pageNumber, replace) {
    if (replace) {
      picturesContainer.innerHTML = '';
      [].forEach.call(picturesContainer.childNodes, function(element) {
        element.removeEventListener('click', pictureClickHandler);
        picturesContainer.removeChild(element);
      });
    }

    var fragment = document.createDocumentFragment();

    var picturesArr = store.getList();
    var begin = pageNumber * PAGE_SIZE;
    var to = begin + PAGE_SIZE;
    var pagePictures = picturesArr.slice(begin, to);

    pagePictures.forEach(function(element) {
      var pictureElement = new Photo(element);
      pictureElement.render();
      pictureElement.element.addEventListener('click', pictureClickHandler);
      fragment.appendChild(pictureElement.element);
    });
    picturesContainer.appendChild(fragment);
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
})();
