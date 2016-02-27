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
 * отрисовывает изображение на странице
 */
Photo.prototype.render = function() {
  var timer;
  var i = 0;
  var pictureTemplate = document.querySelector('#picture-template');

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

  newPicture.onload = function() {
    clearTimeout(timer);
    this.element.replaceChild(newPicture, oldPicture);
  }.bind(this);

  newPicture.onerror = function() {
    this.element.classList.add('picture-load-failure');
  }.bind(this);

  newPicture.src = this._data.url;

  timer = setTimeout(function() {
    newPicture.src = '';
    this.element.classList.add('picture-load-failure');
  }.bind(this), 5000);

  this.element.addEventListener('click', function(evt) {
    evt.preventDefault();
    if (this.element.classList.contains('picture') &&
      !this.element.classList.contains('picture-load-failure')) {
      if (typeof this.onClick === 'function') {
        this.onClick();
      }
    }
  }.bind(this));
};

module.exports = Photo;
