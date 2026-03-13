document.addEventListener("DOMContentLoaded", () => {
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

  const headingInfo = headings.map((heading, index) => {
    if (!heading.id) {
      heading.id = `heading-${index}`;
    }

    const tag = heading.tagName.toLowerCase();
    let number = "";

    if (tag === "h1") {
      h1Count += 1;
      h2Count = 0;
      h3Count = 0;
      number = `${h1Count}`;
    } else if (tag === "h2") {
      h2Count += 1;
      h3Count = 0;
      number = h1Count > 0 ? `${h1Count}.${h2Count}` : `${h2Count}`;
    } else {
      h3Count += 1;
      number = h1Count > 0 && h2Count > 0
        ? `${h1Count}.${h2Count}.${h3Count}`
        : h2Count > 0
        ? `${h2Count}.${h3Count}`
        : `${h3Count}`;
    }

    const originalText = heading.dataset.originalText || heading.textContent.trim();
    heading.dataset.originalText = originalText;

    if (heading.dataset.numbered !== "true") {
      heading.textContent = "";

      const numSpan = document.createElement("span");
      numSpan.className = "heading-number";
      numSpan.textContent = number;

      const textSpan = document.createElement("span");
      textSpan.className = "heading-text";
      textSpan.textContent = originalText;

      heading.appendChild(numSpan);
      heading.appendChild(textSpan);
      heading.dataset.numbered = "true";
    }

    return { heading, tag, number, title: originalText };
  });

  const ul = document.createElement("ul");

  headingInfo.forEach(({ heading, tag, number, title }) => {
    const li = document.createElement("li");
    li.className = `toc-${tag}`;

    const a = document.createElement("a");
    a.href = `#${heading.id}`;
    a.textContent = `${number} ${title}`;

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

    links.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("active", isActive);
    });

    const activeLink = toc.querySelector(`a[href="#${id}"]`);
    if (activeLink) {
      activeLink.scrollIntoView({
        block: "nearest",
        inline: "nearest"
      });
    }
  }

  function updateActiveHeading() {
    const offset = 160;
    let current = headings[0];

    for (const heading of headings) {
      const top = heading.getBoundingClientRect().top;
      if (top <= offset) {
        current = heading;
      } else {
        break;
      }
    }

    const nearBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

    if (nearBottom) {
      current = headings[headings.length - 1];
    }

    setActive(current.id);
  }

  window.addEventListener("scroll", updateActiveHeading, { passive: true });
  window.addEventListener("resize", updateActiveHeading);

  updateActiveHeading();
});
