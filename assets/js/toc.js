document.addEventListener("DOMContentLoaded", function () {
  var toc = document.getElementById("toc");
  var content = document.querySelector(".post-content");

  if (!toc || !content) return;

  var headings = content.querySelectorAll("h2, h3");
  if (!headings.length) {
    toc.style.display = "none";
    return;
  }

  var title = document.createElement("div");
  title.className = "post-toc-title";
  title.textContent = "Contents";
  toc.appendChild(title);

  var ul = document.createElement("ul");
  ul.className = "post-toc-list";

  headings.forEach(function (heading, index) {
    if (!heading.id) {
      heading.id = "section-" + (index + 1);
    }

    var li = document.createElement("li");
    li.className = heading.tagName.toLowerCase() === "h3" ? "toc-h3" : "toc-h2";

    var a = document.createElement("a");
    a.href = "#" + heading.id;
    a.textContent = heading.textContent;

    li.appendChild(a);
    ul.appendChild(li);
  });

  toc.appendChild(ul);
});
