document.addEventListener("DOMContentLoaded", function () {
  var COLLAPSED_HEIGHT = 260;

  function wrapBlock(wrapper) {
    if (!wrapper) return null;

    var shell = wrapper.parentElement;
    if (!shell || !shell.classList.contains("code-block-shell")) {
      shell = document.createElement("div");
      shell.className = "code-block-shell";
      wrapper.parentNode.insertBefore(shell, wrapper);
      shell.appendChild(wrapper);
    }

    return shell;
  }

  function ensureLangLabel(shell, wrapper) {
    var lang = wrapper.getAttribute("data-lang") || wrapper.dataset.lang || "";
    var langLabel = shell.querySelector(".code-lang");

    if (!lang) {
      if (langLabel) langLabel.remove();
      return null;
    }

    if (!langLabel) {
      langLabel = document.createElement("span");
      langLabel.className = "code-lang";
      shell.appendChild(langLabel);
    }

    langLabel.textContent = lang;
    return langLabel;
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

  function ensureToggleButton(toolbar) {
    var toggleBtn = toolbar.querySelector(".code-toggle-btn");
    if (!toggleBtn) {
      toggleBtn = document.createElement("button");
      toggleBtn.className = "code-toggle-btn";
      toggleBtn.type = "button";
      toggleBtn.textContent = "Expand";
      toolbar.appendChild(toggleBtn);
    }
    return toggleBtn;
  }

  function ensureCopyButton(toolbar) {
    var copyBtn = toolbar.querySelector(".code-copy-btn");
    if (!copyBtn) {
      copyBtn = document.createElement("button");
      copyBtn.className = "code-copy-btn";
      copyBtn.type = "button";
      copyBtn.textContent = "Copy";
      toolbar.appendChild(copyBtn);
    }
    return copyBtn;
  }

  function ensureViewport(highlight) {
    var scroll = highlight.querySelector(":scope > .code-scroll");
    var viewport = highlight.querySelector(":scope > .code-scroll > .code-viewport");

    if (scroll && viewport) {
      return { scroll: scroll, viewport: viewport };
    }

    var oldNodes = Array.from(highlight.childNodes);

    scroll = document.createElement("div");
    scroll.className = "code-scroll";

    viewport = document.createElement("div");
    viewport.className = "code-viewport";

    oldNodes.forEach(function (node) {
      viewport.appendChild(node);
    });

    scroll.appendChild(viewport);
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
