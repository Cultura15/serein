const bundleProducts = document.querySelectorAll(".bundle-product");
const bundleCount = document.querySelector("#bundle-count");
const bundleButton = document.querySelector("#bundle-add");

let selectedVariants = [];

bundleProducts.forEach((product) => {
  product.addEventListener("click", () => {
    const variantId = product.dataset.variantId;

    if (selectedVariants.includes(variantId)) {
      selectedVariants = selectedVariants.filter((id) => id !== variantId);

      product.classList.remove("selected");
    } else {
      if (selectedVariants.length >= 3) return;

      selectedVariants.push(variantId);
      product.classList.add("selected");
    }

    bundleCount.textContent = selectedVariants.length;

    bundleButton.disabled = selectedVariants.length !== 3;
  });
});

bundleButton?.addEventListener("click", async () => {
  const items = selectedVariants.map((variantId) => ({
    id: Number(variantId),
    quantity: 1,
  }));

  await fetch("/cart/add.js", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ items }),
  });

  window.location.href = "/cart";
});
