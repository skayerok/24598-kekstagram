/*eslint strict: [2, "function"]*/
(function() {
  'use strict';

/**
 * @construct
 */
  function Gallery() {
    this.element = document.querySelector('.gallery-overlay');

    this._closeButton = document.querySelector('.gallery-overlay-close');
    this._photo = document.querySelector('.gallery-overlay-image');

    this._onCloseClick = this._onCloseClick.bind(this);
    this._onPhotoClick = this._onPhotoClick.bind(this);
    this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
  }

/**
 * показывает галерею
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
  };

/**
 * функция для обработки клика по кнопке закрытия
 */
  Gallery.prototype._onCloseClick = function() {
    this.hide();
  };

/**
 * функция для обработки клика по изображению
 */
  Gallery.prototype._onPhotoClick = function() {
    console.log('клик по изображению');
  };

/**
 *  закрывает галерею по нажатию Esc
 */
  Gallery.prototype._onDocumentKeyDown = function(evt) {
    if (evt.keyCode === 27) {
      this.hide();
    }
  };

  window.Gallery = Gallery;
})();
