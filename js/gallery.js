'use strict';

var store = require('./pictureStore');

/**
 * @construct
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
  if (this.number < store.getLength() - 1) {
    this.setCurrentPicture(++this.number);
  }
};

/**
 *  закрывает галерею по нажатию Esc и пролистывает ее при нажатии стрелочек на клавиатуре
 */
Gallery.prototype._onDocumentKeyDown = function(evt) {
  switch (evt.keyCode) {
    case 27:
      this.hide();
      break;

    case 37:
      if (this.number > 0) {
        this.setCurrentPicture(--this.number);
      }
      break;

    case 39:
      this._onPhotoClick();
      break;
  }
};

/**
 * подставляет картинку и количество лайков и комментариев в галерею.
 * @param {number} number номер картинки по порядку
 */
Gallery.prototype.setCurrentPicture = function(number) {
  var element = store.getItem(number);
  this.number = number;
  this._photo.src = element.url;
  this._likes.textContent = element.likes;
  this._comments.textContent = element.comments;
};

module.exports = Gallery;

