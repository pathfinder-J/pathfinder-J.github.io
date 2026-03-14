document.addEventListener("DOMContentLoaded", function () {
  var toc = document.getElementById("toc");
  var content = document.getElementById("post-content");

  if (!toc || !content) return;

  var headings = Array.from(content.querySelectorAll("h1, h2, h3"));
  if (!headings.length) {
    toc.innerHTML = "";
    return;
  }

  var h1Count = 0;
  var h2Count = 0;
  var h3Count = 0;
  var ul = document.createElement("ul");
  var headingData = [];

  headings.forEach(function (heading, index) {
    if (!heading.id) {
      heading.id = "heading-" + index;
    }

    var tag = heading.tagName.toLowerCase();
    var number = "";

    if (tag === "h1") {
      h1Count += 1;
      h2Count = 0;
      h3Count = 0;
      number = String(h1Count);
    } else if (tag === "h2") {
      h2Count += 1;
      h3Count = 0;
      number = h1Count > 0 ? h1Count + "." + h2Count : String(h2Count);
    } else {
      h3Count += 1;
      if (h1Count > 0 && h2Count > 0) {
        number = h1Count + "." + h2Count + "." + h3Count;
      } else if (h2Count > 0) {
        number = h2Count + "." + h3Count;
      } else {
        number = String(h3Count);
      }
    }

    var originalText =
      heading.getAttribute("data-original-text") || heading.textContent.trim();

    heading.setAttribute("data-original-text", originalText);

    headingData.push({
      heading: heading,
      tag: tag,
      number: number,
      title: originalText
    });
  });

  headingData.forEach(function (item) {
    var heading = item.heading;

    if (!heading.dataset.tocNumbered) {
      heading.textContent = "";

      var numSpan = document.createElement("span");
      numSpan.className = "heading-number";
      numSpan.textContent = item.number;

      var textSpan = document.createElement("span");
      textSpan.className = "heading-text";
      textSpan.textContent = item.title;

      heading.appendChild(numSpan);
      heading.appendChild(document.createTextNode(" "));
      heading.appendChild(textSpan);

      heading.dataset.tocNumbered = "true";
    }

    var li = document.createElement("li");
    li.className = "toc-" + item.tag;

    var a = document.createElement("a");
    a.href = "#" + heading.id;
    a.textContent = item.number + " " + item.title;

    li.appendChild(a);
    ul.appendChild(li);
  });

  toc.innerHTML = "";
  toc.appendChild(ul);

  var links = Array.from(toc.querySelectorAll("a"));
  var headingTops = [];

  function computeHeadingTops() {
    headingTops = headings.map(function (heading) {
      return {
        id: heading.id,
        top: heading.getBoundingClientRect().top + window.scrollY
      };
    });
  }

  function updateActiveHeading() {
    if (!headingTops.length) return;

    var mark = window.scrollY + 180;
    var currentId = headingTops[0].id;

    for (var i = 0; i < headingTops.length; i++) {
      if (headingTops[i].top <= mark) {
        currentId = headingTops[i].id;
      } else {
        break;
      }
    }

    links.forEach(function (link) {
      link.classList.toggle(
        "active",
        link.getAttribute("href") === "#" + currentId
      );
    });
  }

  var scrollTimer = null;
  var resizeTimer = null;

  computeHeadingTops();
  updateActiveHeading();

  window.addEventListener("scroll", function () {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(updateActiveHeading, 20);
  }, { passive: true });

  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      computeHeadingTops();
      updateActiveHeading();
    }, 120);
  });

  window.addEventListener("load", function () {
    computeHeadingTops();
    updateActiveHeading();
  }, { once: true });
});
