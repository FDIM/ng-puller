"use strict";
/**
 * Each module has a <moduleName>.module.js file.  This file contains the angular module declaration -
 * angular.module("moduleName", []);
 * The build system ensures that all the *.module.js files get included prior to any other .js files, which
 * ensures that all module declarations occur before any module references.
 */
(function (module) {
  // The name of the module, followed by its dependencies (at the bottom to facilitate enclosure)
}(angular.module("ngPuller", ["ngPullerOnPull", "ngPullerContainer", "ngPullerService"])));

"use strict";
/**
 * Each module has a <moduleName>.module.js file.  This file contains the angular module declaration -
 * angular.module("moduleName", []);
 * The build system ensures that all the *.module.js files get included prior to any other .js files, which
 * ensures that all module declarations occur before any module references.
 */
(function (module) {
  module.service('ngPullerService', PullerService);
  var FACTORIES = {
    down:{
      canBegin: function(element) {
        // stays in top
        return element.prop('scrollTop') === 0;
      },
      distance: function(newEvent, oldEvent) {
        return newEvent.clientY - oldEvent.clientY;
      },
      cssProp:'margin-top'
    },
    up:{
      canBegin: function(element) {
        return element.prop('scrollTop') === element.prop('scrollHeight') - element.prop('clientHeight');
      },
      distance: function(newEvent, oldEvent) {
        return oldEvent.clientY - newEvent.clientY;
      },
      cssProp:'height'
    },
    left:{
      canBegin: function(element) {
        return element.prop('scrollLeft') === 0;
      },
      distance: function(newEvent, oldEvent) {
        return newEvent.clientX - oldEvent.clientX;
      },
      cssProp:'margin-left'
    },
    right:{
      canBegin: function(element) {
        return element.prop('scrollLeft') === element.prop('scrollWidth') - element.prop('clientWidth');
      },
      distance: function(newEvent, oldEvent) {
        return oldEvent.clientX - newEvent.clientX;
      },
      cssProp:'margin-right'
    }
  };

  function PullerService() {
    this.$factories = FACTORIES;
  }

  PullerService.prototype.getFactory = function(direction) {
    return FACTORIES[direction];
  }

  // The name of the module, followed by its dependencies (at the bottom to facilitate enclosure)
}(angular.module("ngPullerService", [])));

"use strict";
/**
 * Each module has a <moduleName>.module.js file.  This file contains the angular module declaration -
 * angular.module("moduleName", []);
 * The build system ensures that all the *.module.js files get included prior to any other .js files, which
 * ensures that all module declarations occur before any module references.
 */
(function (module) {
  var EVENTS = {
    start:'mousedown touchstart',
    move:'mousemove touchmove',
    end: 'mouseup touchend'
  };

  module.directive('onPullDown', ['ngPullerService', getDirective('down')]);
  module.directive('onPullUp', ['ngPullerService', getDirective('up')]);
  module.directive('onPullLeft', ['ngPullerService', getDirective('left')]);
  module.directive('onPullRight', ['ngPullerService', getDirective('right')]);

  function getDirective(direction) {
    //var directiveName = "on-pull-"+direction;
    var activeClassName = "pull-"+direction+'-active';
    var capitalizedDirection = direction[0].toUpperCase() + direction.slice(1);
    var defaultOptions = {
      Distance: 100,
      Progress:'$pull' + capitalizedDirection + 'Progress',
      Duration: 450,
      Timeout:300,
      Treshold: 5
    };
    return OnPullDirective;

    function OnPullDirective(pullerService){
        var progress = 0;
        var initialEvent;
        var factory = pullerService.getFactory(direction);
        return {
          controller: controller,
          link: link
        };
        function controller(){
          this.queue = [];
        }

        function link(scope, element, attr, ctrl) {
          var options = normalizeOptions(attr);
          ctrl.options = options;
          ctrl.queue.forEach(function(fn) {
            fn();
          });
          var startTime;
          element.on(EVENTS.start, pointerDown);

          function pointerDown(ev) {
            if(factory.canBegin(element)){
              element.on(EVENTS.move, pointerMove);
              element.on(EVENTS.end, pointerUp);
              initialEvent = ev;
              startTime = Date.now();
            }
          }

          function pointerMove(ev){
            var percent = factory.distance(ev, initialEvent) * 100.0 / (1.0 * options.distance);
            // cancel intention if user drags below certain treshold until timeout
            if(percent <= options.treshold && Date.now() - startTime > options.timeout){
              element.off(EVENTS.move, pointerMove);
              element.off(EVENTS.end, pointerUp);
              element.removeClass(activeClassName);
              progress = 0;
            }
            if(percent<0){
              percent=0;
            }
            if (percent>1) {
              element.addClass(activeClassName);
              if (percent > 100) {
                percent = 100;
              }
            }
            scope.$eval(options.progress+'=value',{
              value: percent
            });
            scope.$apply();
          }

          function pointerUp(ev){
            element.off(EVENTS.move, pointerMove);
            element.off(EVENTS.end, pointerUp);
            element.removeClass(activeClassName);
            // execute expression and depending on its outcome revert progress
            // no expression = always revert progress when gesture is done
            if(options.expression && scope.$eval(options.progress)>=100){
                if(scope.$eval(options.expression, {$callback:revertProgress})!==false) {
                  revertProgress();
                }
            } else {
              revertProgress();
            }
            scope.$apply();
          }
          function revertProgress() {
              scope.$eval(options.progress+'=0');
          }

        }
    }

    function normalizeOptions(attr) {
      var options = {};
      for(var key in defaultOptions){
        options[key.toLowerCase()] = attr['pull'+capitalizedDirection+key] || defaultOptions[key];
      }
      options.expression = attr['onPull'+capitalizedDirection];
      return options;
    }
  }

  // The name of the module, followed by its dependencies (at the bottom to facilitate enclosure)
}(angular.module("ngPullerOnPull",[])));

"use strict";
/**
 * Each module has a <moduleName>.module.js file.  This file contains the angular module declaration -
 * angular.module("moduleName", []);
 * The build system ensures that all the *.module.js files get included prior to any other .js files, which
 * ensures that all module declarations occur before any module references.
 */
(function (module) {

  module.directive('pullDownContainer', ['ngPullerService', getDirective('down')]);
  module.directive('pullUpContainer', ['ngPullerService', getDirective('up')]);
  module.directive('pullLeftContainer', ['ngPullerService', getDirective('left')]);
  module.directive('pullRightContainer', ['ngPullerService', getDirective('right')]);

  function getDirective(direction) {
    var capitalizedDirection = direction[0].toUpperCase() + direction.slice(1);

    return PulledContainer;

    function PulledContainer(pullerService){
        var factory = pullerService.getFactory(direction);
        return {
          require:'^onPull'+capitalizedDirection,
          link:{post:link},
          transclude:true,
          template:'<div ng-transclude></div>'
        };

        function link(scope, element, attr, pullCtrl) {
          pullCtrl.queue.push(function(){
            element.addClass('pull-'+direction+'-container');
            scope.$watch(pullCtrl.options.progress, function(newValue) {
              element[0].style[factory.cssProp] = (newValue / 100 * pullCtrl.options.distance)+'px';
            })
          });
        }
    }
  }
    // The name of the module, followed by its dependencies (at the bottom to facilitate enclosure)
}(angular.module("ngPullerContainer",[])));