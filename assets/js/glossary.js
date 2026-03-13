(function () {
  "use strict";

  function shouldSkipNode(node) {
    if (!node || !node.parentElement) return true;

    var parent = node.parentElement;

    return Boolean(
      parent.closest(
        "a, pre, code, script, style, textarea, .code-toolbar, .MathJax, mjx-container"
      )
    );
  }

  function buildGlossaryRegex(glossary) {
    var terms = Object.keys(glossary || {}).filter(Boolean);

    if (!terms.length) return null;

    terms.sort(function (a, b) {
      return b.length - a.length;
    });

    var pattern = terms
      .map(function (term) {
        return SiteUtils.escapeRegExp(term);
      })
      .join("|");

    return new RegExp("\\b(" + pattern + ")\\b", "gi");
  }

  function replaceTextNode(node, glossary, regex) {
    if (!node.nodeValue || !node.nodeValue.trim()) return;
    if (shouldSkipNode(node)) return;
    if (!regex.test(node.nodeValue)) {
      regex.lastIndex = 0;
      return;
    }
    regex.lastIndex = 0;

    var text = node.nodeValue;
    var frag = document.createDocumentFragment();
    var lastIndex = 0;
    var match;

    while ((match = regex.exec(text)) !== null) {
      var matchedText = match[0];
      var start = match.index;

      if (start > lastIndex) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex, start)));
      }

      var url = glossary[matchedText] || glossary[matchedText.toLowerCase()] || glossary[matchedText.toUpperCase()];
      if (!url) {
        var exactKey = Object.keys(glossary).find(function (key) {
          return key.toLowerCase() === matchedText.toLowerCase();
        });
        url = exactKey ? glossary[exactKey] : null;
      }

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

  function walkTextNodes(root, glossary, regex) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var textNodes = [];

    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    textNodes.forEach(function (node) {
      replaceTextNode(node, glossary, regex);
    });
  }

  function initGlossary() {
    var glossary = window.GLOSSARY || {};
    var content = document.querySelector(".post-content");
    if (!content) return;

    var regex = buildGlossaryRegex(glossary);
    if (!regex) return;

    walkTextNodes(content, glossary, regex);
  }

  SiteUtils.ready(initGlossary);
})();
