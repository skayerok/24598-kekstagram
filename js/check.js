function getMessage(a, b) {
  var typeA = typeof(a);
  var typeB = typeof(b);


  switch (typeA) {


    case "boolean":
      if (a == true) {
        return "Переданное GIF-изображение анимировано и содержит " + b + " кадров";
      } else if (a == false) {
        return "Переданное GIF-изображение не анимировано";
      }
      break;


    case "number":
      return "Переданное SVG-изображение содержит " + a + " объектов и "+ b * 4 + " аттрибутов";
      break;


    case "object":
      if (Array.isArray(a) && !Array.isArray(b)) {
        var sum = a.reduce(function(sum, current) {
          return sum + current;
        }, 0);
        return "Количество красных точек во всех строчках изображения: " + sum;


      } else if (Array.isArray(a) && Array.isArray(b)) {
        var square = a.reduce(function(square, current, index) {
          return square + current * b[index];
        }, 0);
        return "Общая площадь артефактов сжатия: " + square + " пикселей";
      }
      break;
  }
};