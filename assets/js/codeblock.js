(function () {
  "use strict";

  var COLLAPSED_LINES = 10;

  function detectLanguage(wrapper) {
    var classes = Array.from(wrapper.classList || []);
    for (var i = 0; i < classes.length; i++) {
      if (classes[i].indexOf("language-") === 0) {
        return classes[i].replace("language-", "");
      }
    }

    var codeEl = wrapper.querySelector("code[class]");
    if (codeEl) {
      var codeClasses = Array.from(codeEl.classList || []);
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
    return (
      wrapper.querySelector(".rouge-code pre") ||
      wrapper.querySelector(".highlight pre") ||
      wrapper.querySelector("pre code") ||
      wrapper.querySelector("pre") ||
      wrapper.querySelector("code")
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
      badge.textContent = "";
      badge.style.display = "none";
    }
  }

  function ensureStructure(highlight) {
    var existingScroll = highlight.querySelector(":scope > .code-scroll");
    var existingViewport = existingScroll
      ? existingScroll.querySelector(":scope > .code-viewport")
      : null;

    if (existingScroll && existingViewport) {
      return { scroll: existingScroll, viewport: existingViewport };
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

  function ensureCopyButton(toolbar) {
    var btn = toolbar.querySelector(".code-copy-btn");
    if (!btn) {
      btn = document.createElement("button");
      btn.className = "code-copy-btn";
      btn.type = "button";
      btn.textContent = "Copy";
      toolbar.appendChild(btn);
    }
    return btn;
  }

  function ensureToggleButton(toolbar, copyBtn) {
    var btn = toolbar.querySelector(".code-toggle-btn");
    if (!btn) {
      btn = document.createElement("button");
      btn.className = "code-toggle-btn";
      btn.type = "button";
      btn.textContent = "Expand";
      toolbar.insertBefore(btn, copyBtn);
    }
    return btn;
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

  function fallbackCopy(text) {
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    var ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (e) {
      ok = false;
    }

    document.body.removeChild(textarea);
    return ok;
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () {
        if (!fallbackCopy(text)) {
          throw new Error("Clipboard copy failed");
        }
      });
    }

    return new Promise(function (resolve, reject) {
      if (fallbackCopy(text)) resolve();
      else reject(new Error("Clipboard copy failed"));
    });
  }

  function bindCopyButton(copyBtn, wrapper) {
    copyBtn.onclick = function () {
      var source = getCopySource(wrapper);
      if (!source) return;

      var text = source.innerText || source.textContent || "";

      copyText(text)
        .then(function () {
          copyBtn.textContent = "Copied";
          copyBtn.classList.add("copied");

          clearTimeout(copyBtn._resetTimer);
          copyBtn._resetTimer = setTimeout(function () {
            copyBtn.textContent = "Copy";
            copyBtn.classList.remove("copied");
          }, 1200);
        })
        .catch(function () {
          copyBtn.textContent = "Failed";

          clearTimeout(copyBtn._resetTimer);
          copyBtn._resetTimer = setTimeout(function () {
            copyBtn.textContent = "Copy";
            copyBtn.classList.remove("copied");
          }, 1200);
        });
    };
  }

  function bindToggleButton(toggleBtn, highlight, viewport, collapsedHeight) {
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

    var copyBtn = ensureCopyButton(toolbar);
    var toggleBtn = ensureToggleButton(toolbar, copyBtn);

    bindCopyButton(copyBtn, wrapper);

    var measureTarget = getMeasureTarget(wrapper, viewport);
    var lineHeight = getLineHeight(measureTarget);
    var collapsedHeight = Math.round(lineHeight * COLLAPSED_LINES);
    var fullHeight = viewport.scrollHeight;

    if (fullHeight <= collapsedHeight + 2) {
      shell.classList.add("is-short");
      highlight.classList.remove("is-collapsed");
      viewport.style.maxHeight = "";
      viewport.style.overflowY = "";
      toggleBtn.style.display = "none";
      toggleBtn.onclick = null;
      toggleBtn.textContent = "Expand";
    } else {
      shell.classList.remove("is-short");
      toggleBtn.style.display = "inline-block";
      highlight.classList.add("is-collapsed");
      viewport.style.maxHeight = collapsedHeight + "px";
      viewport.style.overflowY = "hidden";
      toggleBtn.textContent = "Expand";
      bindToggleButton(toggleBtn, highlight, viewport, collapsedHeight);
    }

    scroll.scrollLeft = 0;
  }

  function initCodeBlocks() {
    document.querySelectorAll(".highlighter-rouge").forEach(function (wrapper) {
      setupBlock(wrapper);
    });
  }

  SiteUtils.ready(initCodeBlocks);
  window.addEventListener("resize", SiteUtils.debounce(initCodeBlocks, 120));
})();    scroll.appendChild(viewport);
    highlight.appendChild(scroll);

    return { scroll: scroll, viewport: viewport };
  }

  function getCopySource(wrapper) {
    return (
      wrapper.querySelector(".rouge-code pre") ||
      wrapper.querySelector(".highlight pre") ||
      wrapper.querySelector("pre code") ||
      wrapper.querySelector("code")
    );
  }

  function fallbackCopyText(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();

    var ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (e) {
      ok = false;
    }

    document.body.removeChild(ta);
    return ok;
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () {
        if (fallbackCopyText(text)) return;
        throw new Error("Clipboard copy failed");
      });
    }

    return new Promise(function (resolve, reject) {
      if (fallbackCopyText(text)) resolve();
      else reject(new Error("Clipboard copy failed"));
    });
  }

  function setCopyButtonState(copyBtn, state) {
    if (!copyBtn) return;

    if (copyBtn._resetTimer) {
      clearTimeout(copyBtn._resetTimer);
      copyBtn._resetTimer = null;
    }

    if (state === "copied") {
      copyBtn.textContent = "Copied";
      copyBtn.classList.add("copied");
    } else if (state === "failed") {
      copyBtn.textContent = "Failed";
      copyBtn.classList.remove("copied");
    } else {
      copyBtn.textContent = "Copy";
      copyBtn.classList.remove("copied");
    }
  }

  function bindCopyButton(copyBtn, wrapper) {
    copyBtn.onclick = function () {
      var source = getCopySource(wrapper);
      if (!source) {
        setCopyButtonState(copyBtn, "failed");
        copyBtn._resetTimer = setTimeout(function () {
          setCopyButtonState(copyBtn, "default");
        }, 1200);
        return;
      }

      var text = source.innerText || source.textContent || "";

      copyText(text)
        .then(function () {
          setCopyButtonState(copyBtn, "copied");
          copyBtn._resetTimer = setTimeout(function () {
            setCopyButtonState(copyBtn, "default");
          }, 1200);
        })
        .catch(function (err) {
          console.error(err);
          setCopyButtonState(copyBtn, "failed");
          copyBtn._resetTimer = setTimeout(function () {
            setCopyButtonState(copyBtn, "default");
          }, 1200);
        });
    };
  }

  function bindToggleButton(toggleBtn, highlight, viewport, collapsedHeight) {
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

  function refreshBlock(wrapper) {
    if (!wrapper) return;

    var shell = wrapBlock(wrapper);
    if (!shell) return;

    ensureLangLabel(shell, wrapper);

    var highlight = wrapper.querySelector(".highlight");
    if (!highlight) return;

    var toolbar = ensureToolbar(shell);
    var toggleBtn = ensureToggleButton(toolbar);
    var copyBtn = ensureCopyButton(toolbar);

    var viewportParts = ensureViewport(highlight);
    var viewport = viewportParts.viewport;

    bindCopyButton(copyBtn, wrapper);

    highlight.classList.remove("is-collapsed");
    viewport.style.maxHeight = "";
    viewport.style.overflowY = "";

    var fullHeight = viewport.scrollHeight;
    var collapsedHeight = COLLAPSED_HEIGHT;

    if (fullHeight <= collapsedHeight + 2) {
      shell.classList.add("is-short");
      toggleBtn.style.display = "none";
      toggleBtn.onclick = null;
      toggleBtn.textContent = "Expand";
      highlight.classList.remove("is-collapsed");
      viewport.style.maxHeight = "";
      viewport.style.overflowY = "";
    } else {
      shell.classList.remove("is-short");
      toggleBtn.style.display = "inline-block";
      highlight.classList.add("is-collapsed");
      viewport.style.maxHeight = collapsedHeight + "px";
      viewport.style.overflowY = "hidden";
      toggleBtn.textContent = "Expand";
      bindToggleButton(toggleBtn, highlight, viewport, collapsedHeight);
    }
  }

  function refreshAllBlocks() {
    document.querySelectorAll(".highlighter-rouge").forEach(function (wrapper) {
      refreshBlock(wrapper);
    });
  }

  refreshAllBlocks();

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      refreshAllBlocks();
    }, 120);
  });
});
