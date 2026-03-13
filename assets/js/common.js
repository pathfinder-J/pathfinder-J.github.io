(function () {
  "use strict";

  var SiteUtils = {
    ready: function (fn) {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", fn, { once: true });
      } else {
        fn();
      }
    },

    debounce: function (fn, delay) {
      var timer = null;
      return function () {
        var context = this;
        var args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
          fn.apply(context, args);
        }, delay || 120);
      };
    },

    escapeRegExp: function (str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    },

    slugify: function (str) {
      return String(str)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-가-힣]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
    }
  };

  window.SiteUtils = SiteUtils;
})();
