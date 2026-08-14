(function () {
  "use strict";

  var STORAGE_KEY = "red-team-runbook.onboarding.v1";
  var activeStep = -1;
  var currentTarget = null;
  var lastFocused = null;
  var welcomeTimer = null;
  var handledReplayUrl = "";

  var steps = [
    {
      target: ".runbook-entry-grid",
      title: "Start with what you have",
      body: "Choose the card that matches your current position: a target, a service, credentials, or a shell."
    },
    {
      target: "[data-runbook-variables-open]",
      title: "Set engagement values",
      body: "Variables updates command examples with your target, subnet, listener, domain, and domain controller. Values stay in this browser; do not enter credentials."
    },
    {
      target: ".runbook-actions .md-button--primary",
      title: "Use the Command Index",
      body: "Open the Command Index for common starting commands. Follow its links when you need prerequisites, alternatives, or cleanup notes."
    }
  ];

  function safeStorage(action, value) {
    try {
      if (action === "get") return window.localStorage.getItem(STORAGE_KEY);
      if (action === "set") window.localStorage.setItem(STORAGE_KEY, value);
    } catch (error) {
      return null;
    }
    return null;
  }

  function reduceMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function isHomePage() {
    return Boolean(document.querySelector(".runbook-home"));
  }

  function createInterface() {
    if (document.querySelector("[data-runbook-onboarding]")) return;

    var welcome = document.createElement("aside");
    welcome.className = "runbook-onboarding-welcome";
    welcome.hidden = true;
    welcome.setAttribute("data-runbook-onboarding", "welcome");
    welcome.setAttribute("role", "dialog");
    welcome.setAttribute("aria-modal", "false");
    welcome.setAttribute("aria-labelledby", "runbook-onboarding-welcome-title");
    welcome.innerHTML =
      '<p class="runbook-onboarding__eyebrow">Quick introduction</p>' +
      '<h2 id="runbook-onboarding-welcome-title">New to the runbook?</h2>' +
      '<p>See where to start, set engagement values, and find the commands you need.</p>' +
      '<div class="runbook-onboarding__actions">' +
      '<button class="runbook-onboarding__primary" type="button" data-runbook-tour-start>Take a quick tour</button>' +
      '<button class="runbook-onboarding__secondary" type="button" data-runbook-tour-skip>Skip</button>' +
      "</div>";

    var tour = document.createElement("aside");
    tour.className = "runbook-tour";
    tour.hidden = true;
    tour.setAttribute("data-runbook-onboarding", "tour");
    tour.setAttribute("role", "dialog");
    tour.setAttribute("aria-modal", "false");
    tour.setAttribute("aria-labelledby", "runbook-tour-title");
    tour.innerHTML =
      '<p class="runbook-onboarding__eyebrow" data-runbook-tour-count></p>' +
      '<h2 id="runbook-tour-title" data-runbook-tour-title></h2>' +
      '<p data-runbook-tour-body></p>' +
      '<div class="runbook-tour__actions">' +
      '<button class="runbook-onboarding__secondary" type="button" data-runbook-tour-skip>Skip</button>' +
      '<div class="runbook-tour__navigation">' +
      '<button class="runbook-onboarding__secondary" type="button" data-runbook-tour-back>Back</button>' +
      '<button class="runbook-onboarding__primary" type="button" data-runbook-tour-next>Next</button>' +
      "</div>" +
      "</div>";

    document.body.appendChild(welcome);
    document.body.appendChild(tour);

    welcome.querySelector("[data-runbook-tour-start]").addEventListener("click", startTour);
    welcome.querySelector("[data-runbook-tour-skip]").addEventListener("click", function () {
      dismiss("skipped");
    });
    tour.querySelector("[data-runbook-tour-skip]").addEventListener("click", function () {
      dismiss("skipped");
    });
    tour.querySelector("[data-runbook-tour-back]").addEventListener("click", function () {
      showStep(activeStep - 1);
    });
    tour.querySelector("[data-runbook-tour-next]").addEventListener("click", function () {
      if (activeStep === steps.length - 1) dismiss("completed");
      else showStep(activeStep + 1);
    });
  }

  function clearTimer() {
    if (!welcomeTimer) return;
    window.clearTimeout(welcomeTimer);
    welcomeTimer = null;
  }

  function clearTarget() {
    if (!currentTarget) return;
    currentTarget.classList.remove("runbook-tour-target");
    currentTarget.removeAttribute("data-runbook-tour-current");
    currentTarget = null;
  }

  function hideWelcome() {
    var welcome = document.querySelector('[data-runbook-onboarding="welcome"]');
    if (welcome) welcome.hidden = true;
  }

  function hideTour() {
    var tour = document.querySelector('[data-runbook-onboarding="tour"]');
    clearTarget();
    activeStep = -1;
    document.body.classList.remove("runbook-tour-open");
    if (tour) tour.hidden = true;
  }

  function dismiss(status) {
    var focusReturn = lastFocused;
    if (!focusReturn || (focusReturn.closest && focusReturn.closest("[data-runbook-onboarding]"))) {
      focusReturn = document.querySelector(".runbook-actions .md-button--primary");
    }
    clearTimer();
    safeStorage("set", status);
    hideWelcome();
    hideTour();
    if (focusReturn && typeof focusReturn.focus === "function") focusReturn.focus();
    lastFocused = null;
  }

  function showWelcome() {
    if (!isHomePage() || safeStorage("get")) return;
    createInterface();
    var welcome = document.querySelector('[data-runbook-onboarding="welcome"]');
    if (welcome) welcome.hidden = false;
  }

  function showStep(index) {
    var tour = document.querySelector('[data-runbook-onboarding="tour"]');
    if (!tour || index < 0 || index >= steps.length) return;

    clearTarget();
    activeStep = index;
    var step = steps[index];
    currentTarget = document.querySelector(step.target);
    if (currentTarget) {
      currentTarget.classList.add("runbook-tour-target");
      currentTarget.setAttribute("data-runbook-tour-current", "");
      currentTarget.scrollIntoView({
        behavior: reduceMotion() ? "auto" : "smooth",
        block: index === 1 ? "start" : "center"
      });
    }

    tour.querySelector("[data-runbook-tour-count]").textContent = "Step " + (index + 1) + " of " + steps.length;
    tour.querySelector("[data-runbook-tour-title]").textContent = step.title;
    tour.querySelector("[data-runbook-tour-body]").textContent = step.body;
    var back = tour.querySelector("[data-runbook-tour-back]");
    var next = tour.querySelector("[data-runbook-tour-next]");
    back.hidden = index === 0;
    next.textContent = index === steps.length - 1 ? "Finish" : "Next";
    next.focus();
  }

  function startTour() {
    if (!isHomePage()) return;
    createInterface();
    clearTimer();
    lastFocused = document.activeElement;
    hideWelcome();
    var tour = document.querySelector('[data-runbook-onboarding="tour"]');
    tour.hidden = false;
    document.body.classList.add("runbook-tour-open");
    showStep(0);
  }

  function handleReplayQuery() {
    if (!isHomePage()) return false;
    var url = new URL(window.location.href);
    if (url.searchParams.get("tour") !== "1" || handledReplayUrl === window.location.href) return false;
    handledReplayUrl = window.location.href;
    url.searchParams.delete("tour");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    window.setTimeout(startTour, 100);
    return true;
  }

  function initializePage() {
    createInterface();
    clearTimer();

    if (!isHomePage()) {
      hideWelcome();
      hideTour();
      return;
    }

    if (handleReplayQuery()) return;
    if (safeStorage("get")) {
      hideWelcome();
      return;
    }

    welcomeTimer = window.setTimeout(showWelcome, 500);
  }

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    var welcome = document.querySelector('[data-runbook-onboarding="welcome"]');
    var tour = document.querySelector('[data-runbook-onboarding="tour"]');
    if ((welcome && !welcome.hidden) || (tour && !tour.hidden)) dismiss("skipped");
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePage, { once: true });
  } else {
    initializePage();
  }

  if (typeof document$ !== "undefined") document$.subscribe(initializePage);
})();
