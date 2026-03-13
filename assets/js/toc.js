document.addEventListener("DOMContentLoaded", () => {
  const toc = document.getElementById("toc");
  const content = document.getElementById("post-content");

  if (!toc || !content) return;

  const headings = Array.from(content.querySelectorAll("h2, h3"));
  if (headings.length === 0) {
    toc.innerHTML = "";
    return;
  }

  const ul = document.createElement("ul");

  let h1Count = 0;
  let h2Count = 0;
  let h3Count = 0;

  const headingInfo = [];

  headings.forEach((heading, index) => {
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
    } else if (tag === "h3") {
      h3Count += 1;
      if (h1Count > 0 && h2Count > 0) {
        number = `${h1Count}.${h2Count}.${h3Count}`;
      } else if (h2Count > 0) {
        number = `${h2Count}.${h3Count}`;
      } else {
        number = `${h3Count}`;
      }
    }

    headingInfo.push({
      heading,
      tag,
      number,
      title: heading.textContent.trim()
    });
  });

  /* 본문 heading 앞에도 번호 붙이기 */
  headingInfo.forEach(({ heading, number, title }) => {
    if (heading.dataset.numbered === "true") return;

    heading.textContent = "";

    const numSpan = document.createElement("span");
    numSpan.className = "heading-number";
    numSpan.textContent = number;

    const textSpan = document.createElement("span");
    textSpan.className = "heading-text";
    textSpan.textContent = title;

    heading.appendChild(numSpan);
    heading.appendChild(textSpan);
    heading.dataset.numbered = "true";
  });

  /* TOC 생성 */
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

  const setActive = (id) => {
    if (!id || activeId === id) return;
    activeId = id;

    links.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("active", isActive);
    });

    const activeLink = toc.querySelector(`a[href="#${id}"]`);
    if (activeLink) {
      activeLink.scrollIntoView({
        block: "nearest"
      });
    }
  };

  /* 현재 보고 있는 heading 계산 */
  const updateActiveHeading = () => {
    let current = headings[0];

    for (const heading of headings) {
      const rect = heading.getBoundingClientRect();
      if (rect.top <= 140) {
        current = heading;
      } else {
        break;
      }
    }

    if (current) {
      setActive(current.id);
    }
  };

  /* IntersectionObserver + scroll fallback 같이 사용 */
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (visible.length > 0) {
        setActive(visible[0].target.id);
      }
    },
    {
      rootMargin: "0px 0px -70% 0px",
      threshold: [0, 0.1, 0.25, 0.5, 1]
    }
  );

  headings.forEach((heading) => observer.observe(heading));

  window.addEventListener("scroll", updateActiveHeading, { passive: true });
  window.addEventListener("resize", updateActiveHeading);

  updateActiveHeading();
});
