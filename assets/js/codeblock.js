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
      wrapper.querySelector(".highlight pre") ||
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
    return (
      wrapper.querySelector(".rouge-code pre") ||
      wrapper.querySelector(".highlight pre") ||
      wrapper.querySelector("pre")
    );
  }

  function ensureShell(wrapper) {
    var shell = wrapper.parentElement;
    if (!shell || !shell.classList.contains("code-block-shell")) {
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

  function ensureLangBadge(container, lang) {
    var badge = container.querySelector(":scope > .code-lang");
    if (!badge) {
      badge = document.createElement("div");
      badge.className = "code-lang";
      container.appendChild(badge);
    }

    if (lang) {
      badge.textContent = lang;
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }
  }

  function ensureStructure(container) {
    var existingScroll = container.querySelector(":scope > .code-scroll");
    if (existingScroll) {
      var existingViewport = existingScroll.querySelector(":scope > .code-viewport");
      if (existingViewport) {
        return { scroll: existingScroll, viewport: existingViewport };
      }
    }

    var nodesToMove = [];
    Array.from(container.childNodes).forEach(function (node) {
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
    container.appendChild(scroll);

    return { scroll: scroll, viewport: viewport };
  }

  function ensureCopyButton(toolbar, wrapper) {
    var copyBtn = toolbar.querySelector(".code-copy-btn");
    if (!copyBtn) {
      copyBtn = document.createElement("button");
      copyBtn.className = "code-copy-btn";
      copyBtn.type = "button";
      copyBtn.textContent = "Copy";

      copyBtn.addEventListener("click", async function () {
        var source = getCopySource(wrapper);
        if (!source) return;

        var text = source.innerText || source.textContent || "";

        try {
          await navigator.clipboard.writeText(text);
          copyBtn.textContent = "Copied";
          copyBtn.classList.add("copied");
        } catch (e) {
          var ta = document.createElement("textarea");
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          try {
            document.execCommand("copy");
            copyBtn.textContent = "Copied";
            copyBtn.classList.add("copied");
          } catch (_) {
            copyBtn.textContent = "Failed";
          }
          document.body.removeChild(ta);
        }

        setTimeout(function () {
          copyBtn.textContent = "Copy";
          copyBtn.classList.remove("copied");
        }, 1200);
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

  function setupBlock(wrapper) {
    var container = wrapper.querySelector(".highlight") || wrapper;
    if (!container) return;

    var shell = ensureShell(wrapper);
    var toolbar = ensureToolbar(shell);
    var lang = detectLanguage(wrapper);
    ensureLangBadge(container, lang);

    var structure = ensureStructure(container);
    var scroll = structure.scroll;
    var viewport = structure.viewport;

    var copyBtn = ensureCopyButton(toolbar, wrapper);
    var toggleBtn = ensureToggleButton(toolbar, copyBtn);

    var measureTarget = getMeasureTarget(wrapper, viewport);
    var lineHeight = getLineHeight(measureTarget);
    var collapsedHeight = Math.round(lineHeight * MAX_LINES);
    var fullHeight = viewport.scrollHeight;

    if (fullHeight <= collapsedHeight + 2) {
      shell.classList.add("is-short");
      container.classList.remove("is-collapsed");
      viewport.style.maxHeight = "";
      viewport.style.overflowY = "";
      toggleBtn.style.display = "none";
    } else {
      shell.classList.remove("is-short");
      toggleBtn.style.display = "inline-block";
      container.classList.add("is-collapsed");
      viewport.style.maxHeight = collapsedHeight + "px";
      viewport.style.overflowY = "hidden";
      toggleBtn.textContent = "Expand";

      toggleBtn.onclick = function () {
        var isCollapsed = container.classList.contains("is-collapsed");

        if (isCollapsed) {
          container.classList.remove("is-collapsed");
          viewport.style.maxHeight = "";
          viewport.style.overflowY = "";
          toggleBtn.textContent = "Collapse";
        } else {
          container.classList.add("is-collapsed");
          viewport.style.maxHeight = collapsedHeight + "px";
          viewport.style.overflowY = "hidden";
          toggleBtn.textContent = "Expand";
        }
      };
    }

    scroll.scrollLeft = 0;
  }

  document.querySelectorAll(".highlighter-rouge, pre > code").forEach(function (node) {
    var wrapper = node.classList.contains("highlighter-rouge")
      ? node
      : node.closest("pre");

    if (!wrapper) return;
    setupBlock(wrapper);
  });
});
