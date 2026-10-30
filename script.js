/* Sotear Security — site behaviour */
(function () {
  "use strict";

  var config = window.SITE_CONFIG || {};
  var brand = config.brand || {};
  var contact = config.contact || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------------------------------------------------------
     Brand and contact details
  --------------------------------------------------------- */
  document.querySelectorAll("[data-brand]").forEach(function (element) {
    var key = element.getAttribute("data-brand");
    if (brand[key]) element.textContent = brand[key];
  });

  if (brand.name) {
    document.title = brand.name + " — Penetration testing & training in Cambodia";
  }

  var brandLinks = document.querySelectorAll(".brand");
  brandLinks.forEach(function (link, index) {
    if (!brand.name) return;
    link.setAttribute(
      "aria-label",
      index === 0 ? brand.name + " home" : brand.name + " — back to top"
    );
  });

  var contactEmail = contact.email || "";
  var contactTelegram = contact.telegramLabel || "";
  var contactTelegramUrl = contact.telegramUrl || "";

  document.querySelectorAll('[data-contact="email"]').forEach(function (element) {
    element.textContent = contactEmail;
  });
  document.querySelectorAll('[data-contact="telegram"]').forEach(function (element) {
    element.textContent = contactTelegram;
  });
  document.querySelectorAll('[data-contact="location"]').forEach(function (element) {
    if (contact.location) element.textContent = contact.location;
  });
  document.querySelectorAll('[data-contact="email-link"]').forEach(function (link) {
    if (contactEmail) {
      link.setAttribute("href", "mailto:" + contactEmail);
    } else {
      link.removeAttribute("href");
    }
  });
  document.querySelectorAll('[data-contact="telegram-link"]').forEach(function (link) {
    if (contactTelegramUrl) {
      link.setAttribute("href", contactTelegramUrl);
    } else {
      link.removeAttribute("href");
    }
  });

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------------------------------------------------------
     Header
  --------------------------------------------------------- */
  var header = document.getElementById("site-header");
  var navToggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  var navToggleText = navToggle ? navToggle.querySelector(".nav-toggle-text") : null;
  var mobileQuery = window.matchMedia("(max-width: 920px)");
  var pageMain = document.getElementById("main");
  var pageFooter = document.querySelector(".site-footer");

  function setPageInert(isInert) {
    [pageMain, pageFooter].forEach(function (element) {
      if (!element) return;
      if (isInert) {
        element.setAttribute("inert", "");
      } else {
        element.removeAttribute("inert");
      }
    });
  }

  function setHeaderState() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  function closeNav(returnFocus) {
    if (!navToggle || !nav) return;
    navToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
    document.documentElement.classList.remove("nav-open");
    setPageInert(false);
    if (navToggleText) navToggleText.textContent = "Menu";
    if (returnFocus) navToggle.focus();
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      document.body.classList.toggle("nav-open", !isOpen);
      document.documentElement.classList.toggle("nav-open", !isOpen);
      setPageInert(!isOpen);
      if (navToggleText) navToggleText.textContent = isOpen ? "Menu" : "Close";
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (mobileQuery.matches) closeNav(false);
      });
    });

    document.addEventListener("click", function (event) {
      if (navToggle.getAttribute("aria-expanded") !== "true") return;
      if (nav.contains(event.target) || navToggle.contains(event.target)) return;
      closeNav(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
        closeNav(true);
      }
    });

    if (mobileQuery.addEventListener) {
      mobileQuery.addEventListener("change", function (event) {
        if (!event.matches) closeNav(false);
      });
    } else if (mobileQuery.addListener) {
      mobileQuery.addListener(function (event) {
        if (!event.matches) closeNav(false);
      });
    }
  }

  /* ---------------------------------------------------------
     Reveal on scroll
  --------------------------------------------------------- */
  var revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -4% 0px" });

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  /* ---------------------------------------------------------
     Phishing example
  --------------------------------------------------------- */
  var flagButtons = Array.prototype.slice.call(document.querySelectorAll("[data-flag-button]"));
  var flagCount = document.getElementById("flag-count");
  var flagStatus = document.getElementById("flag-status");
  var revealFlagsButton = document.getElementById("reveal-flags");
  var resetFlagsButton = document.getElementById("reset-flags");
  var openFlags = new Set();

  function syncFlagUI() {
    if (flagCount) flagCount.textContent = String(openFlags.size);

    if (revealFlagsButton) {
      revealFlagsButton.textContent = openFlags.size === flagButtons.length
        ? "Hide all " + flagButtons.length
        : "Reveal all " + flagButtons.length;
    }
  }

  function setFlag(name, isOpen, announce) {
    var button = document.querySelector('[data-flag-button="' + name + '"]');
    var mark = document.querySelector('mark[data-flag="' + name + '"]');
    if (!button) return;

    var detailId = button.getAttribute("aria-controls");
    var detail = detailId ? document.getElementById(detailId) : null;

    button.setAttribute("aria-expanded", String(isOpen));
    if (detail) detail.hidden = !isOpen;
    if (mark) mark.classList.toggle("is-flagged", isOpen);

    if (isOpen) {
      openFlags.add(name);
    } else {
      openFlags.delete(name);
    }

    syncFlagUI();

    if (announce && flagStatus) {
      var label = button.children[1] ? button.children[1].textContent : "Red flag";
      var number = button.children[0] ? button.children[0].textContent : "";
      flagStatus.textContent = (isOpen ? "Revealed" : "Hidden") + " red flag " + number + ": " + label;
    }
  }

  flagButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var name = button.getAttribute("data-flag-button");
      var isOpen = button.getAttribute("aria-expanded") === "true";
      setFlag(name, !isOpen, true);
    });
  });

  if (revealFlagsButton) {
    revealFlagsButton.addEventListener("click", function () {
      var allOpen = openFlags.size === flagButtons.length;
      flagButtons.forEach(function (button) {
        setFlag(button.getAttribute("data-flag-button"), !allOpen, false);
      });
      if (flagStatus) {
        flagStatus.textContent = allOpen
          ? "All red flags hidden."
          : "All " + flagButtons.length + " red flags revealed.";
      }
      syncFlagUI();
    });
  }

  if (resetFlagsButton) {
    resetFlagsButton.addEventListener("click", function () {
      flagButtons.forEach(function (button) {
        setFlag(button.getAttribute("data-flag-button"), false, false);
      });
      if (flagStatus) flagStatus.textContent = "Reset. All red flags hidden.";
      syncFlagUI();
    });
  }

  /* ---------------------------------------------------------
     Package finder
  --------------------------------------------------------- */
  var finderForm = document.getElementById("finder-form");
  var finderResult = document.getElementById("finder-result");
  var finderTitle = document.getElementById("finder-result-title");
  var finderPrice = document.getElementById("finder-result-price");
  var finderCopy = document.getElementById("finder-result-copy");
  var finderLink = document.getElementById("finder-result-link");
  var finderReset = document.getElementById("finder-reset");

  var recommendations = {
    baseline: {
      title: "Baseline Check",
      price: "$590–$1,200 USD",
      copy: "A short check will show where you stand before you commit to a full test. It is the smallest sensible first step.",
      packageName: "Baseline Check"
    },
    pentest: {
      title: "Focused Penetration Test",
      price: "$1,800–$4,200 USD",
      copy: "We will confirm the target and test window, then send a written quote. The report ends with fixes your team can act on.",
      packageName: "Focused Penetration Test"
    },
    awareness: {
      title: "Awareness Starter",
      price: "$650–$1,400 USD",
      copy: "We will size the session to your team and agree one safe phishing campaign. No blaming anyone who clicks.",
      packageName: "Awareness Starter"
    },
    partner: {
      title: "Security Partner",
      price: "$450–$900 USD / month",
      copy: "We will review your current setup and propose a small monthly scope: scans, policy help, and a few hours of advice.",
      packageName: "Security Partner"
    }
  };

  function getRecommendation(concern, timing, team) {
    if (concern === "ongoing") return recommendations.partner;
    if (concern === "people") return recommendations.awareness;
    if (timing === "exploring") return recommendations.baseline;
    return recommendations.pentest;
  }

  function scrollToElement(element, focusTarget) {
    if (!element) return;
    var behaviour = reduceMotion.matches ? "auto" : "smooth";
    element.scrollIntoView({ behavior: behaviour, block: "center" });
    if (focusTarget) {
      try {
        focusTarget.focus({ preventScroll: true });
      } catch (error) {
        focusTarget.focus();
      }
    }
  }

  if (finderForm && finderResult) {
    finderForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!finderForm.reportValidity()) return;

      var data = new FormData(finderForm);
      var concern = data.get("concern");
      var timing = data.get("timing");
      var team = data.get("team");
      var recommendation = getRecommendation(concern, timing, team);

      finderTitle.textContent = recommendation.title;
      finderPrice.textContent = recommendation.price;
      finderCopy.textContent = recommendation.copy;

      if (concern === "people" && (team === "large" || team === "xlarge")) {
        finderCopy.textContent += " Because your team is larger than one workshop group, we will suggest a split session.";
      }

      finderLink.setAttribute("data-package", recommendation.packageName);
      finderResult.hidden = false;
      finderResult.tabIndex = -1;

      window.requestAnimationFrame(function () {
        scrollToElement(finderResult, finderResult);
      });
    });
  }

  if (finderReset && finderForm && finderResult) {
    finderReset.addEventListener("click", function () {
      finderResult.hidden = true;
      finderForm.reset();
      var firstInput = finderForm.querySelector("input");
      scrollToElement(finderForm, firstInput);
    });
  }

  /* ---------------------------------------------------------
     Contact brief
  --------------------------------------------------------- */
  var contactForm = document.getElementById("contact-form");
  var formError = document.getElementById("form-error");
  var briefResult = document.getElementById("brief-result");
  var briefText = document.getElementById("brief-text");
  var briefEmail = document.getElementById("brief-email");
  var copyBriefButton = document.getElementById("copy-brief");
  var copyStatus = document.getElementById("copy-status");
  var editBriefButton = document.getElementById("edit-brief");
  var serviceSelect = document.getElementById("service");
  var messageField = document.getElementById("message");
  var nameField = document.getElementById("name");

  function showContactForm() {
    if (!contactForm || !briefResult) return;
    contactForm.hidden = false;
    briefResult.hidden = true;
  }

  function selectPackage(packageName) {
    if (!packageName || !serviceSelect) return;
    showContactForm();

    var hasOption = Array.prototype.some.call(serviceSelect.options, function (option) {
      return option.value === packageName || option.text === packageName;
    });

    if (hasOption) {
      serviceSelect.value = packageName;
      if (messageField && !messageField.value) {
        messageField.placeholder = "I would like to know more about " + packageName + ". For example: one public web app, 15 staff, and a client audit in June.";
      }
    }
  }

  document.addEventListener("click", function (event) {
    var link = event.target.closest ? event.target.closest("[data-package]") : null;
    if (!link) return;
    selectPackage(link.getAttribute("data-package"));
  });

  function buildBrief(data) {
    var name = String(data.get("name") || "").trim();
    var reach = String(data.get("reach") || "").trim();
    var organisation = String(data.get("organisation") || "").trim();
    var service = String(data.get("service") || "").trim();
    var message = String(data.get("message") || "").trim();

    var lines = [
      "Hello " + (brand.name || "Sotear Security") + ",",
      "",
      "I would like to ask about: " + service,
      "Name: " + name,
      "Email or Telegram: " + reach
    ];

    if (organisation) lines.push("Organisation: " + organisation);

    lines.push("", "What should we know?", message, "", "Sent from the website brief builder.");

    return {
      subject: "Security enquiry: " + service + (organisation ? " — " + organisation : ""),
      body: lines.join("\n")
    };
  }

  function focusBrief() {
    if (!briefResult) return;
    briefResult.tabIndex = -1;
    window.requestAnimationFrame(function () {
      scrollToElement(briefResult, briefResult);
    });
  }

  if (contactForm && briefResult && briefText) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (formError) formError.hidden = true;

      contactForm.querySelectorAll("[aria-invalid]").forEach(function (field) {
        field.removeAttribute("aria-invalid");
      });

      if (!contactForm.checkValidity()) {
        if (formError) formError.hidden = false;
        var firstInvalid = contactForm.querySelector(":invalid");
        if (firstInvalid) {
          firstInvalid.setAttribute("aria-invalid", "true");
          firstInvalid.focus();
        }
        return;
      }

      var brief = buildBrief(new FormData(contactForm));
      briefText.value = brief.body;

      if (briefEmail) {
        var address = contactEmail || "";
        briefEmail.setAttribute(
          "href",
          "mailto:" + address + "?subject=" + encodeURIComponent(brief.subject) + "&body=" + encodeURIComponent(brief.body)
        );
      }

      contactForm.hidden = true;
      briefResult.hidden = false;
      if (copyStatus) copyStatus.textContent = "";
      focusBrief();
    });

    contactForm.addEventListener("input", function (event) {
      if (formError) formError.hidden = true;
      if (event.target && event.target.hasAttribute("aria-invalid")) {
        event.target.removeAttribute("aria-invalid");
      }
    });

    contactForm.addEventListener("change", function (event) {
      if (formError) formError.hidden = true;
      if (event.target && event.target.hasAttribute("aria-invalid")) {
        event.target.removeAttribute("aria-invalid");
      }
    });
  }

  if (copyBriefButton && briefText) {
    copyBriefButton.addEventListener("click", function () {
      var text = briefText.value;

      function copied() {
        if (copyStatus) copyStatus.textContent = "Copied. Paste it into your email or Telegram.";
      }

      function fallbackCopy() {
        briefText.focus();
        briefText.select();
        try {
          document.execCommand("copy");
          copied();
        } catch (error) {
          if (copyStatus) copyStatus.textContent = "Could not copy automatically. Select the text and copy it.";
        }
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(copied).catch(fallbackCopy);
      } else {
        fallbackCopy();
      }
    });
  }

  if (editBriefButton && contactForm && briefResult) {
    editBriefButton.addEventListener("click", function () {
      showContactForm();
      if (nameField) {
        try {
          nameField.focus({ preventScroll: true });
        } catch (error) {
          nameField.focus();
        }
      }
    });
  }
})();
