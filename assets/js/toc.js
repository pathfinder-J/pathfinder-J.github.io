document.addEventListener("DOMContentLoaded", function () {
  const toc = document.getElementById("toc");
  const content = document.querySelector(".post-content");

  if (!toc || !content) return;

  const headings = Array.from(content.querySelectorAll("h2, h3"));

  if (!headings.length) {
    toc.style.display = "none";
    return;
  }

  toc.innerHTML = "";

  const header = document.createElement("div");
  header.className = "post-toc-header";

  const title = document.createElement("div");
  title.className = "post-toc-title";
  title.textContent = "Contents";

  header.appendChild(title);
  toc.appendChild(header);

  const body = document.createElement("div");
  body.className = "post-toc-body";

  const ul = document.createElement("ul");
  ul.className = "post-toc-list";

  let h2Counter = 0;
  let h3Counter = 0;

  const items = [];
  const itemMap = new Map();

  headings.forEach(function (heading, index) {
    const tag = heading.tagName.toLowerCase();

    if (!heading.id) {
      heading.id = "section-" + (index + 1);
    }

    if (tag === "h2") {
      h2Counter += 1;
      h3Counter = 0;
    } else {
      h3Counter += 1;
    }

    const number =
      tag === "h2"
        ? String(h2Counter)
        : String(h2Counter) + "." + String(h3Counter);

    const originalText = heading.textContent.trim();

    heading.innerHTML = "";

    const numberSpan = document.createElement("span");
    numberSpan.className = "heading-number";
    numberSpan.textContent = number + " ";

    const textSpan = document.createElement("span");
    textSpan.className = "heading-text";
    textSpan.textContent = originalText;

    const anchor = document.createElement("a");
    anchor.href = "#" + heading.id;
    anchor.className = "heading-anchor";
    anchor.textContent = "#";
    anchor.setAttribute("aria-label", "Anchor link to " + originalText);

    heading.appendChild(numberSpan);
    heading.appendChild(textSpan);
    heading.appendChild(anchor);

    const li = document.createElement("li");
    li.className = tag === "h3" ? "toc-h3" : "toc-h2";

    const a = document.createElement("a");
    a.href = "#" + heading.id;
    a.textContent = number + " " + originalText;

    li.appendChild(a);
    ul.appendChild(li);

    const item = { heading, link: a, index };
    items.push(item);
    itemMap.set(heading.id, item);
  });

  body.appendChild(ul);
  toc.appendChild(body);

  function isMobile() {
    return window.innerWidth <= 960;
  }

  function getScrollOffset() {
    return isMobile() ? 72 : 88;
  }

  items.forEach(function (item) {
    item.link.addEventListener("click", function (e) {
      e.preventDefault();

      const target = document.getElementById(
        this.getAttribute("href").slice(1)
      );

      if (!target) return;

      const y =
        window.scrollY +
        target.getBoundingClientRect().top -
        getScrollOffset();

      window.scrollTo({
        top: y,
        behavior: "smooth"
      });
    });
  });

  let currentActiveId = null;

  function setActive(id) {
    if (!id || id === currentActiveId) return;

    currentActiveId = id;

    items.forEach(function (item) {
      item.link.classList.remove("toc-active");
    });

    const currentItem = itemMap.get(id);
    if (currentItem) {
      currentItem.link.classList.add("toc-active");
    }
  }

  function updateActiveByViewport() {
    const offset = getScrollOffset() + 12;
    let current = null;

    for (let i = 0; i < items.length; i += 1) {
      const rect = items[i].heading.getBoundingClientRect();
      if (rect.top <= offset) {
        current = items[i];
      } else {
        break;
      }
    }

    if (!current) {
      current = items[0];
    }

    setActive(current.heading.id);
  }

  const observer = new IntersectionObserver(
    function () {
      updateActiveByViewport();
    },
    {
      root: null,
      rootMargin: "-80px 0px -70% 0px",
      threshold: [0, 1]
    }
  );

  headings.forEach(function (heading) {
    observer.observe(heading);
  });

  let ticking = false;

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateActiveByViewport();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updateActiveByViewport);

  updateActiveByViewport();
});
