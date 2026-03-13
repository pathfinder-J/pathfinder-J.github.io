document.addEventListener("DOMContentLoaded", function () {
  const toc = document.getElementById("toc");
  const content = document.getElementById("post-content");

  if (!toc || !content) return;

  const headings = Array.from(content.querySelectorAll("h1, h2, h3"));
  if (headings.length === 0) {
    toc.innerHTML = "";
    return;
  }

  let h1Count = 0;
  let h2Count = 0;
  let h3Count = 0;

  const ul = document.createElement("ul");
  const headingData = [];

  headings.forEach(function (heading, index) {
    if (!heading.id) {
      heading.id = "heading-" + index;
    }

    const tag = heading.tagName.toLowerCase();
    let number = "";

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

    const originalText =
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
    const heading = item.heading;
    const number = item.number;
    const title = item.title;

    if (!heading.querySelector(".heading-number")) {
      heading.textContent = "";

      const numSpan = document.createElement("span");
      numSpan.className = "heading-number";
      numSpan.textContent = number;

      const textSpan = document.createElement("span");
      textSpan.className = "heading-text";
      textSpan.textContent = title;

      heading.appendChild(numSpan);
      heading.appendChild(document.createTextNode(" "));
      heading.appendChild(textSpan);
    }

    const li = document.createElement("li");
    li.className = "toc-" + item.tag;

    const a = document.createElement("a");
    a.href = "#" + heading.id;
    a.textContent = number + " " + title;

    li.appendChild(a);
    ul.appendChild(li);
  });

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

    const activeLink = toc.querySelector('a[href="#' + id + '"]');
    if (activeLink) {
      activeLink.scrollIntoView({
        block: "nearest"
      });
    }
  }

  function updateActiveHeading() {
    const offset = 180;
    let current = headings[0];

    for (let i = 0; i < headings.length; i++) {
      const rect = headings[i].getBoundingClientRect();

      if (rect.top <= offset) {
        current = headings[i];
      } else {
        break;
      }
    }

    setActive(current.id);
  }

  window.addEventListener("scroll", updateActiveHeading, { passive: true });
  window.addEventListener("resize", updateActiveHeading);

  updateActiveHeading();
});
