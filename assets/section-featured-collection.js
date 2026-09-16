document.querySelectorAll("[data-fish-slider]").forEach(function (slider) {
  var wrap = slider.closest(".fish-collection__slider-outer");
  var prevBtn = wrap.querySelector("[data-fish-slider-prev]");
  var nextBtn = wrap.querySelector("[data-fish-slider-next]");

  function scrollByCard(direction) {
    var card = slider.querySelector(".fish-collection__card");
    if (!card) return;
    var gap = 24;
    var amount = (card.getBoundingClientRect().width + gap) * direction;
    slider.scrollBy({ left: amount, behavior: "smooth" });
  }

  function updateButtons() {
    var maxScroll = slider.scrollWidth - slider.clientWidth - 1;
    prevBtn.disabled = slider.scrollLeft <= 0;
    nextBtn.disabled = slider.scrollLeft >= maxScroll;
  }

  prevBtn.addEventListener("click", function () {
    scrollByCard(-1);
  });
  nextBtn.addEventListener("click", function () {
    scrollByCard(1);
  });
  slider.addEventListener("scroll", updateButtons);
  window.addEventListener("resize", updateButtons);

  updateButtons();
});
