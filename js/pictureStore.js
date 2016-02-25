/*eslint strict: [2, "function"]*/
(function() {
  'use strict';

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

    function getItem(number) {
      return getList()[number];
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
      getItem: getItem,
      setList: setList,
      getLength: getLength,
      setFilter: setFilter
    };
  }

  window.PictureStore = PictureStore;
})();
