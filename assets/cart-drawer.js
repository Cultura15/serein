(function () {
  var drawer = document.getElementById("fish-cart-drawer");
  if (!drawer) return;

  function openDrawer() {
    drawer.setAttribute("data-open", "true");
  }

  function closeDrawer() {
    drawer.setAttribute("data-open", "false");
  }

  document.querySelectorAll("[data-fish-cart-close]").forEach(function (el) {
    el.addEventListener("click", closeDrawer);
  });

  var cartIcon = document.getElementById("cart-icon-bubble");
  if (cartIcon) {
    cartIcon.addEventListener("click", function (e) {
      e.preventDefault();
      refreshDrawer(false); // just resync content, no need to force-open twice
      openDrawer();
    });
  }

  // Pulls fresh HTML for this section and swaps the panel's innerHTML
  function refreshDrawer(shouldOpen) {
    var url = window.location.pathname + "?section_id=cart-drawer";

    return fetch(url)
      .then(function (res) {
        return res.text();
      })
      .then(function (html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, "text/html");
        var freshDrawer = doc.getElementById("fish-cart-drawer");
        if (!freshDrawer) return;

        drawer.innerHTML = freshDrawer.innerHTML;
        rebindDrawerEvents();
        updateCartIconBubble();

        if (shouldOpen) openDrawer();
      });
  }

  function updateCartIconBubble() {
    var countEl = drawer.querySelector("[data-fish-cart-count]");
    var bubble = document.querySelector(".header__icon-bubble");
    if (!countEl || !bubble) return;
    var match = countEl.textContent.match(/\d+/);
    if (match) bubble.textContent = match[0];
  }

  // Re-attach close button + qty/remove handlers after innerHTML swap
  function rebindDrawerEvents() {
    drawer.querySelectorAll("[data-fish-cart-close]").forEach(function (el) {
      el.addEventListener("click", closeDrawer);
    });
  }

  function changeLine(line, quantity) {
    fetch("/cart/change.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ line: line, quantity: quantity }),
    }).then(function () {
      return refreshDrawer(true);
    });
  }

  drawer.addEventListener("click", function (e) {
    var minus = e.target.closest("[data-fish-cart-minus]");
    var plus = e.target.closest("[data-fish-cart-plus]");
    var remove = e.target.closest("[data-fish-cart-remove]");

    if (minus) {
      var line = minus.getAttribute("data-line");
      var qtyEl = minus.parentElement.querySelector("[data-fish-cart-qty]");
      changeLine(line, Math.max(0, parseInt(qtyEl.textContent, 10) - 1));
    }
    if (plus) {
      var line2 = plus.getAttribute("data-line");
      var qtyEl2 = plus.parentElement.querySelector("[data-fish-cart-qty]");
      changeLine(line2, parseInt(qtyEl2.textContent, 10) + 1);
    }
    if (remove) {
      changeLine(remove.getAttribute("data-line"), 0);
    }
  });

  // Exposed globally so product-main.js (and any add-to-cart button anywhere) can call it
  window.FishCartDrawer = {
    open: openDrawer,
    close: closeDrawer,
    refresh: refreshDrawer,
    refreshAndOpen: function () {
      return refreshDrawer(true);
    },
  };
})();
