document.addEventListener("DOMContentLoaded", () => {
  const toc = document.getElementById("toc");
  const content = document.getElementById("post-content");

  if (!toc || !content) return;

  const headings = content.querySelectorAll("h1, h2, h3");
  if (headings.length === 0) {
    toc.innerHTML = "";
    return;
  }

  const ul = document.createElement("ul");

  headings.forEach((heading, index) => {
    if (!heading.id) {
      heading.id = `heading-${index}`;
    }

    const li = document.createElement("li");
    li.className = `toc-${heading.tagName.toLowerCase()}`;

    const a = document.createElement("a");
    a.href = `#${heading.id}`;
    a.textContent = heading.textContent;

    li.appendChild(a);
    ul.appendChild(li);
  });

  toc.innerHTML = "";
  toc.appendChild(ul);

  const links = toc.querySelectorAll("a");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        const activeLink = toc.querySelector(`a[href="#${id}"]`);
        if (!activeLink) return;

        if (entry.isIntersecting) {
          links.forEach(link => link.classList.remove("active"));
          activeLink.classList.add("active");
        }
      });
    },
    {
      rootMargin: "0px 0px -70% 0px",
      threshold: 0.1
    }
  );

  headings.forEach((heading) => observer.observe(heading));
});
