/*eslint strict: [2, "function"]*/
(function() {
  'use strict';

  var picturesContainer = document.querySelector('.pictures');
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
    var _list = [];

    function getList() {
      return _list;
    }

    function setList(newItems) {
      _list = _list.concat(newItems);
    }

    return {
      getList: getList,
      setList: setList
    };
  }

/**
 * Получает шаблон со страницы и заполняет его полученными данными
 * @param  {object} data - объект с информацией о картинке
 * @return {object} - DOM-элемент, заполненный шаблон
 */
  function getElementFromTemplate(data) {
    var pictureTemplate = document.querySelector('#picture-template');

    var timer;

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
      clearTimeout(timer);
      element.replaceChild(newPicture, oldPicture);
    };

    newPicture.onerror = function() {
      element.classList.add('picture-load-failure');
    };

    newPicture.src = data.url;

    timer = setTimeout(function() {
      newPicture.src = '';
      element.classList.add('picture-load-failure');
    }, 5000);

    return element;
  }


  [].forEach.call(filters, function(element) {
    element.onclick = function(evt) {
      var clickedElementId = evt.target.id;
      setActiveFilter(clickedElementId);
    };
  });

  var loadedPictures;

/**
 * Отображает изображения на странице в соответствии с выбранным фильтром
 * @param {string} id - id выбранного элемента
 */
  function setActiveFilter(id) {

    // копируем исходный массив, потому что иначе получается, что 2 переменных ссылаются на один и тот же массив,
    // и при сортировке одного массива, сортируется и исходный, и последовательное переключение по нескольким
    // фильтрам идет некорректно
    loadedPictures = store.getList().slice(0);

    switch (id) {

      case 'filter-new':
        loadedPictures = loadedPictures.filter(function(element) {
          var twoWeeksAgo = new Date(new Date() - 14 * 24 * 60 * 60 * 1000);
          return Date.parse(element.date) > twoWeeksAgo;
        }).sort(function(a, b) {
          return Date.parse(b.date) - Date.parse(a.date);
        });
        break;

      case 'filter-discussed':
        loadedPictures.sort(function(a, b) {
          return b.comments - a.comments;
        });
        break;
    }
    currentPage = 0;
    renderPictures(loadedPictures, currentPage, true);
    bottomReached();
  }


  var currentPage = 0;
  var PAGE_SIZE = 12;

/**
 * Если виден конец страницы, то подгружает дополнительные изображения на нее, если они есть
 */
  function bottomReached() {
    var lastPictureOffset = document.querySelector('.pictures').lastChild.getBoundingClientRect();
    var viewPortSize = window.innerHeight;
    if (lastPictureOffset.top <= viewPortSize) {
      if (currentPage < Math.ceil(loadedPictures.length / PAGE_SIZE)) {
        renderPictures(loadedPictures, ++currentPage);
      }
    }
  }

  var scrollTimeout;

  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(bottomReached, 100);
  });

/**
 * Отрисовывает картинки на странице
 * @param  {object.<Array>} pictures - массив с картинками и информацией о них
 * @param  {number} pageNumber - номер "страницы"
 * @param  {boolean} replace - если true, то перед отрисовкой картинок очищает ранее загруженные картинки
 */
  function renderPictures(pictures, pageNumber, replace) {
    if (replace) {
      picturesContainer.innerHTML = '';
    }

    var fragment = document.createDocumentFragment();

    var from = pageNumber * PAGE_SIZE;
    var to = from + PAGE_SIZE;
    var pagePictures = pictures.slice(from, to);

    pagePictures.forEach(function(element) {
      var loadedPicture = getElementFromTemplate(element);
      fragment.appendChild(loadedPicture);
    });
    picturesContainer.appendChild(fragment);
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
        renderPictures(data, 0);
        loadedPictures = data;
        bottomReached();
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

  getPictures('http://o0.github.io/assets/json/pictures.json');

  filters.classList.remove('hidden');
})();