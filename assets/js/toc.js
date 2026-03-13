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
  toggleBtn.textContent = "Collapse";

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
    } else if (tag === "h3") {
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

  toggleBtn.addEventListener("click", function () {
    const collapsed = toc.classList.toggle("is-collapsed");
    toggleBtn.textContent = collapsed ? "Expand" : "Collapse";
  });

  items.forEach(function (item) {
    item.link.addEventListener("click", function (e) {
      e.preventDefault();

      const target = document.getElementById(
        this.getAttribute("href").slice(1)
      );

      if (!target) return;

      const y = target.getBoundingClientRect().top + window.scrollY - 80;

      window.scrollTo({
        top: y,
        behavior: "smooth"
      });
    });
  });

  function activateLink() {
    let current = null;

    items.forEach(function (item) {
      const rect = item.heading.getBoundingClientRect();
      if (rect.top <= 120) {
        current = item;
      }
    });

    if (!current) {
      current = items[0];
    }

    items.forEach(function (item) {
      item.link.classList.remove("toc-active");
    });

    current.link.classList.add("toc-active");

    const tocBox = toc;

    const linkTop = current.link.offsetTop;
    const linkHeight = current.link.offsetHeight;
    const boxScrollTop = tocBox.scrollTop;
    const boxHeight = tocBox.clientHeight;

    if (linkTop < boxScrollTop + 40) {
      tocBox.scrollTo({
        top: Math.max(linkTop - 40, 0),
        behavior: "smooth"
      });
    } else if (linkTop + linkHeight > boxScrollTop + boxHeight - 40) {
      tocBox.scrollTo({
        top: linkTop - boxHeight + linkHeight + 40,
        behavior: "smooth"
      });
    }
  }

  window.addEventListener("scroll", activateLink, { passive: true });
  activateLink();
});
