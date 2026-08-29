(function(window, document){
  'use strict';

  window.sa_event = window.sa_event || function(){
    const args = Array.prototype.slice.call(arguments);
    if (window.sa_event.q) window.sa_event.q.push(args);
    else window.sa_event.q = [args];
  };

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://scripts.simpleanalyticscdn.com/latest.js';
  document.head.appendChild(script);
})(window, document);
