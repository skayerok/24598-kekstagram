/*eslint strict: [2, "function"]*/
(function() {
  'use strict';

  function Photo(data) {
    this._data = data;
  }

  Photo.prototype.render = function() {
    var timer;
    var pictureTemplate = document.querySelector('#picture-template');

    if ('content' in pictureTemplate) {
      this.element = pictureTemplate.content.childNodes[1].cloneNode(true);
    } else {
      this.element = pictureTemplate.childNodes[1].cloneNode(true);
    }

    this.element.querySelector('.picture-comments').textContent = this._data.comments;
    this.element.querySelector('.picture-likes').textContent = this._data.likes;

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

  };

  window.Photo = Photo;
})();
