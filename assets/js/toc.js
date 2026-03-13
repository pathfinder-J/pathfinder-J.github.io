document.addEventListener("DOMContentLoaded", function () {

  var toc = document.getElementById("toc");
  var content = document.querySelector(".post-content");

  if (!toc || !content) return;

  var headings = content.querySelectorAll("h2, h3");

  if (!headings.length) {
    toc.style.display = "none";
    return;
  }


  /* ===== HEADER ===== */

  var header = document.createElement("div");
  header.className = "post-toc-header";

  var title = document.createElement("div");
  title.className = "post-toc-title";
  title.textContent = "Contents";

  var toggleBtn = document.createElement("button");
  toggleBtn.className = "post-toc-toggle";
  toggleBtn.type = "button";
  toggleBtn.textContent = "Collapse";

  header.appendChild(title);
  header.appendChild(toggleBtn);

  toc.appendChild(header);


  /* ===== BODY ===== */

  var body = document.createElement("div");
  body.className = "post-toc-body";

  var ul = document.createElement("ul");
  ul.className = "post-toc-list";


  /* ===== BUILD LIST ===== */

  headings.forEach(function (heading, index) {

    if (!heading.id) {
      heading.id = "section-" + (index + 1);
    }

    var li = document.createElement("li");

    if (heading.tagName.toLowerCase() === "h3") {
      li.className = "toc-h3";
    } else {
      li.className = "toc-h2";
    }

    var a = document.createElement("a");
    a.href = "#" + heading.id;
    a.textContent = heading.textContent;

    li.appendChild(a);
    ul.appendChild(li);

  });


  body.appendChild(ul);
  toc.appendChild(body);


  /* ===== TOGGLE ===== */

  toggleBtn.addEventListener("click", function () {

    var collapsed = toc.classList.toggle("is-collapsed");

    if (collapsed) {
      toggleBtn.textContent = "Expand";
    } else {
      toggleBtn.textContent = "Collapse";
    }

  });

});
