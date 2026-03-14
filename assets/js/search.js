document.addEventListener("DOMContentLoaded", function () {
  var input = document.getElementById("search-input");
  var results = document.getElementById("search-results");

  if (!input || !results) return;

  function makeSnippet(content, query) {
    var text = String(content || "").replace(/\s+/g, " ").trim();
    if (!text) return "";

    var lower = text.toLowerCase();
    var q = query.toLowerCase();
    var idx = lower.indexOf(q);

    if (idx === -1) {
      return text.slice(0, 160) + (text.length > 160 ? "..." : "");
    }

    var start = Math.max(0, idx - 60);
    var end = Math.min(text.length, idx + q.length + 100);
    var snippet = text.slice(start, end);

    if (start > 0) snippet = "..." + snippet;
    if (end < text.length) snippet += "...";

    return snippet;
  }

  function scoreDoc(doc, query) {
    var q = query.toLowerCase();
    var title = String(doc.title || "").toLowerCase();
    var content = String(doc.content || "").toLowerCase();

    var score = 0;
    if (title.includes(q)) score += 5;
    if (content.includes(q)) score += 1;
    return score;
  }

  function debounce(fn, delay) {
    var timer = null;
    return function () {
      var context = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  }

  fetch("/search.json")
    .then(function (res) {
      if (!res.ok) {
        throw new Error("Failed to load search index");
      }
      return res.json();
    })
    .then(function (docs) {
      function renderResults() {
        var q = input.value.trim().toLowerCase();
        results.innerHTML = "";

        if (!q) return;

        var matched = docs
          .filter(function (doc) {
            var title = String(doc.title || "").toLowerCase();
            var content = String(doc.content || "").toLowerCase();
            return title.includes(q) || content.includes(q);
          })
          .map(function (doc) {
            return {
              doc: doc,
              score: scoreDoc(doc, q)
            };
          })
          .sort(function (a, b) {
            return b.score - a.score;
          })
          .slice(0, 20);

        if (!matched.length) {
          var empty = document.createElement("p");
          empty.textContent = "검색 결과가 없습니다.";
          results.appendChild(empty);
          return;
        }

        matched.forEach(function (item) {
          var doc = item.doc;

          var container = document.createElement("div");
          container.className = "search-result-item";

          var title = document.createElement("a");
          title.href = doc.url;
          title.textContent = doc.title || "(제목 없음)";
          title.className = "search-result-title";

          var snippet = document.createElement("p");
          snippet.className = "search-result-snippet";
          snippet.textContent = makeSnippet(doc.content || "", q);

          container.appendChild(title);
          container.appendChild(snippet);
          results.appendChild(container);
        });
      }

      input.addEventListener("input", debounce(renderResults, 120));
    })
    .catch(function (err) {
      console.error(err);
      results.innerHTML = "";
      var error = document.createElement("p");
      error.textContent = "검색 인덱스를 불러오지 못했습니다.";
      results.appendChild(error);
    });
});
          if (!matched.length) {
            var empty = document.createElement("p");
            empty.textContent = "검색 결과가 없습니다.";
            results.appendChild(empty);
            return;
          }

          matched.forEach(function (item) {
            var doc = item.doc;

            var container = document.createElement("div");
            container.className = "search-result-item";

            var title = document.createElement("a");
            title.href = doc.url;
            title.textContent = doc.title || "(제목 없음)";
            title.className = "search-result-title";

            var snippet = document.createElement("p");
            snippet.className = "search-result-snippet";
            snippet.textContent = makeSnippet(doc.content || "", q);

            container.appendChild(title);
            container.appendChild(snippet);
            results.appendChild(container);
          });
        }

        input.addEventListener("input", SiteUtils.debounce(renderResults, 120));
      })
      .catch(function () {
        results.innerHTML = "";
        var error = document.createElement("p");
        error.textContent = "검색 인덱스를 불러오지 못했습니다.";
        results.appendChild(error);
      });
  }

  SiteUtils.ready(initSearch);
})();
