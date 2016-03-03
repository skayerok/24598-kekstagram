/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(1)();
	__webpack_require__(3)();


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

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

	          var Resizer = __webpack_require__(2);
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


/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * @constructor
	 * @param {string} image
	 */
	var Resizer = function(image) {
	  // Изображение, с которым будет вестись работа.
	  this._image = new Image();
	  this._image.src = image;

	  // Холст.
	  this._container = document.createElement('canvas');
	  this._ctx = this._container.getContext('2d');

	  // Создаем холст только после загрузки изображения.
	  this._image.onload = function() {
	    // Размер холста равен размеру загруженного изображения. Это нужно
	    // для удобства работы с координатами.
	    this._container.width = this._image.naturalWidth;
	    this._container.height = this._image.naturalHeight;

	    /**
	     * Предлагаемый размер кадра в виде коэффициента относительно меньшей
	     * стороны изображения.
	     * @const
	     * @type {number}
	     */
	    var INITIAL_SIDE_RATIO = 0.75;
	    // Размер меньшей стороны изображения.
	    var side = Math.min(
	        this._container.width * INITIAL_SIDE_RATIO,
	        this._container.height * INITIAL_SIDE_RATIO);

	    // Изначально предлагаемое кадрирование — часть по центру с размером в 3/4
	    // от размера меньшей стороны.
	    this._resizeConstraint = new Square(
	        this._container.width / 2 - side / 2,
	        this._container.height / 2 - side / 2,
	        side);
	    window.dispatchEvent(new CustomEvent('resizerchange'));

	    // Отрисовка изначального состояния канваса.
	    this.redraw();
	  }.bind(this);

	  // Фиксирование контекста обработчиков.
	  this._onDragStart = this._onDragStart.bind(this);
	  this._onDragEnd = this._onDragEnd.bind(this);
	  this._onDrag = this._onDrag.bind(this);
	};

	Resizer.prototype = {
	  /**
	   * Родительский элемент канваса.
	   * @type {Element}
	   * @private
	   */
	  _element: null,

	  /**
	   * Положение курсора в момент перетаскивания. От положения курсора
	   * рассчитывается смещение на которое нужно переместить изображение
	   * за каждую итерацию перетаскивания.
	   * @type {Coordinate}
	   * @private
	   */
	  _cursorPosition: null,

	  /**
	   * Объект, хранящий итоговое кадрирование: сторона квадрата и смещение
	   * от верхнего левого угла исходного изображения.
	   * @type {Square}
	   * @private
	   */
	  _resizeConstraint: null,

	  /**
	   * Отрисовка канваса.
	   */
	  redraw: function() {
	    // Очистка изображения.
	    this._ctx.clearRect(0, 0, this._container.width, this._container.height);

	    // Параметры линии.
	    // NB! Такие параметры сохраняются на время всего процесса отрисовки
	    // canvas'a поэтому важно вовремя поменять их, если нужно начать отрисовку
	    // чего-либо с другой обводкой.

	    // Толщина линии.
	    this._ctx.lineWidth = 6;
	    // Цвет обводки.
	    this._ctx.strokeStyle = '#ffe753';
	    // Размер штрихов. Первый элемент массива задает длину штриха, второй
	    // расстояние между соседними штрихами.
	    this._ctx.setLineDash([15, 10]);
	    // Смещение первого штриха от начала линии.
	    this._ctx.lineDashOffset = 7;

	    // Сохранение состояния канваса.
	    // Подробней см. строку 132.
	    this._ctx.save();

	    // Установка начальной точки системы координат в центр холста.
	    this._ctx.translate(this._container.width / 2, this._container.height / 2);

	    var displX = -(this._resizeConstraint.x + this._resizeConstraint.side / 2);
	    var displY = -(this._resizeConstraint.y + this._resizeConstraint.side / 2);
	    // Отрисовка изображения на холсте. Параметры задают изображение, которое
	    // нужно отрисовать и координаты его верхнего левого угла.
	    // Координаты задаются от центра холста.
	    this._ctx.drawImage(this._image, displX, displY);

	    // Отрисовка прямоугольника, обозначающего область изображения после
	    // кадрирования. Координаты задаются от центра.
	    this._ctx.strokeRect(
	        (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2,
	        (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2,
	        this._resizeConstraint.side - this._ctx.lineWidth / 2,
	        this._resizeConstraint.side - this._ctx.lineWidth / 2);


	    var maskCanvas = document.createElement('canvas');
	    maskCanvas.width = this._container.width;
	    maskCanvas.height = this._container.height;
	    var maskCtx = maskCanvas.getContext('2d');

	    maskCtx.fillStyle = 'rgba(0, 0, 0, 0.8)';
	    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

	    maskCtx.globalCompositeOperation = 'xor';

	    maskCtx.clearRect(
	        (this._container.width / 2) - (this._resizeConstraint.side / 2) - this._ctx.lineWidth,
	        (this._container.height / 2) - (this._resizeConstraint.side / 2) - this._ctx.lineWidth,
	        this._resizeConstraint.side + this._ctx.lineWidth / 2,
	        this._resizeConstraint.side + this._ctx.lineWidth / 2);
	    maskCtx.fill();

	    this._ctx.drawImage(maskCanvas, -maskCanvas.width / 2, -maskCanvas.height / 2 );

	    this._ctx.font = '16px Arial';
	    this._ctx.fillStyle = 'white';
	    var iamgeResolution = this._image.naturalWidth + 'x' + this._image.naturalHeight;
	    this._ctx.fillText(iamgeResolution,
	    -this._ctx.measureText(iamgeResolution).width / 2,
	    -(this._resizeConstraint.side / 2) - this._ctx.lineWidth - 5);


	    // Восстановление состояния канваса, которое было до вызова ctx.save
	    // и последующего изменения системы координат. Нужно для того, чтобы
	    // следующий кадр рисовался с привычной системой координат, где точка
	    // 0 0 находится в левом верхнем углу холста, в противном случае
	    // некорректно сработает даже очистка холста или нужно будет использовать
	    // сложные рассчеты для координат прямоугольника, который нужно очистить.
	    this._ctx.restore();
	  },

	  /**
	   * Включение режима перемещения. Запоминается текущее положение курсора,
	   * устанавливается флаг, разрешающий перемещение и добавляются обработчики,
	   * позволяющие перерисовывать изображение по мере перетаскивания.
	   * @param {number} x
	   * @param {number} y
	   * @private
	   */
	  _enterDragMode: function(x, y) {
	    this._cursorPosition = new Coordinate(x, y);
	    document.body.addEventListener('mousemove', this._onDrag);
	    document.body.addEventListener('mouseup', this._onDragEnd);
	  },

	  /**
	   * Выключение режима перемещения.
	   * @private
	   */
	  _exitDragMode: function() {
	    this._cursorPosition = null;
	    document.body.removeEventListener('mousemove', this._onDrag);
	    document.body.removeEventListener('mouseup', this._onDragEnd);
	  },

	  /**
	   * Перемещение изображения относительно кадра.
	   * @param {number} x
	   * @param {number} y
	   * @private
	   */
	  updatePosition: function(x, y) {
	    this.moveConstraint(
	        this._cursorPosition.x - x,
	        this._cursorPosition.y - y);
	    this._cursorPosition = new Coordinate(x, y);
	  },

	  /**
	   * @param {MouseEvent} evt
	   * @private
	   */
	  _onDragStart: function(evt) {
	    this._enterDragMode(evt.clientX, evt.clientY);
	  },

	  /**
	   * Обработчик окончания перетаскивания.
	   * @private
	   */
	  _onDragEnd: function() {
	    this._exitDragMode();
	  },

	  /**
	   * Обработчик события перетаскивания.
	   * @param {MouseEvent} evt
	   * @private
	   */
	  _onDrag: function(evt) {
	    this.updatePosition(evt.clientX, evt.clientY);
	  },

	  /**
	   * Добавление элемента в DOM.
	   * @param {Element} element
	   */
	  setElement: function(element) {
	    if (this._element === element) {
	      return;
	    }

	    this._element = element;
	    this._element.insertBefore(this._container, this._element.firstChild);
	    // Обработчики начала и конца перетаскивания.
	    this._container.addEventListener('mousedown', this._onDragStart);
	  },

	  /**
	   * Возвращает кадрирование элемента.
	   * @return {Square}
	   */
	  getConstraint: function() {
	    return this._resizeConstraint;
	  },

	  /**
	   * Смещает кадрирование на значение указанное в параметрах.
	   * @param {number} deltaX
	   * @param {number} deltaY
	   * @param {number} deltaSide
	   */
	  moveConstraint: function(deltaX, deltaY, deltaSide) {
	    this.setConstraint(
	        this._resizeConstraint.x + (deltaX || 0),
	        this._resizeConstraint.y + (deltaY || 0),
	        this._resizeConstraint.side + (deltaSide || 0));
	  },

	  /**
	   * @param {number} x
	   * @param {number} y
	   * @param {number} side
	   */
	  setConstraint: function(x, y, side) {
	    if (typeof x !== 'undefined') {
	      this._resizeConstraint.x = x;
	    }

	    if (typeof y !== 'undefined') {
	      this._resizeConstraint.y = y;
	    }

	    if (typeof side !== 'undefined') {
	      this._resizeConstraint.side = side;
	    }

	    requestAnimationFrame(function() {
	      this.redraw();
	      window.dispatchEvent(new CustomEvent('resizerchange'));
	    }.bind(this));
	  },

	  /**
	   * Удаление. Убирает контейнер из родительского элемента, убирает
	   * все обработчики событий и убирает ссылки.
	   */
	  remove: function() {
	    this._element.removeChild(this._container);

	    this._container.removeEventListener('mousedown', this._onDragStart);
	    this._container = null;
	  },

	  /**
	   * Экспорт обрезанного изображения как HTMLImageElement и исходником
	   * картинки в src в формате dataURL.
	   * @return {Image}
	   */
	  exportImage: function() {
	    // Создаем Image, с размерами, указанными при кадрировании.
	    var imageToExport = new Image();

	    // Создается новый canvas, по размерам совпадающий с кадрированным
	    // изображением, в него добавляется изображение взятое из канваса
	    // с измененными координатами и сохраняется в dataURL, с помощью метода
	    // toDataURL. Полученный исходный код, записывается в src у ранее
	    // созданного изображения.
	    var temporaryCanvas = document.createElement('canvas');
	    var temporaryCtx = temporaryCanvas.getContext('2d');
	    temporaryCanvas.width = this._resizeConstraint.side;
	    temporaryCanvas.height = this._resizeConstraint.side;
	    temporaryCtx.drawImage(this._image,
	        -this._resizeConstraint.x,
	        -this._resizeConstraint.y);
	    imageToExport.src = temporaryCanvas.toDataURL('image/png');

	    return imageToExport;
	  }
	};

	/**
	 * Вспомогательный тип, описывающий квадрат.
	 * @constructor
	 * @param {number} x
	 * @param {number} y
	 * @param {number} side
	 * @private
	 */
	var Square = function(x, y, side) {
	  this.x = x;
	  this.y = y;
	  this.side = side;
	};

	/**
	 * Вспомогательный тип, описывающий координату.
	 * @constructor
	 * @param {number} x
	 * @param {number} y
	 * @private
	 */
	var Coordinate = function(x, y) {
	  this.x = x;
	  this.y = y;
	};

	module.exports = Resizer;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Gallery = __webpack_require__(4);
	var Photo = __webpack_require__(6);
	var store = __webpack_require__(5);

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


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var store = __webpack_require__(5);

	/**
	 * @construct
	 * Конструктор для работы с галереей, отображающейся по клику по изображению
	 */
	function Gallery() {
	  this.element = document.querySelector('.gallery-overlay');

	  this._closeButton = this.element.querySelector('.gallery-overlay-close');
	  this._photo = this.element.querySelector('.gallery-overlay-image');
	  this._likes = this.element.querySelector('.gallery-overlay-controls-like span');
	  this._comments = this.element.querySelector('.gallery-overlay-controls-comments span');

	  this._onCloseClick = this._onCloseClick.bind(this);
	  this._onPhotoClick = this._onPhotoClick.bind(this);
	  this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
	}

	/**
	 * отображает галерею на странице
	 */
	Gallery.prototype.show = function() {
	  this.element.classList.remove('invisible');
	  this._closeButton.addEventListener('click', this._onCloseClick);
	  this._photo.addEventListener('click', this._onPhotoClick);
	  window.addEventListener('keydown', this._onDocumentKeyDown);
	};

	/**
	 * скрывает галерею
	 */
	Gallery.prototype.hide = function() {
	  this.element.classList.add('invisible');
	  this._closeButton.removeEventListener('click', this._onCloseClick);
	  this._photo.removeEventListener('click', this._onPhotoClick);
	  window.removeEventListener('keydown', this._onDocumentKeyDown);
	  location.hash = '';
	};

	/**
	 * функция для обработки клика по кнопке закрытия галереи
	 */
	Gallery.prototype._onCloseClick = function() {
	  this.hide();
	};

	/**
	 * загружает в галерею следующее изображение
	 */
	Gallery.prototype._onPhotoClick = function() {
	  location.hash = 'photo/' + store.getNextItem(this.number).url;
	};

	/**
	 *  закрывает галерею по нажатию Esc и пролистывает изображения при нажатии стрелочек на клавиатуре
	 */
	Gallery.prototype._onDocumentKeyDown = function(evt) {
	  switch (evt.keyCode) {
	    case 27:
	      this.hide();
	      break;

	    case 37:
	      location.hash = 'photo/' + store.getPreviousItem(this.number).url;
	      break;

	    case 39:
	      this._onPhotoClick();
	      break;
	  }
	};

	/**
	 * подставляет картинку и количество лайков и комментариев в галерею.
	 * @param {number|string} number номер элемента по порядку или url картинки
	 */
	Gallery.prototype.setCurrentPicture = function(picture) {
	  var element;

	  if (typeof picture === 'number') {
	    element = store.getItem(picture);
	  } else if (typeof picture === 'string') {
	    element = store.getList().filter(function(item) {
	      return item.url === picture;
	    })[0];
	    this.number = store.getList().indexOf(element);
	  }
	  this.picture = picture;
	  this._photo.src = element.url;
	  this._likes.textContent = element.likes;
	  this._comments.textContent = element.comments;
	};

	module.exports = Gallery;



/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

	var store = null;

	/**
	* @construct
	* Записывает массив с информацией о картинках в свою локальную переменную list при помощи метода
	* setList, и отдает сохраненный массив при попощи метода getList
	* @type {object} PictureStore - массив элементов в формате JSON с информацией о картинках
	* @return {object}  этот же массив
	*/
	function PictureStore() {
	  var _list = [],
	    _filter = [];

	/**
	 * возвращает ранее загруженный массив с информацией о картинках
	 * @return {array.object}
	 */
	  function getList() {
	    return [].concat(_filter);
	  }

	/**
	 * возвращает отдельный элемент массива с информацией о картинке
	 * @param  {number} number номер элемента массива
	 * @return {object}
	 */
	  function getItem(number) {
	    return getList()[number];
	  }

	/**
	 * возвращает следующий элемент массива с информацией о картинке
	 * @param  {number} number номер элемента массива
	 * @return {object}
	 */
	  function getNextItem(number) {
	    if (number < getLength() - 1) {
	      ++number;
	    }
	    return getList()[number];
	  }

	/**
	 * возвращает предыдущий элемент массива с информацией о картинке
	 * @param  {number} number номер элемента массива
	 * @return {object}
	 */
	  function getPreviousItem(number) {
	    if (number > 0) {
	      --number;
	    }
	    return getList()[number];
	  }

	/**
	 * записывает в _filter элементы массива, соответствующие выбранному фильтру
	 * @param {string} id выбранный фильтр
	 */
	  function setFilter(id) {
	    localStorage.setItem('activeFilter', id);

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

	/**
	 * сохраняет массив с информацией о картинках в _list
	 * @param {array.object} newItems массив с информацией о картинках
	 */
	  function setList(newItems) {
	    _list = _list.concat(newItems);
	  }

	/**
	 * возвращает длину текущего массива с картинками
	 * @return {number} длина массива
	 */
	  function getLength() {
	    return _list.length;
	  }

	  return {
	    getList: getList,
	    getItem: getItem,
	    getNextItem: getNextItem,
	    getPreviousItem: getPreviousItem,
	    setList: setList,
	    getLength: getLength,
	    setFilter: setFilter
	  };
	}

	if (!store) {
	  store = new PictureStore();
	}

	module.exports = store;


/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * @construct
	 * @param {Object} data объект с со ссылкой на изображение и информацией о нем: лайки, комментарии, дата загрузки
	 */
	function Photo(data) {
	  this._data = data;
	  this.onClick = null;
	  this.number = null;
	  this.element = null;
	}

	/**
	 * возвращает url картинки
	 * @return {string}
	 */
	Photo.prototype.getUrl = function() {
	  return this._data.url;
	};

	/**
	 * метод для обработки клика по картинке. Если клик произошел именно по картинке, и картинка загружена, то вызывается this.onClick()
	 * @param  {event} evt
	 */
	Photo.prototype.click = function(evt) {
	  evt.preventDefault();
	  if (this.element.classList.contains('picture') &&
	    !this.element.classList.contains('picture-load-failure')) {
	    if (typeof this.onClick === 'function') {
	      this.onClick();
	    }
	  }
	};

	/**
	 * отрисовывает изображение на странице
	 */
	Photo.prototype.render = function() {
	  var timer;
	  var i = 0;
	  var pictureTemplate = document.querySelector('#picture-template');

	/* проверка на случай использования IE */
	  if ('content' in pictureTemplate) {
	    this.element = pictureTemplate.content.childNodes[1].cloneNode(true);
	  } else {
	    this.element = pictureTemplate.childNodes[1].cloneNode(true);
	  }

	  this.element.querySelector('.picture-comments').textContent = this._data.comments;
	  this.element.querySelector('.picture-likes').textContent = this._data.likes;
	  this.number = i++;

	  var oldPicture = this.element.querySelector('img');
	  var newPicture = new Image(182, 182);

	/* отрисовывает элемент с картинкой на странице, заменяя старый (пустой) элемент новым */
	  newPicture.onload = function() {
	    clearTimeout(timer);
	    this.element.replaceChild(newPicture, oldPicture);
	  }.bind(this);

	/* при ошибке загрузки, отображает заглушку вместо картинки */
	  newPicture.onerror = function() {
	    this.element.classList.add('picture-load-failure');
	  }.bind(this);

	  newPicture.src = this._data.url;

	  timer = setTimeout(function() {
	    newPicture.src = '';
	    this.element.classList.add('picture-load-failure');
	  }.bind(this), 5000);


	  this.element.addEventListener('click', this.click.bind(this));
	};

	module.exports = Photo;


/***/ }
/******/ ]);