// Saves an explicit language choice - from the splash page buttons or the
// header's language switch - so a later visit to / skips straight to it,
// even if it differs from the browser's language. No cookies - localStorage
// only, same as theme.js, read and written with try/catch since it can
// throw (private browsing, blocked storage).
(function () {
  "use strict";
  var links = document.querySelectorAll("a[data-lang]");
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener("click", function (e) {
      try {
        localStorage.setItem("lang", e.currentTarget.dataset.lang);
      } catch (err) {
        // Storage unavailable: the link still navigates normally.
      }
    });
  }
})();
