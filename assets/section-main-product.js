(function () {
  var form = document.querySelector("[data-fish-product-form]");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var submitter = e.submitter; // the actual button clicked (Add to Cart vs Buy It Now)
    if (submitter && submitter.name === "checkout") {
      // Let "Buy It Now" behave normally — real checkout redirect
      form.removeEventListener("submit", arguments.callee);
      HTMLFormElement.prototype.submit.call(form);
      return;
    }

    var formData = new FormData(form);
    var addBtn = form.querySelector(".fish-product__add-btn");
    if (addBtn) addBtn.disabled = true;

    fetch("/cart/add.js", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData,
    })
      .then(function (res) {
        if (!res.ok)
          return res.json().then(function (err) {
            throw err;
          });
        return res.json();
      })
      .then(function () {
        if (window.FishCartDrawer) {
          window.FishCartDrawer.refreshAndOpen();
        }
      })
      .catch(function (err) {
        console.error("Add to cart failed:", err);
        alert(err.description || "Couldn't add item to cart.");
      })
      .finally(function () {
        if (addBtn) addBtn.disabled = false;
      });
  });
})();
