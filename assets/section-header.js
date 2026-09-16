(function () {
  var wrap = document.getElementById("header-search-wrap");
  var toggleBtn = document.getElementById("header-search-toggle");
  var closeBtn = document.getElementById("header-search-close");
  var input = document.getElementById("header-search-input");
  var resultsEl = document.getElementById("header-search-results");

  if (!wrap || !toggleBtn || !input || !resultsEl) return;

  var debounceTimer = null;
  var currentQuery = "";

  function openPanel() {
    wrap.setAttribute("data-open", "true");
    toggleBtn.setAttribute("aria-expanded", "true");
    setTimeout(function () {
      input.focus();
    }, 200); // wait for the width transition so focus doesn't jump
  }

  function closePanel() {
    wrap.setAttribute("data-open", "false");
    toggleBtn.setAttribute("aria-expanded", "false");
    resultsEl.hidden = true;
    resultsEl.innerHTML = "";
    input.value = "";
  }

  function isOpen() {
    return wrap.getAttribute("data-open") === "true";
  }

  toggleBtn.addEventListener("click", function () {
    isOpen() ? closePanel() : openPanel();
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closePanel);
  }

  document.addEventListener("click", function (e) {
    if (!isOpen()) return;
    if (wrap.contains(e.target)) return;
    closePanel();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen()) {
      closePanel();
      toggleBtn.focus();
    }
  });

  function renderStatus(message) {
    resultsEl.hidden = false;
    resultsEl.innerHTML =
      '<p class="header__search-status">' + message + "</p>";
  }

  function renderResults(products, query) {
    if (!products.length) {
      renderStatus('No results for "' + query + '"');
      return;
    }

    var html = products
      .map(function (product) {
        var image = product.image
          ? '<img class="header__search-result-image" src="' +
            product.image +
            '" alt="' +
            escapeHtml(product.title) +
            '">'
          : '<div class="header__search-result-image"></div>';

        return (
          '<a class="header__search-result" href="' +
          product.url +
          '">' +
          image +
          '<div class="header__search-result-info">' +
          '<span class="header__search-result-title">' +
          escapeHtml(product.title) +
          "</span>" +
          '<span class="header__search-result-price">' +
          product.price +
          "</span>" +
          "</div>" +
          "</a>"
        );
      })
      .join("");

    html +=
      '<a class="header__search-viewall" href="/search?q=' +
      encodeURIComponent(query) +
      '&type=product">View all results</a>';

    resultsEl.hidden = false;
    resultsEl.innerHTML = html;
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function fetchResults(query) {
    var url =
      (window.Shopify && window.Shopify.routes && window.Shopify.routes.root
        ? window.Shopify.routes.root
        : "/") +
      "search/suggest.json?q=" +
      encodeURIComponent(query) +
      "&resources[type]=product&resources[limit]=6&resources[options][unavailable_products]=last";

    fetch(url, { headers: { Accept: "application/json" } })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (query !== currentQuery) return;

        var products =
          (data.resources &&
            data.resources.results &&
            data.resources.results.products) ||
          [];

        var mapped = products.map(function (p) {
          return {
            title: p.title,
            url: p.url,
            image: p.image || p.featured_image,
            price: p.price,
          };
        });

        renderResults(mapped, query);
      })
      .catch(function () {
        if (query === currentQuery) {
          renderStatus("Something went wrong. Try again.");
        }
      });
  }

  input.addEventListener("input", function () {
    var query = input.value.trim();
    currentQuery = query;

    clearTimeout(debounceTimer);

    if (query.length < 2) {
      resultsEl.hidden = true;
      resultsEl.innerHTML = "";
      return;
    }

    renderStatus("Searching…");

    debounceTimer = setTimeout(function () {
      fetchResults(query);
    }, 300);
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      var firstResult = resultsEl.querySelector(".header__search-result");
      if (firstResult) {
        window.location.href = firstResult.getAttribute("href");
      }
    }
  });
})();
