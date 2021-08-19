;(() => {
  "use strict";

  const NUMLINES = {
    'ruler-vertical': 8,
    'ruler-horizontal': 6,
  };

  class Rulers {

      /**
       * Ruler class
       * @constructor
       * @param {Object<HTMLElement>} elements Nodes to append ruler elements to
       */
      constructor(elements) {
        this.createRulers(elements);
      }

      // Creates a pixel measuring ruler
      createRulers(elements) {
        // Create both the vertical and horizontal rulers
        ['ruler-vertical', 'ruler-horizontal'].forEach((rulerClass) => {
            const ruler = document.createElement('ol');
            ruler.setAttribute('class', rulerClass);
            for (let i = 0; i < NUMLINES[rulerClass]; i++) {
                const line = document.createElement('li');
                line.setAttribute('class', rulerClass);
                ruler.appendChild(line);
            }
            elements[rulerClass].append(ruler);
        });
    }
  }
  
  window.Rulers = Rulers;

})();