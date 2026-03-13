document.addEventListener("DOMContentLoaded", function () {

  const toc = document.getElementById("toc");
  const content = document.querySelector(".post-content");

  if (!toc || !content) return;

  const headings = content.querySelectorAll("h2, h3");
  if (!headings.length) {
    toc.style.display = "none";
    return;
  }

  /* ===== TOC HEADER ===== */

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

  /* ===== TOC BODY ===== */

  const body = document.createElement("div");
  body.className = "post-toc-body";

  const ul = document.createElement("ul");
  ul.className = "post-toc-list";

  const links = [];

  headings.forEach((heading, index) => {

    if (!heading.id) {
      heading.id = "section-" + (index + 1);
    }

    /* ===== anchor link (#) ===== */

    const anchor = document.createElement("a");
    anchor.href = "#" + heading.id;
    anchor.className = "heading-anchor";
    anchor.textContent = "#";

    heading.appendChild(anchor);

    /* ===== TOC entry ===== */

    const li = document.createElement("li");
    li.className = heading.tagName.toLowerCase() === "h3" ? "toc-h3" : "toc-h2";

    const a = document.createElement("a");
    a.href = "#" + heading.id;
    a.textContent = heading.textContent.replace("#", "");

    li.appendChild(a);
    ul.appendChild(li);

    links.push({
      link: a,
      heading: heading
    });

  });

  body.appendChild(ul);
  toc.appendChild(body);

  /* ===== TOC COLLAPSE ===== */

  toggleBtn.addEventListener("click", function () {

    const collapsed = toc.classList.toggle("is-collapsed");

    toggleBtn.textContent = collapsed ? "Expand" : "Collapse";

  });

  /* ===== SMOOTH SCROLL ===== */

  document.querySelectorAll('.post-toc a').forEach(anchor => {

    anchor.addEventListener("click", function(e){

      e.preventDefault();

      const target = document.querySelector(this.getAttribute("href"));

      if (!target) return;

      window.scrollTo({
        top: target.offsetTop - 80,
        behavior: "smooth"
      });

    });

  });

  /* ===== SCROLL SPY ===== */

  function activateLink() {

    let current = null;

    links.forEach(item => {

      const rect = item.heading.getBoundingClientRect();

      if (rect.top <= 120) {
        current = item;
      }

    });

    if (!current) return;

    links.forEach(item => {
      item.link.classList.remove("toc-active");
    });

    current.link.classList.add("toc-active");

    /* ===== AUTO SCROLL TOC ===== */

    const container = toc.querySelector(".post-toc-body");

    if (container) {

      const linkRect = current.link.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      if (
        linkRect.top < containerRect.top ||
        linkRect.bottom > containerRect.bottom
      ) {
        current.link.scrollIntoView({
          block: "center",
          behavior: "smooth"
        });
      }

    }

  }

  window.addEventListener("scroll", activateLink);

});
