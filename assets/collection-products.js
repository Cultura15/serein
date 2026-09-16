// Accordion toggles (filter groups + sort dropdown)
document
  .querySelectorAll("[data-fish-accordion-toggle]")
  .forEach(function (btn) {
    btn.addEventListener("click", function () {
      var group = btn.closest("[data-fish-accordion]");
      if (group.hasAttribute("data-collapsed")) {
        group.toggleAttribute("data-collapsed");
      } else if (group.classList.contains("fish-sort")) {
        var isOpen = group.getAttribute("data-open") === "true";
        group.setAttribute("data-open", isOpen ? "false" : "true");
      }
    });
  });

// Close sort dropdown when clicking outside
document.addEventListener("click", function (e) {
  document
    .querySelectorAll('.fish-sort[data-open="true"]')
    .forEach(function (sort) {
      if (!sort.contains(e.target)) {
        sort.setAttribute("data-open", "false");
      }
    });
});

// Add to cart
document.querySelectorAll("[data-fish-add-to-cart]").forEach(function (btn) {
  btn.addEventListener("click", function () {
    var variantId = btn.getAttribute("data-variant-id");
    if (!variantId) return;

    btn.setAttribute("data-loading", "true");

    fetch("/cart/add.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: variantId, quantity: 1 }),
    })
      .then(function (res) {
        return res.json();
      })
      .then(function () {
        document.dispatchEvent(new CustomEvent("cart:updated"));
      })
      .catch(function (err) {
        console.error("Add to cart failed", err);
      })
      .finally(function () {
        btn.removeAttribute("data-loading");
      });
  });
});
