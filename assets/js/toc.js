document.addEventListener("DOMContentLoaded", () => {
  const content = document.getElementById("post-content");
  const toc = document.getElementById("toc");

  if (!content || !toc) return;

  const headings = content.querySelectorAll("h1, h2, h3");
  if (headings.length === 0) return;

  const ul = document.createElement("ul");

  headings.forEach((heading, index) => {
    if (!heading.id) {
      heading.id = `heading-${index}`;
    }

    const li = document.createElement("li");
    li.classList.add(`toc-${heading.tagName.toLowerCase()}`);

    const a = document.createElement("a");
    a.href = `#${heading.id}`;
    a.textContent = heading.textContent;

    li.appendChild(a);
    ul.appendChild(li);
  });

  toc.appendChild(ul);

  const tocLinks = toc.querySelectorAll("a");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        const link = toc.querySelector(`a[href="#${id}"]`);
        if (!link) return;

        if (entry.isIntersecting) {
          tocLinks.forEach((l) => l.classList.remove("active"));
          link.classList.add("active");
        }
      });
    },
    {
      rootMargin: "0px 0px -70% 0px",
      threshold: 0.1,
    }
  );

  headings.forEach((heading) => observer.observe(heading));
});
