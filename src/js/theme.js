// Theme toggle: light/dark, overriding the OS prefers-color-scheme default.
// No cookies or trackers - the choice lives only in this browser's
// localStorage, read and written with try/catch since it can throw (private
// browsing, blocked storage) and the toggle must still work as a session-only
// switch if it does.
(function () {
  "use strict";
  var STORAGE_KEY = "theme";
  var btn = document.getElementById("theme-toggle");
  if (!btn) return;

  var mql = window.matchMedia("(prefers-color-scheme: dark)");

  function storedTheme() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      return v === "light" || v === "dark" ? v : null;
    } catch (e) {
      return null;
    }
  }

  function saveTheme(v) {
    try {
      localStorage.setItem(STORAGE_KEY, v);
    } catch (e) {
      // Storage unavailable: the toggle still works for this page view.
    }
  }

  function effectiveTheme() {
    return storedTheme() || (mql.matches ? "dark" : "light");
  }

  var label = btn.querySelector(".theme-toggle-label");

  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    if (label) label.textContent = theme === "dark" ? btn.dataset.labelLight : btn.dataset.labelDark;
  }

  apply(effectiveTheme());

  btn.addEventListener("click", function () {
    var next = effectiveTheme() === "dark" ? "light" : "dark";
    saveTheme(next);
    apply(next);
  });

  // Follow the OS setting live, but only while the visitor hasn't chosen.
  mql.addEventListener("change", function () {
    if (!storedTheme()) apply(effectiveTheme());
  });
})();
