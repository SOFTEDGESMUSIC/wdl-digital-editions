/* default-book-view.js (self-hosted, Squarespace-safe) */

/* --------------- Hard overrides (run ASAP) --------------- */
// Force pdf.js worker (no more Squarespace /js/pdf.worker.js 404)
(function setPdfWorker() {
  try {
    if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://softedgesmusic.github.io/wdl-digital-editions/lib/flipbook/js/pdf.worker.js";
    }
    if (window.PDFJS && window.PDFJS.workerSrc === undefined) {
      window.PDFJS.workerSrc =
        "https://softedgesmusic.github.io/wdl-digital-editions/lib/flipbook/js/pdf.worker.js";
    }
  } catch (e) {
    console.warn("pdf.js worker override failed:", e);
  }
})();

// Ensure Font Awesome stylesheet comes from GitHub Pages
(function ensureFA() {
  var WANT = "https://softedgesmusic.github.io/wdl-digital-editions/lib/flipbook/css/font-awesome.min.css";
  try {
    var has = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .some(function (l) { return (l.href || "").indexOf("font-awesome.min.css") !== -1; });

    if (!has) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = WANT;
      document.head.appendChild(link);
    }

    // Guard against anything injecting a bad root-relative /css/font-awesome.min.css
    var mo = new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        (m.addedNodes || []).forEach(function (n) {
          if (n.tagName === "LINK" && n.rel === "stylesheet" && n.getAttribute("href") === "/css/font-awesome.min.css") {
            n.parentNode.removeChild(n);
          }
        });
      });
    });
    mo.observe(document.head, { childList: true, subtree: true });
  } catch (e) {
    console.warn("Font Awesome ensure failed:", e);
  }
})();

/* --------------- Template init function --------------- */
function init(container) {
  var instance;

  if (window.jQuery) {
    var $ = window.jQuery;

    instance = {
      floatWnd: container.find(".float-wnd"),
      binds: {
        showDropMenu: function (e) {
          e.preventDefault();
          var el = $(e.target);
          while (!el.hasClass("toggle") && el[0] && el[0].parentNode) {
            el = $(el[0].parentNode);
          }
          var menu = el.find(".menu");
          if (menu.hasClass("hidden")) {
            container.find(".ctrl .fnavbar .menu").addClass("hidden");
            menu.removeClass("hidden");
            e.stopPropagation();
          }
        },
        hideDropMenu: function () {
          container.find(".ctrl .fnavbar .menu").addClass("hidden");
        },
        pickFloatWnd: function (e) {
          if (instance.pos) {
            instance.binds.dropFloatWnd();
          } else {
            instance.pos = { x: e.pageX, y: e.pageY };
          }
        },
        moveFloatWnd: function (e) {
          if (!instance.pos) return;
          var dv = { x: e.pageX - instance.pos.x, y: e.pageY - instance.pos.y };
          var old = {
            x: parseInt(instance.floatWnd.css("left"), 10) || 0,
            y: parseInt(instance.floatWnd.css("top"), 10) || 0
          };
          instance.floatWnd.css("left", (old.x + dv.x) + "px").css("top", (old.y + dv.y) + "px");
          instance.pos = { x: e.pageX, y: e.pageY };
        },
        dropFloatWnd: function () {
          delete instance.pos;
        },
        jsCenter: function () {
          // center elements with .js-center horizontally within their parent
          var ns = container.find(".js-center");
          for (var i = 0; i < ns.length; ++i) {
            var n = $(ns[i]);
            var parentWidth = $(ns[i].parentNode).width();
            var width = n.width();
            n.css("left", (0.5 * (parentWidth - width)) + "px");
          }
        }
      },

      appLoaded: function () {
        // Called when the viewer app is ready
        instance.binds.jsCenter();
      },

      linkLoaded: function () {
        // Called when an internal link/load finishes
        instance.binds.jsCenter();
      },

      dispose: function () {
        container.find(".ctrl .fnavbar .fnav .toggle").off("click", instance.binds.showDropMenu);
        $(container[0].ownerDocument).off("click", instance.binds.hideDropMenu);

        $(container[0].ownerDocument).off("mousemove", instance.binds.moveFloatWnd);
        $(container[0].ownerDocument).off("mouseup", instance.binds.dropFloatWnd);
        instance.floatWnd.find(".header").off("mousedown", instance.binds.pickFloatWnd);

        $(container[0].ownerDocument.defaultView).off("resize", instance.binds.jsCenter);
      }
    };

    // Wire up events
    container.find(".ctrl .fnavbar .fnav .toggle").on("click", instance.binds.showDropMenu);
    $(container[0].ownerDocument).on("click", instance.binds.hideDropMenu);

    $(container[0].ownerDocument).on("mousemove", instance.binds.moveFloatWnd);
    $(container[0].ownerDocument).on("mouseup", instance.binds.dropFloatWnd);
    instance.floatWnd.find(".header").on("mousedown", instance.binds.pickFloatWnd);

    $(container[0].ownerDocument.defaultView).on("resize", instance.binds.jsCenter);

    // First layout pass
    instance.binds.jsCenter();
  } else {
    instance = { dispose: function () {} };
    console.error("jQuery is not found");
  }

  return instance;
}

// Ensure the plugin loader can see init in all contexts
window.init = init;
