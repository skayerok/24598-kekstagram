'use strict';

/**
* записывает в прототип дочернего конструктора методы и свойства родительского
* @param  {Function} child  дочерний конструктор
* @param  {Function} parent родительский конструктор
*/
function inherit(child, parent) {
  function EmptyConstructor() {}
  EmptyConstructor.prototype = parent.prototype;
  child.prototype = new EmptyConstructor();
}

module.exports = inherit;

