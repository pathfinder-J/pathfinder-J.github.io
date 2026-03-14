document.addEventListener("DOMContentLoaded", function () {
  var glossary = window.GLOSSARY || {};
  var content = document.querySelector(".post-content");

  if (!content) return;

  var terms = Object.keys(glossary).filter(Boolean);
  if (!terms.length) return;

  terms.sort(function (a, b) {
    return b.length - a.length;
  });

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  var pattern = terms.map(escapeRegExp).join("|");
  var regex = new RegExp("\\b(" + pattern + ")\\b", "gi");

  function shouldSkipNode(node) {
    if (!node || !node.parentElement) return true;

    return Boolean(
      node.parentElement.closest(
        "a, pre, code, script, style, textarea, .code-toolbar, .MathJax, mjx-container"
      )
    );
  }

  function findUrl(matchedText) {
    if (glossary[matchedText]) return glossary[matchedText];

    var lower = matchedText.toLowerCase();
    for (var i = 0; i < terms.length; i++) {
      if (terms[i].toLowerCase() === lower) {
        return glossary[terms[i]];
      }
    }

    return null;
  }

  function replaceTextNode(node) {
    var text = node.nodeValue;
    if (!text || !text.trim()) return;
    if (shouldSkipNode(node)) return;
    if (!regex.test(text)) {
      regex.lastIndex = 0;
      return;
    }
    regex.lastIndex = 0;

    var frag = document.createDocumentFragment();
    var lastIndex = 0;
    var match;

    while ((match = regex.exec(text)) !== null) {
      var matchedText = match[0];
      var start = match.index;

      if (start > lastIndex) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex, start)));
      }

      var url = findUrl(matchedText);
      if (url) {
        var link = document.createElement("a");
        link.className = "glossary-link";
        link.href = url;
        link.textContent = matchedText;
        frag.appendChild(link);
      } else {
        frag.appendChild(document.createTextNode(matchedText));
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      frag.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    node.parentNode.replaceChild(frag, node);
  }

  var walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, null);
  var textNodes = [];

  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  textNodes.forEach(replaceTextNode);
});
