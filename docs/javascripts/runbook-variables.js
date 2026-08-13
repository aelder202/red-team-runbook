(function () {
  "use strict";

  var SESSION_KEY = "red-team-runbook.variables.v1";
  var LOCAL_KEY = "red-team-runbook.variables.remembered.v1";
  var VARIABLE_NAMES = ["IP", "SUBNET", "LHOST", "DOMAIN", "DC_IP"];
  var DERIVED_NAMES = ["BASE_DN", "NETBIOS"];
  var TOKEN_NAMES = VARIABLE_NAMES.concat(DERIVED_NAMES);
  var LEGACY_ALIASES = {
    IP: ["10.10.10.10", "<target>"],
    SUBNET: [],
    LHOST: ["<attacker-ip>"],
    DOMAIN: ["<domain>"],
    DC_IP: ["<dc-ip>"]
  };

  var originals = new WeakMap();
  var originalAttributes = new WeakMap();
  var values = emptyValues();
  var remembered = false;
  var lastFocused = null;

  function emptyValues() {
    return { IP: "", SUBNET: "", LHOST: "", DOMAIN: "", DC_IP: "" };
  }

  function safeStorage(storage, action, key, value) {
    try {
      if (action === "get") return storage.getItem(key);
      if (action === "set") storage.setItem(key, value);
      if (action === "remove") storage.removeItem(key);
    } catch (error) {
      return null;
    }
    return null;
  }

  function parseStored(raw) {
    if (!raw) return null;
    try {
      var parsed = JSON.parse(raw);
      var result = emptyValues();
      VARIABLE_NAMES.forEach(function (name) {
        if (typeof parsed[name] === "string") result[name] = parsed[name];
      });
      return result;
    } catch (error) {
      return null;
    }
  }

  function loadValues() {
    var localValues = parseStored(safeStorage(window.localStorage, "get", LOCAL_KEY));
    var sessionValues = parseStored(safeStorage(window.sessionStorage, "get", SESSION_KEY));
    remembered = Boolean(localValues);
    values = sessionValues || localValues || emptyValues();
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function replacements() {
    var aliases = [];
    TOKEN_NAMES.forEach(function (name) {
      aliases.push({ match: "$" + name, name: name });
      (LEGACY_ALIASES[name] || []).forEach(function (legacy) {
        aliases.push({ match: legacy, name: name });
      });
    });
    aliases.sort(function (a, b) { return b.match.length - a.match.length; });
    return aliases;
  }

  var replacementList = replacements();
  var replacementPattern = new RegExp(
    replacementList.map(function (item) { return escapeRegExp(item.match); }).join("|"),
    "g"
  );
  var replacementNames = replacementList.reduce(function (lookup, item) {
    lookup[item.match] = item.name;
    return lookup;
  }, {});

  function valueFor(name) {
    if (name === "BASE_DN") {
      return values.DOMAIN
        ? values.DOMAIN.split(".").filter(Boolean).map(function (part) { return "DC=" + part; }).join(",")
        : "";
    }
    if (name === "NETBIOS") {
      return values.DOMAIN ? values.DOMAIN.split(".")[0].toUpperCase() : "";
    }
    return values[name];
  }

  function renderText(original) {
    return original.replace(replacementPattern, function (match) {
      var name = replacementNames[match];
      return valueFor(name) || "$" + name;
    });
  }

  function renderHref(original) {
    var rendered = renderText(original);
    return /^(?:javascript|data|vbscript):/i.test(rendered.trim()) ? original : rendered;
  }

  function registerAndRender(root) {
    var scope = root || document;
    var article = scope.matches && scope.matches("article") ? scope : scope.querySelector("article");
    if (!article) return;

    var walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var parent = node.parentElement;
        return parent && !parent.closest("script, style")
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
    });
    var node;
    while ((node = walker.nextNode())) {
      if (!originals.has(node)) originals.set(node, node.nodeValue);
      node.nodeValue = renderText(originals.get(node));
    }

    article.querySelectorAll("[href]").forEach(function (element) {
      var attributes = originalAttributes.get(element);
      if (!attributes) {
        attributes = { href: element.getAttribute("href") };
        originalAttributes.set(element, attributes);
      }
      element.setAttribute("href", renderHref(attributes.href));
    });
  }

  function activeCount() {
    return VARIABLE_NAMES.filter(function (name) { return values[name]; }).length;
  }

  function updateButton(button) {
    var count = activeCount();
    button.classList.toggle("runbook-variables-button--active", count > 0);
    button.setAttribute("aria-label", count ? "Command variables, " + count + " set" : "Command variables");
    var badge = button.querySelector(".runbook-variables-button__count");
    badge.textContent = String(count);
    badge.hidden = count === 0;
  }

  function createHeaderButton() {
    var header = document.querySelector(".md-header__inner");
    if (!header) return null;
    var existing = header.querySelector("[data-runbook-variables-open]");
    if (existing) return existing;

    var button = document.createElement("button");
    button.type = "button";
    button.className = "md-header__button runbook-variables-button";
    button.setAttribute("data-runbook-variables-open", "");
    button.setAttribute("aria-controls", "runbook-variables-panel");
    button.setAttribute("aria-expanded", "false");
    button.innerHTML = '<span class="runbook-variables-button__icon" aria-hidden="true">{ }</span>' +
      '<span class="runbook-variables-button__label">Variables</span>' +
      '<span class="runbook-variables-button__count" hidden></span>';

    var source = header.querySelector(".md-header__source");
    header.insertBefore(button, source || null);
    return button;
  }

  function setupInterface() {
    var panel = document.querySelector("#runbook-variables-panel");
    var backdrop = document.querySelector("[data-runbook-variables-backdrop]");
    var form = document.querySelector("[data-runbook-variables-form]");
    var button = createHeaderButton();
    if (!panel || !backdrop || !form || !button || panel.dataset.ready) return;
    panel.dataset.ready = "true";

    var closeButton = panel.querySelector("[data-runbook-variables-close]");
    var resetButton = panel.querySelector("[data-runbook-variables-reset]");
    var status = panel.querySelector("[data-runbook-variables-status]");
    var rememberInput = form.elements.remember;

    function populateForm() {
      VARIABLE_NAMES.forEach(function (name) { form.elements[name].value = values[name]; });
      rememberInput.checked = remembered;
    }

    function openPanel(focusName) {
      lastFocused = document.activeElement;
      populateForm();
      panel.scrollTop = 0;
      panel.hidden = false;
      backdrop.hidden = false;
      document.body.classList.add("runbook-variables-open");
      button.setAttribute("aria-expanded", "true");
      window.requestAnimationFrame(function () {
        panel.classList.add("runbook-variables--visible");
        backdrop.classList.add("runbook-variables__backdrop--visible");
        (focusName && form.elements[focusName] ? form.elements[focusName] : form.elements.IP).focus();
      });
    }

    function closePanel() {
      panel.classList.remove("runbook-variables--visible");
      backdrop.classList.remove("runbook-variables__backdrop--visible");
      document.body.classList.remove("runbook-variables-open");
      button.setAttribute("aria-expanded", "false");
      window.setTimeout(function () {
        panel.hidden = true;
        backdrop.hidden = true;
      }, 180);
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    }

    function persist() {
      var serialized = JSON.stringify(values);
      safeStorage(window.sessionStorage, "set", SESSION_KEY, serialized);
      if (remembered) {
        safeStorage(window.localStorage, "set", LOCAL_KEY, serialized);
      } else {
        safeStorage(window.localStorage, "remove", LOCAL_KEY);
      }
    }

    button.addEventListener("click", function () { openPanel(); });
    closeButton.addEventListener("click", closePanel);
    backdrop.addEventListener("click", closePanel);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      VARIABLE_NAMES.forEach(function (name) {
        values[name] = form.elements[name].value.replace(/[\r\n\u0000-\u001f\u007f]/g, "").trim();
        form.elements[name].value = values[name];
      });
      remembered = rememberInput.checked;
      persist();
      registerAndRender(document);
      updateButton(button);
      status.textContent = activeCount() ? "Command examples updated." : "No values set; placeholders are shown.";
    });

    resetButton.addEventListener("click", function () {
      values = emptyValues();
      remembered = false;
      safeStorage(window.sessionStorage, "remove", SESSION_KEY);
      safeStorage(window.localStorage, "remove", LOCAL_KEY);
      populateForm();
      registerAndRender(document);
      updateButton(button);
      status.textContent = "Variables reset.";
      form.elements.IP.focus();
    });

    panel.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closePanel();
      if (event.key !== "Tab") return;
      var focusable = Array.prototype.slice.call(panel.querySelectorAll("button, input:not([disabled])"));
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    populateForm();
    updateButton(button);
  }

  function initialize() {
    loadValues();
    setupInterface();
    registerAndRender(document);
    var button = document.querySelector("[data-runbook-variables-open]");
    if (button) updateButton(button);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }

  if (typeof document$ !== "undefined") {
    document$.subscribe(function () {
      setupInterface();
      registerAndRender(document);
      var button = document.querySelector("[data-runbook-variables-open]");
      if (button) updateButton(button);
    });
  }
})();
