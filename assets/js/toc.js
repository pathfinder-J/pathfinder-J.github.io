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

  const toggleBtn = document.createElement("button");
  toggleBtn.className = "post-toc-toggle";
  toggleBtn.type = "button";

  header.appendChild(title);
  header.appendChild(toggleBtn);
  toc.appendChild(header);

  const body = document.createElement("div");
  body.className = "post-toc-body";

  const ul = document.createElement("ul");
  ul.className = "post-toc-list";

  let h2Counter = 0;
  let h3Counter = 0;
  const items = [];

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

    const number = tag === "h2"
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

    items.push({
      heading: heading,
      link: a
    });
  });

  body.appendChild(ul);
  toc.appendChild(body);

  function isMobile() {
    return window.innerWidth <= 960;
  }

  function setCollapsed(collapsed) {
    if (isMobile()) {
      toc.classList.remove("is-collapsed");
      toggleBtn.textContent = "Collapse";
      return;
    }

    toc.classList.toggle("is-collapsed", collapsed);
    toggleBtn.textContent = collapsed ? "Expand" : "Collapse";
  }

  setCollapsed(false);

  toggleBtn.addEventListener("click", function () {
    if (isMobile()) return;
    setCollapsed(!toc.classList.contains("is-collapsed"));
  });

  window.addEventListener("resize", function () {
    setCollapsed(false);
  });

  items.forEach(function (item) {
    item.link.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href").slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;

      const offset = isMobile() ? 72 : 88;
      const y = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({
        top: y,
        behavior: "smooth"
      });
    });
  });

  let activeId = null;

  function updateActiveById(id) {
    if (!id || activeId === id) return;
    activeId = id;

    let currentItem = null;

    items.forEach(function (item) {
      const isActive = item.heading.id === id;
      item.link.classList.toggle("toc-active", isActive);
      if (isActive) currentItem = item;
    });

    if (!currentItem) return;

    if (!isMobile()) {
      const linkTop = currentItem.link.offsetTop;
      const linkBottom = linkTop + currentItem.link.offsetHeight;
      const visibleTop = body.scrollTop;
      const visibleBottom = visibleTop + body.clientHeight;
      const padding = 24;

      if (linkTop < visibleTop + padding) {
        body.scrollTo({
          top: Math.max(linkTop - padding, 0),
          behavior: "smooth"
        });
      } else if (linkBottom > visibleBottom - padding) {
        body.scrollTo({
          top: linkBottom - body.clientHeight + padding,
          behavior: "smooth"
        });
      }
    }
  }

  function fallbackActivate() {
    const offset = isMobile() ? 100 : 140;
    const y = window.scrollY + offset;

    let current = items[0];

    for (let i = 0; i < items.length; i += 1) {
      const itemTop = items[i].heading.offsetTop;
      if (itemTop <= y) {
        current = items[i];
      } else {
        break;
      }
    }

    updateActiveById(current.heading.id);
  }

  if ("IntersectionObserver" in window) {
    const visibleHeadings = new Map();

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            visibleHeadings.set(entry.target.id, entry.boundingClientRect.top);
          } else {
            visibleHeadings.delete(entry.target.id);
          }
        });

        if (visibleHeadings.size > 0) {
          let bestId = null;
          let bestTop = -Infinity;

          visibleHeadings.forEach(function (top, id) {
            if (top <= 160 && top > bestTop) {
              bestTop = top;
              bestId = id;
            }
          });

          if (!bestId) {
            let minTop = Infinity;
            visibleHeadings.forEach(function (top, id) {
              if (top < minTop) {
                minTop = top;
                bestId = id;
              }
            });
          }

          updateActiveById(bestId);
        } else {
          fallbackActivate();
        }
      },
      {
        root: null,
        rootMargin: "-80px 0px -70% 0px",
        threshold: [0, 1]
      }
    );

    items.forEach(function (item) {
      observer.observe(item.heading);
    });

    window.addEventListener("scroll", fallbackActivate, { passive: true });
    window.addEventListener("resize", fallbackActivate);
  } else {
    window.addEventListener("scroll", fallbackActivate, { passive: true });
    window.addEventListener("resize", fallbackActivate);
  }

  fallbackActivate();
});  });

  body.appendChild(ul);
  toc.appendChild(body);

  function setCollapsed(collapsed) {
    toc.classList.toggle("is-collapsed", collapsed);
    toggleBtn.textContent = collapsed ? "Expand" : "Collapse";
  }

  /* 기본은 항상 펼쳐진 상태 */
  setCollapsed(false);

  toggleBtn.addEventListener("click", function () {
    setCollapsed(!toc.classList.contains("is-collapsed"));
    toc.dataset.userToggled = "true";
  });

  window.addEventListener("resize", function () {
    /* 리사이즈 시 강제 collapse/expand 하지 않음 */
    if (!toc.dataset.userToggled) {
      setCollapsed(false);
    }
  });

  items.forEach(function (item) {
    item.link.addEventListener("click", function (e) {
      e.preventDefault();

      const target = document.getElementById(
        this.getAttribute("href").slice(1)
      );

      if (!target) return;

      const offset = window.innerWidth <= 960 ? 72 : 88;
      const y = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({
        top: y,
        behavior: "smooth"
      });
    });
  });

  function activateLink() {
    const scrollOffset = window.innerWidth <= 960 ? 90 : 110;
    const scrollY = window.scrollY;

    let current = items[0];

    items.forEach(function (item) {
      const headingTop = item.heading.getBoundingClientRect().top + window.scrollY;
      if (scrollY + scrollOffset >= headingTop) {
        current = item;
      }
    });

    items.forEach(function (item) {
      item.link.classList.remove("toc-active");
    });

    current.link.classList.add("toc-active");

    /* 데스크탑에서만 TOC 내부 스크롤 보정 */
    if (window.innerWidth > 960) {
      const tocBox = body;
      const linkTop = current.link.offsetTop;
      const linkHeight = current.link.offsetHeight;
      const boxScrollTop = tocBox.scrollTop;
      const boxHeight = tocBox.clientHeight;

      if (linkTop < boxScrollTop + 24) {
        tocBox.scrollTo({
          top: Math.max(linkTop - 24, 0),
          behavior: "smooth"
        });
      } else if (linkTop + linkHeight > boxScrollTop + boxHeight - 24) {
        tocBox.scrollTo({
          top: linkTop - boxHeight + linkHeight + 24,
          behavior: "smooth"
        });
      }
    }
  }

  let ticking = false;

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        activateLink();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", activateLink);

  activateLink();
});
