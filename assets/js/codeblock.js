document.addEventListener("DOMContentLoaded", function () {
  var MAX_LINES = 10;

  function detectLanguage(wrapper) {
    var classes = Array.from(wrapper.classList);
    for (var i = 0; i < classes.length; i++) {
      if (classes[i].indexOf("language-") === 0) {
        return classes[i].replace("language-", "");
      }
    }

    var codeEl = wrapper.querySelector("code[class]");
    if (codeEl) {
      var codeClasses = Array.from(codeEl.classList);
      for (var j = 0; j < codeClasses.length; j++) {
        if (codeClasses[j].indexOf("language-") === 0) {
          return codeClasses[j].replace("language-", "");
        }
      }
    }

    return "";
  }

  function getMeasureTarget(wrapper, viewport) {
    return (
      wrapper.querySelector(".rouge-code pre") ||
      wrapper.querySelector("pre") ||
      viewport
    );
  }

  function getLineHeight(el) {
    var style = window.getComputedStyle(el);
    var lineHeight = parseFloat(style.lineHeight);

    if (isNaN(lineHeight)) {
      var fontSize = parseFloat(style.fontSize) || 14;
      lineHeight = fontSize * 1.5;
    }

    return lineHeight;
  }

  function getCopySource(wrapper) {
    return wrapper.querySelector(".rouge-code pre") || wrapper.querySelector("pre");
  }

  function ensureShell(wrapper) {
    var shell = wrapper.parentElement;
    if (!shell.classList.contains("code-block-shell")) {
      shell = document.createElement("div");
      shell.className = "code-block-shell";
      wrapper.parentNode.insertBefore(shell, wrapper);
      shell.appendChild(wrapper);
    }
    return shell;
  }

  function ensureToolbar(shell) {
    var toolbar = shell.querySelector(".code-toolbar");
    if (!toolbar) {
      toolbar = document.createElement("div");
      toolbar.className = "code-toolbar";
      shell.appendChild(toolbar);
    }
    return toolbar;
  }

  function ensureLangBadge(highlight, lang) {
    var badge = highlight.querySelector(":scope > .code-lang");
    if (!badge) {
      badge = document.createElement("div");
      badge.className = "code-lang";
      highlight.appendChild(badge);
    }

    if (lang) {
      badge.textContent = lang;
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }
  }

  function ensureStructure(highlight) {
    var existingScroll = highlight.querySelector(":scope > .code-scroll");
    if (existingScroll) {
      var existingViewport = existingScroll.querySelector(":scope > .code-viewport");
      if (existingViewport) {
        return { scroll: existingScroll, viewport: existingViewport };
      }
    }

    var nodesToMove = [];
    Array.from(highlight.childNodes).forEach(function (node) {
      if (
        node.nodeType === 1 &&
        node.classList &&
        node.classList.contains("code-lang")
      ) {
        return;
      }
      nodesToMove.push(node);
    });

    var scroll = document.createElement("div");
    scroll.className = "code-scroll";

    var viewport = document.createElement("div");
    viewport.className = "code-viewport";

    nodesToMove.forEach(function (node) {
      viewport.appendChild(node);
    });

    scroll.appendChild(viewport);
    highlight.appendChild(scroll);

    return { scroll: scroll, viewport: viewport };
  }

  function ensureCopyButton(toolbar, wrapper) {
    var copyBtn = toolbar.querySelector(".code-copy-btn");
    if (!copyBtn) {
      copyBtn = document.createElement("button");
      copyBtn.className = "code-copy-btn";
      copyBtn.type = "button";
      copyBtn.textContent = "Copy";

      copyBtn.addEventListener("click", function () {
        var source = getCopySource(wrapper);
        if (!source) return;

        navigator.clipboard.writeText(source.innerText).then(function () {
          copyBtn.textContent = "Copied";
          copyBtn.classList.add("copied");

          setTimeout(function () {
            copyBtn.textContent = "Copy";
            copyBtn.classList.remove("copied");
          }, 1200);
        }).catch(function () {
          copyBtn.textContent = "Failed";
          setTimeout(function () {
            copyBtn.textContent = "Copy";
          }, 1200);
        });
      });

      toolbar.appendChild(copyBtn);
    }

    return copyBtn;
  }

  function ensureToggleButton(toolbar, copyBtn) {
    var toggleBtn = toolbar.querySelector(".code-toggle-btn");
    if (!toggleBtn) {
      toggleBtn = document.createElement("button");
      toggleBtn.className = "code-toggle-btn";
      toggleBtn.type = "button";
      toggleBtn.textContent = "Expand";
      toolbar.insertBefore(toggleBtn, copyBtn);
    }
    return toggleBtn;
  }

  function forceHorizontalOverflow(wrapper, viewport) {
    var pre = wrapper.querySelector(".rouge-code pre") || wrapper.querySelector("pre");
    var table = wrapper.querySelector(".rouge-table");
    var codeCell = wrapper.querySelector(".rouge-code");

    viewport.style.width = "100%";
    viewport.style.minWidth = "0";

    if (pre) {
      pre.style.whiteSpace = "pre";
      pre.style.display = "inline-block";
      pre.style.minWidth = "100%";
      pre.style.width = "";
    }

    if (table) {
      table.style.display = "inline-table";
      table.style.minWidth = "100%";
      table.style.width = "";
    }

    if (codeCell) {
      codeCell.style.whiteSpace = "pre";
    }
  }

  function setupBlock(wrapper) {
    var highlight = wrapper.querySelector(".highlight");
    if (!highlight) return;

    var shell = ensureShell(wrapper);
    var toolbar = ensureToolbar(shell);
    var lang = detectLanguage(wrapper);
    ensureLangBadge(highlight, lang);

    var structure = ensureStructure(highlight);
    var scroll = structure.scroll;
    var viewport = structure.viewport;

    forceHorizontalOverflow(wrapper, viewport);

    var copyBtn = ensureCopyButton(toolbar, wrapper);
    var toggleBtn = ensureToggleButton(toolbar, copyBtn);

    var measureTarget = getMeasureTarget(wrapper, viewport);
    var lineHeight = getLineHeight(measureTarget);
    var collapsedHeight = Math.round(lineHeight * MAX_LINES);
    var fullHeight = viewport.scrollHeight;

    if (fullHeight <= collapsedHeight + 2) {
      shell.classList.add("is-short");
      highlight.classList.remove("is-collapsed");
      viewport.style.maxHeight = "";
      viewport.style.overflowY = "";
      toggleBtn.style.display = "none";
    } else {
      shell.classList.remove("is-short");
      toggleBtn.style.display = "inline-block";
      highlight.classList.add("is-collapsed");
      viewport.style.maxHeight = collapsedHeight + "px";
      viewport.style.overflowY = "hidden";
      toggleBtn.textContent = "Expand";

      toggleBtn.onclick = function () {
        var isCollapsed = highlight.classList.contains("is-collapsed");

        if (isCollapsed) {
          highlight.classList.remove("is-collapsed");
          viewport.style.maxHeight = "";
          viewport.style.overflowY = "";
          toggleBtn.textContent = "Collapse";
        } else {
          highlight.classList.add("is-collapsed");
          viewport.style.maxHeight = collapsedHeight + "px";
          viewport.style.overflowY = "hidden";
          toggleBtn.textContent = "Expand";
        }
      };
    }

    scroll.scrollLeft = 0;
  }

  document.querySelectorAll(".highlighter-rouge").forEach(function (wrapper) {
    setupBlock(wrapper);
  });
});
