(function () {
  "use strict";

  function buildHeadingId(text, usedIds) {
    var base = SiteUtils.slugify(text) || "section";
    var id = base;
    var index = 2;

    while (usedIds.has(id) || document.getElementById(id)) {
      id = base + "-" + index;
      index += 1;
    }

    usedIds.add(id);
    return id;
  }

  function initToc() {
    var toc = document.getElementById("toc");
    var content = document.getElementById("post-content");

    if (!toc || !content) return;

    var headings = Array.from(content.querySelectorAll("h1, h2, h3"));
    if (!headings.length) {
      toc.innerHTML = "";
      return;
    }

    var usedIds = new Set();
    var counts = { h1: 0, h2: 0, h3: 0 };
    var headingData = [];

    headings.forEach(function (heading) {
      var title =
        heading.getAttribute("data-original-text") || heading.textContent.trim();

      if (!heading.id) {
        heading.id = buildHeadingId(title, usedIds);
      } else {
        usedIds.add(heading.id);
      }

      var tag = heading.tagName.toLowerCase();
      var number = "";

      if (tag === "h1") {
        counts.h1 += 1;
        counts.h2 = 0;
        counts.h3 = 0;
        number = String(counts.h1);
      } else if (tag === "h2") {
        counts.h2 += 1;
        counts.h3 = 0;
        number = counts.h1 > 0 ? counts.h1 + "." + counts.h2 : String(counts.h2);
      } else {
        counts.h3 += 1;
        if (counts.h1 > 0 && counts.h2 > 0) {
          number = counts.h1 + "." + counts.h2 + "." + counts.h3;
        } else if (counts.h2 > 0) {
          number = counts.h2 + "." + counts.h3;
        } else {
          number = String(counts.h3);
        }
      }

      heading.setAttribute("data-original-text", title);

      headingData.push({
        heading: heading,
        tag: tag,
        title: title,
        number: number
      });
    });

    headingData.forEach(function (item) {
      var heading = item.heading;

      if (!heading.querySelector(":scope > .heading-number")) {
        while (heading.firstChild) {
          heading.removeChild(heading.firstChild);
        }

        var numSpan = document.createElement("span");
        numSpan.className = "heading-number";
        numSpan.textContent = item.number;

        var textSpan = document.createElement("span");
        textSpan.className = "heading-text";
        textSpan.textContent = item.title;

        heading.appendChild(numSpan);
        heading.appendChild(document.createTextNode(" "));
        heading.appendChild(textSpan);
      }
    });

    var ul = document.createElement("ul");

    headingData.forEach(function (item) {
      var li = document.createElement("li");
      li.className = "toc-" + item.tag;

      var a = document.createElement("a");
      a.href = "#" + item.heading.id;
      a.textContent = item.number + " " + item.title;

      li.appendChild(a);
      ul.appendChild(li);
    });

    toc.innerHTML = "";
    toc.appendChild(ul);

    var links = Array.from(toc.querySelectorAll("a"));
    var headingTops = [];

    function computeHeadingTops() {
      headingTops = headingData.map(function (item) {
        return {
          id: item.heading.id,
          top: item.heading.getBoundingClientRect().top + window.scrollY
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
        link.classList.toggle("active", link.getAttribute("href") === "#" + currentId);
      });
    }

    computeHeadingTops();
    updateActiveHeading();

    window.addEventListener("scroll", SiteUtils.debounce(updateActiveHeading, 20), {
      passive: true
    });
    window.addEventListener(
      "resize",
      SiteUtils.debounce(function () {
        computeHeadingTops();
        updateActiveHeading();
      }, 120)
    );
    window.addEventListener(
      "load",
      function () {
        computeHeadingTops();
        updateActiveHeading();
      },
      { once: true }
    );
  }

  SiteUtils.ready(initToc);
})();  });

  toc.innerHTML = "";
  toc.appendChild(ul);

  const links = Array.from(toc.querySelectorAll("a"));
  let activeId = null;

  function setActive(id) {
    if (!id || activeId === id) return;
    activeId = id;

    links.forEach(function (link) {
      const isActive = link.getAttribute("href") === "#" + id;
      link.classList.toggle("active", isActive);
    });
  }

  function getHeadingTops() {
    return headings.map(function (heading) {
      return {
        id: heading.id,
        top: heading.getBoundingClientRect().top + window.scrollY
      };
    });
  }

  function updateActiveHeading() {
    const tops = getHeadingTops();
    const mark = window.scrollY + 180;

    let currentId = tops[0].id;

    for (let i = 0; i < tops.length; i++) {
      if (tops[i].top <= mark) {
        currentId = tops[i].id;
      } else {
        break;
      }
    }

    setActive(currentId);
  }

  window.addEventListener("scroll", updateActiveHeading, { passive: true });
  window.addEventListener("resize", updateActiveHeading);
  window.addEventListener("load", updateActiveHeading);

  setTimeout(updateActiveHeading, 0);
  setTimeout(updateActiveHeading, 300);
  setTimeout(updateActiveHeading, 1000);
});
