/*eslint strict: [2, "function"]*/
(function() {
  'use strict';

  var picturesContainer = document.querySelector('.pictures');
  var filters = document.querySelector('.filters');
  filters.classList.add('hidden');


/**
 * Записывает массив с информацией о картинках в свою локальную переменную list при помощи метода
 * setList, и отдает сохраненный массив при попощи метода getList
 * @type {object} PictureStore - массив элементов в формате JSON с информацией о картинках
 * @return {object}  этот же массив
 */
  var store = new PictureStore();

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


  function setActiveFilter(id) {

    // копируем исходный массив, потому что иначе получается, что 2 переменных ссылаются на один и тот же массив,
    // и при сортировке одного массива, сортируется и исходный, и последовательное переключение по нескольким
    // фильтрам идет некорректно

    var filteredPictures = store.getList().slice(0);

    switch (id) {

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
          return b.comments - a.comments;
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

  function getPictures(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = function(evt) {
      picturesContainer.classList.remove('pictures-loading');

      try {
        var data = JSON.parse(evt.target.response);
        store.setList(data);
        renderPictures(data);
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
