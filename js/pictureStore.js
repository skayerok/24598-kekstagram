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
