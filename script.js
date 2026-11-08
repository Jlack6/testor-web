(function () {
  var root = document.documentElement;
  var themeButton = document.querySelector(".theme-toggle");
  var menuButton = document.querySelector(".menu-button");
  var navLinks = document.getElementById("nav-links");
  var storedTheme = localStorage.getItem("testor-theme");

  function applyTheme(theme) {
    var grey = theme === "grey";
    var longLabel = document.createElement("span");
    var shortLabel = document.createElement("span");
    root.dataset.theme = grey ? "grey" : "blue";
    longLabel.className = "theme-long";
    longLabel.textContent = grey ? "Blue theme" : "Grey theme";
    shortLabel.className = "theme-short";
    shortLabel.textContent = grey ? "Blue" : "Grey";
    themeButton.replaceChildren(longLabel, shortLabel);
    themeButton.setAttribute("aria-label", grey ? "Switch to blue theme" : "Switch to grey theme");
    themeButton.setAttribute("aria-pressed", grey ? "true" : "false");
  }

  applyTheme(storedTheme === "blue" ? "blue" : "grey");

  themeButton.addEventListener("click", function () {
    var next = root.dataset.theme === "grey" ? "blue" : "grey";
    localStorage.setItem("testor-theme", next);
    applyTheme(next);
  });

  function setMenu(open) {
    navLinks.classList.toggle("open", open);
    menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    menuButton.textContent = open ? "Close" : "Menu";
  }

  menuButton.addEventListener("click", function () {
    setMenu(!navLinks.classList.contains("open"));
  });

  navLinks.addEventListener("click", function (event) {
    if (event.target.closest("a")) setMenu(false);
  });

  document.addEventListener("click", function (event) {
    if (!navLinks.classList.contains("open")) return;
    if (event.target.closest("#nav-links") || event.target.closest(".menu-button")) return;
    setMenu(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape" || !navLinks.classList.contains("open")) return;
    setMenu(false);
    menuButton.focus();
  });

  var stepButtons = Array.prototype.slice.call(document.querySelectorAll(".step-button"));
  var stepPanels = Array.prototype.slice.call(document.querySelectorAll(".step-panel"));

  function showStage(index) {
    stepButtons.forEach(function (button, buttonIndex) {
      var selected = buttonIndex === index;
      button.setAttribute("aria-selected", selected ? "true" : "false");
      button.tabIndex = selected ? 0 : -1;
    });
    stepPanels.forEach(function (panel, panelIndex) {
      panel.hidden = panelIndex !== index;
    });
  }

  stepButtons.forEach(function (button, index) {
    button.addEventListener("click", function () { showStage(index); });
    button.addEventListener("keydown", function (event) {
      var next = index;
      if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (index + 1) % stepButtons.length;
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (index - 1 + stepButtons.length) % stepButtons.length;
      if (next === index) return;
      event.preventDefault();
      showStage(next);
      stepButtons[next].focus();
    });
  });
  showStage(0);

  var shots = Array.prototype.slice.call(document.querySelectorAll("[data-shot]"));
  var unique = [];
  shots.forEach(function (shot) {
    var src = shot.getAttribute("data-shot");
    if (!unique.some(function (item) { return item.src === src; })) {
      unique.push({
        src: src,
        caption: shot.getAttribute("data-caption") || "",
        alt: (shot.querySelector("img") || shot).getAttribute("alt") || "Testor screenshot"
      });
    }
  });

  var lightbox = document.getElementById("lightbox");
  var lightboxImage = lightbox.querySelector("img");
  var lightboxCaption = lightbox.querySelector(".lightbox-caption");
  var index = 0;

  function render() {
    var item = unique[index];
    lightboxImage.src = item.src;
    lightboxImage.alt = item.alt;
    lightboxCaption.textContent = item.caption;
  }

  function openAt(src) {
    index = Math.max(0, unique.findIndex(function (item) { return item.src === src; }));
    render();
    lightbox.hidden = false;
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
    lightbox.querySelector(".lightbox-close").focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.hidden = true;
    lightboxImage.removeAttribute("src");
    document.body.style.overflow = "";
  }

  function move(delta) {
    index = (index + delta + unique.length) % unique.length;
    render();
  }

  shots.forEach(function (shot) {
    shot.addEventListener("click", function () {
      openAt(shot.getAttribute("data-shot"));
    });
  });

  lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
  lightbox.querySelector(".prev").addEventListener("click", function () { move(-1); });
  lightbox.querySelector(".next").addEventListener("click", function () { move(1); });
  lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", function (event) {
    if (lightbox.hidden) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowRight") move(1);
    if (event.key === "ArrowLeft") move(-1);
  });
})();
