function getMessage(a, b) {
  var typeA = typeof(a);
  var typeB = typeof(b);


  switch (typeA) {


    case "boolean":
      if (a == true) {
        console.log("case1.1");
        return "Переданное GIF-изображение анимировано и содержит " + b + " кадров";
      } else if (a == false) {
        console.log("case1.2");
        return "Переданное GIF-изображение не анимировано";
      }
      break;


    case "number":
      return "Переданное SVG-изображение содержит " + a + " объектов и "+ b * 4 + " аттрибутов";
      break;


    case "object":
      if (Array.isArray(a) && !Array.isArray(b)) {
        var sum = 0;
        for (var i = 0; i < a.length; i++) {
          sum += a[i];
        }
        return "Количество красных точек во всех строчках изображения: " + sum;
      }


    case "object":
      if (Array.isArray(a) && Array.isArray(b)) {
        var square = 0;
        for (var i = 0; i < a.length; i++) {
          square += a[i] * b[i];
        }
        return "Общая площадь артефактов сжатия: " + square + " пикселей";
      }
      break;
  }
};