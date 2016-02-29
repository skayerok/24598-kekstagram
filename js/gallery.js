'use strict';

var store = require('./pictureStore');

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

