/* global docCookies: true */

/**
 * @fileoverview
 * @author Igor Alexeenko (o0)
 */

'use strict';

module.exports = function() {
  /** @enum {string} */
  var FileType = {
    'GIF': '',
    'JPEG': '',
    'PNG': '',
    'SVG+XML': ''
  };

  /** @enum {number} */
  var Action = {
    ERROR: 0,
    UPLOADING: 1,
    CUSTOM: 2
  };

  /**
   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
   * из ключей FileType.
   * @type {RegExp}
   */
  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

  /**
   * @type {Object.<string, string>}
   */
  var filterMap;

  /**
   * Объект, который занимается кадрированием изображения.
   * @type {Resizer}
   */
  var currentResizer;

  /**
   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
   * изображением.
   */
  function cleanupResizer() {
    if (currentResizer) {
      currentResizer.remove();
      currentResizer = null;
    }
  }

  /**
   * Ставит одну из трех случайных картинок на фон формы загрузки.
   */
  function updateBackground() {
    var images = [
      'img/logo-background-1.jpg',
      'img/logo-background-2.jpg',
      'img/logo-background-3.jpg'
    ];

    var backgroundElement = document.querySelector('.upload');
    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
  }

  var resizeControls = document.querySelector('.upload-resize-controls').elements;

  /**
   * Проверяет, валидны ли данные, в форме кадрирования.
   * @return {boolean}
   */
  function resizeFormIsValid() {
    var resizeXValue = +resizeX.value;
    var resizeYValue = +resizeY.value;
    var valid = true;

    resizeX.min = 0;
    resizeY.min = 0;
    resizeX.max = currentResizer._image.naturalWidth - resizeXValue;
    resizeY.max = currentResizer._image.naturalHeight - resizeYValue;
    resizeSize.max = (currentResizer._image.naturalWidth - resizeXValue) < (currentResizer._image.naturalHeight - resizeYValue)
    ? (currentResizer._image.naturalWidth - resizeXValue)
    : (currentResizer._image.naturalHeight - resizeYValue);

    [].forEach.call(resizeControls, function(element) {
      if (!element.validity.valid) {
        valid = false;
        return;
      }
    });

    forwardButton.disabled = !valid;
    return valid;
  }

  /**
   * Форма загрузки изображения.
   * @type {HTMLFormElement}
   */
  var uploadForm = document.forms['upload-select-image'];


  /**
   * Форма кадрирования изображения.
   * @type {HTMLFormElement}
   */
  var resizeForm = document.forms['upload-resize'];
  var resizeX = resizeForm['resize-x'];
  var resizeY = resizeForm['resize-y'];
  var resizeSize = resizeForm['resize-size'];
  var forwardButton = resizeForm['resize-fwd'];

  /**
  * Подставляет значения смещения в форму кадрирования изображения
  * @param  {Number}
  * @param  {Number}
  * @param  {Number}
  */
  function resizeFormSetInput() {
    var picturePosition = currentResizer.getConstraint();
    resizeX.value = picturePosition.x;
    resizeY.value = picturePosition.y;
    resizeSize.value = picturePosition.side;
  }

  [].forEach.call(resizeControls, function(element) {
    element.addEventListener('change', resizeFormIsValid);
    element.addEventListener('input', function() {
      currentResizer.setConstraint(+resizeX.value, +resizeY.value, +resizeSize.value);
    });
  });

  /**
   * Обработчик события смещения кадра.
   * При перемещении изображения, подставляет значения смещения в поля ввода.
   * @type {event}
   */
  window.addEventListener('resizerchange', function() {
    resizeFormSetInput();
  });

  /**
   * Форма добавления фильтра.
   * @type {HTMLFormElement}
   */
  var filterForm = document.forms['upload-filter'];
  var filters = document.querySelector('.upload-filter-controls').elements;


  /**
   * @type {HTMLImageElement}
   */
  var filterImage = filterForm.querySelector('.filter-image-preview');

  /**
   * @type {HTMLElement}
   */
  var uploadMessage = document.querySelector('.upload-message');

  /**
   * @param {Action} action
   * @param {string=} message
   * @return {Element}
   */
  function showMessage(action, message) {
    var isError = false;

    switch (action) {
      case Action.UPLOADING:
        message = message || 'Кексограмим&hellip;';
        break;

      case Action.ERROR:
        isError = true;
        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
        break;
    }

    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
    uploadMessage.classList.remove('invisible');
    uploadMessage.classList.toggle('upload-message-error', isError);
    return uploadMessage;
  }

  function hideMessage() {
    uploadMessage.classList.add('invisible');
  }

  /**
   * Обработчик изменения изображения в форме загрузки. Если загруженный
   * файл является изображением, считывается исходник картинки, создается
   * Resizer с загруженной картинкой, добавляется в форму кадрирования
   * и показывается форма кадрирования.
   * @param {Event} evt
   */
  function uploadPictureHandler(evt) {
    var element = evt.target;
    if (element.id === 'upload-file') {
      // Проверка типа загружаемого файла, тип должен быть изображением
      // одного из форматов: JPEG, PNG, GIF или SVG.
      if (fileRegExp.test(element.files[0].type)) {
        var fileReader = new FileReader();

        showMessage(Action.UPLOADING);

        fileReader.onload = function() {
          cleanupResizer();

          var Resizer = require('./resizer');
          currentResizer = new Resizer(fileReader.result);
          currentResizer.setElement(resizeForm);
          uploadMessage.classList.add('invisible');

          uploadForm.classList.add('invisible');
          resizeForm.classList.remove('invisible');

          hideMessage();
        };

        fileReader.readAsDataURL(element.files[0]);
      } else {
        // Показ сообщения об ошибке, если загружаемый файл, не является
        // поддерживаемым изображением.
        showMessage(Action.ERROR);
      }
    }
  }

  uploadForm.addEventListener('change', uploadPictureHandler);

  /**
   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
   * и обновляет фон.
   * @param {Event} evt
   */
  resizeForm.addEventListener('reset', function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });

  /**
   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
   * кропнутое изображение в форму добавления фильтра и показывает ее.
   * @param {Event} evt
   */
  resizeForm.addEventListener('submit', function(evt) {
    evt.preventDefault();

    if (resizeFormIsValid()) {
      filterImage.src = currentResizer.exportImage().src;

      resizeForm.classList.add('invisible');
      filterForm.classList.remove('invisible');
    }
  });

  /**
   * Автоматический выбор фильтра, выбранного в последний раз. Значение берется из cookie
   */
  function selectFilter() {
    var selectedFilter = docCookies.getItem('selectedFilter');
    for (var i = 0; i < filters.length; i++) {
      if (selectedFilter === filters[i].value) {
        filters[i].checked = true;
        var filterClass = 'filter-' + selectedFilter;
        filterImage.className = 'filter-image-preview ' + filterClass;
        break;
      }
    }
  }

  forwardButton.addEventListener('click', function() {
    selectFilter();
  });

  /**
   * Сброс формы фильтра. Показывает форму кадрирования.
   * @param {Event} evt
   */
  filterForm.addEventListener('reset', function(evt) {
    evt.preventDefault();

    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  });

  /**
  * Сохраняет выбранный фильтр в cookie со сроком жизни, равным времени, прошедшему с моего ДР
  */
  function saveCookie() {
    var today = new Date();

    var fromBirthday = today - (new Date(today.getFullYear(), 10, 7)) > 0
    ? today - (new Date(today.getFullYear(), 10, 7))
    : today - (new Date(today.getFullYear() - 1, 10, 7));

    var daysFromBirthday = fromBirthday / 24 / 60 / 60 / 1000;
    var expires = today.setDate(today.getDate() + daysFromBirthday);

    var checkedFilter = [].filter.call(filters, function(element) {
      return element.checked;
    })[0];

    docCookies.setItem('selectedFilter', checkedFilter.value, new Date(expires));
  }

  /**
   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
   * записав сохраненный фильтр в cookie.
   * @param {Event} evt
   */
  filterForm.addEventListener('submit', function(evt) {
    evt.preventDefault();

    saveCookie();
    cleanupResizer();
    updateBackground();

    filterForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });

  /**
   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
   * выбранному значению в форме.
   */
  filterForm.addEventListener('change', function() {
    if (!filterMap) {
      // Ленивая инициализация. Объект не создается до тех пор, пока
      // не понадобится прочитать его в первый раз, а после этого запоминается
      // навсегда.
      filterMap = {
        'none': 'filter-none',
        'chrome': 'filter-chrome',
        'sepia': 'filter-sepia'
      };
    }

    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
      return item.checked;
    })[0].value;

    // Класс перезаписывается, а не обновляется через classList потому что нужно
    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
    // состояние или просто перезаписывать.
    filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];
  });

  cleanupResizer();
  updateBackground();
};
