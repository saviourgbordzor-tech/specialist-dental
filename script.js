/* ============================================================
   Specialist Dental & Implant Center — interactions
   ============================================================ */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const WHATSAPP_NUMBER = "233271088803";

  /* ---------- Toast ---------- */
  const toast = $("#toast");
  let toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
  }

  /* ---------- Header shadow on scroll ---------- */
  const header = $("#siteHeader");
  function updateHeader() {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* ---------- Mobile navigation ---------- */
  const menuToggle = $("#menuToggle");
  const mainNav = $("#mainNav");

  function closeMenu() {
    mainNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  });

  $$(".nav-link").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) closeMenu();
  });

  /* ---------- Active navigation link ---------- */
  const navTargets = $$(".nav-link")
    .map((link) => ({ link, section: document.querySelector(link.getAttribute("href")) }))
    .filter((item) => item.section);

  function updateActiveLink() {
    let currentId = "top";
    navTargets.forEach(({ section }) => {
      if (section.getBoundingClientRect().top <= 150) currentId = section.id;
    });
    navTargets.forEach(({ link, section }) => {
      link.classList.toggle("active", section.id === currentId);
    });
  }
  updateActiveLink();
  window.addEventListener("scroll", updateActiveLink, { passive: true });

  /* ---------- Scroll reveal ---------- */
  const revealElements = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("in-view"));
  }

  /* ---------- Treatment category filters ---------- */
  const tabs = $$(".tab");
  const treatmentCards = $$(".treatment-card");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const filter = tab.dataset.filter;

      tabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });

      treatmentCards.forEach((card) => {
        const matches = filter === "all" || card.dataset.category === filter;
        card.hidden = !matches;
        if (matches) {
          card.classList.add("in-view");
          card.classList.remove("just-shown");
          void card.offsetWidth;
          card.classList.add("just-shown");
        }
      });
    });
  });

  /* ---------- Pre-select a service from treatment cards ---------- */
  const procedureSelect = $("#procedure");
  const selectWrap = $("#selectWrap");
  let highlightTimer;

  $$(".btn-book").forEach((button) => {
    button.addEventListener("click", () => {
      const service = button.dataset.book;
      const matchingOption = Array.from(procedureSelect.options).find(
        (option) => option.value === service
      );
      if (matchingOption) procedureSelect.value = service;

      $("#appointment").scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });

      selectWrap.classList.add("is-highlighted");
      clearTimeout(highlightTimer);
      highlightTimer = setTimeout(() => selectWrap.classList.remove("is-highlighted"), 2400);
      showToast(service + " added to your booking form.");
    });
  });

  /* ---------- Booking form → pre-formatted WhatsApp message ---------- */
  const form = $("#bookingForm");
  const dateInput = $("#preferredDate");

  const now = new Date();
  dateInput.min = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

  function formatDate(value) {
    if (!value) return "";
    const parsed = new Date(value + "T12:00:00");
    if (Number.isNaN(parsed.getTime())) return value;
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(parsed);
  }

  function formatTime(value) {
    if (!value) return "";
    const [hours, minutes] = value.split(":").map(Number);
    const suffix = hours >= 12 ? "PM" : "AM";
    const twelveHour = hours % 12 || 12;
    return twelveHour + ":" + String(minutes).padStart(2, "0") + " " + suffix;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const name = String(data.get("patientName") || "").trim();
    const phone = String(data.get("patientPhone") || "").trim();
    const procedure = String(data.get("procedure") || "").trim();
    const date = formatDate(String(data.get("preferredDate") || ""));
    const time = formatTime(String(data.get("preferredTime") || ""));
    const notes = String(data.get("notes") || "").trim();

    const message = [
      "Hello Specialist Dental & Implant Center 👋",
      "",
      "I'd like to book a consultation.",
      "",
      "Patient name: " + name,
      "Phone number: " + phone,
      "Procedure: " + procedure,
    ];

    const preferred = [date, time].filter(Boolean).join(" at ");
    if (preferred) message.push("Preferred date & time: " + preferred);
    if (notes) message.push("Notes: " + notes);
    message.push("", "Please confirm availability. Thank you!");

    const url =
      "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message.join("\n"));

    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) window.location.href = url;
    showToast("Your booking message is ready in WhatsApp.");
  });

  /* ---------- Footer year ---------- */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
