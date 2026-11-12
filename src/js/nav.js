// Progressive enhancement for the navigation groups.
//
// Without this file the groups still work: <details> opens and closes on
// Enter, Space and click, and announces its state. This adds the things the
// element does not do on its own:
//
//   - Escape closes the open group and returns focus to its summary;
//   - opening one group closes the others, so two panels never overlap;
//   - clicking outside closes the open group;
//   - a group that closes while focus is inside it hands focus back to the
//     summary, instead of leaving focus on a now-hidden link.
//
// Nothing here is required to reach a page or to read its content.
(function () {
  "use strict";

  var groups = Array.prototype.slice.call(document.querySelectorAll(".nav__group"));
  if (!groups.length) return;

  function summaryOf(group) {
    return group.querySelector(".nav__summary");
  }

  function close(group) {
    if (!group.open) return;
    group.open = false;
    // Closing hides the links inside. If one of them had focus, the browser
    // would drop focus to the document; put it back on the summary instead.
    if (group.contains(document.activeElement)) {
      var summary = summaryOf(group);
      if (summary) summary.focus();
    }
  }

  function closeOthers(except) {
    groups.forEach(function (group) {
      if (group !== except) close(group);
    });
  }

  groups.forEach(function (group) {
    group.addEventListener("toggle", function () {
      if (group.open) closeOthers(group);
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    var open = groups.filter(function (group) { return group.open; });
    if (!open.length) return;
    var first = open[0];
    close(first);
    var summary = summaryOf(first);
    if (summary) summary.focus();
  });

  document.addEventListener("click", function (event) {
    groups.forEach(function (group) {
      if (group.open && !group.contains(event.target)) close(group);
    });
  });
})();
