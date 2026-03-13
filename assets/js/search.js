document.addEventListener("DOMContentLoaded", function () {
  var input = document.getElementById("search-input");
  var results = document.getElementById("search-results");

  if (!input || !results) return;

  fetch("/search.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (docs) {
      input.addEventListener("input", function () {
        var q = input.value.trim().toLowerCase();
        results.innerHTML = "";

        if (!q) return;

        var matched = docs.filter(function (doc) {
          return (
            doc.title.toLowerCase().includes(q) ||
            doc.content.toLowerCase().includes(q)
          );
        }).slice(0, 20);

        if (!matched.length) {
          results.innerHTML = "<p>검색 결과가 없습니다.</p>";
          return;
        }

        matched.forEach(function (doc) {
          var item = document.createElement("div");
          item.className = "search-result-item";

          var title = document.createElement("a");
          title.href = doc.url;
          title.textContent = doc.title;
          title.className = "search-result-title";

          var snippet = document.createElement("p");
          snippet.className = "search-result-snippet";
          snippet.textContent = doc.content.slice(0, 160) + "...";

          item.appendChild(title);
          item.appendChild(snippet);
          results.appendChild(item);
        });
      });
    });
});
