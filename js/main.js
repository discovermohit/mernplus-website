/* Mernplus Technologies — site behaviour (no dependencies) */
(function () {
  "use strict";

  /* ---------- Mobile nav + dropdowns ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Close menu when a link is followed (useful for same-page anchors)
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a") && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  document.querySelectorAll(".nav [data-submenu]").forEach(function (btn) {
    var li = btn.parentElement;
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var isOpen = li.classList.toggle("open");
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      // close siblings
      li.parentElement.querySelectorAll("li.open").forEach(function (other) {
        if (other !== li) {
          other.classList.remove("open");
          var b = other.querySelector("[data-submenu]");
          if (b) b.setAttribute("aria-expanded", "false");
        }
      });
    });
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".nav")) {
      document.querySelectorAll(".nav li.open").forEach(function (li) {
        li.classList.remove("open");
        var b = li.querySelector("[data-submenu]");
        if (b) b.setAttribute("aria-expanded", "false");
      });
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document.querySelectorAll(".nav li.open").forEach(function (li) { li.classList.remove("open"); });
      if (nav && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    }
  });

  /* ---------- Reveal on scroll ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-visible");
          ro.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { ro.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Animated counters ---------- */
  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    var duration = 1600;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          animateCounter(en.target);
          co.unobserve(en.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { co.observe(el); });
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------- Testimonial slider ---------- */
  var track = document.querySelector(".testi-track");
  if (track) {
    var prev = document.querySelector("[data-testi-prev]");
    var next = document.querySelector("[data-testi-next]");
    function cardWidth() {
      var card = track.querySelector(".testi-card");
      return card ? card.getBoundingClientRect().width + 16 : 320;
    }
    if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -cardWidth(), behavior: "smooth" }); });
    if (next) next.addEventListener("click", function () { track.scrollBy({ left: cardWidth(), behavior: "smooth" }); });
  }

  /* ---------- Contact form ----------
     On Netlify the form is handled by Netlify Forms (data-netlify attribute):
     we POST it with fetch and show a status message. On any host that rejects
     the POST (local file, GitHub Pages, etc.) it falls back to opening the
     visitor's email client with the message pre-filled, so the form is never
     a dead end. */
  var form = document.getElementById("contact-form-el");
  if (form) {
    var status = form.querySelector(".form-status");
    var toEmail = form.getAttribute("data-mailto") || "sales@mernplus.com";

    function mailtoFallback(name, email, message) {
      var subject = encodeURIComponent("Website enquiry from " + name);
      var body = encodeURIComponent(message + "\n\n— " + name + " (" + email + ")");
      window.location.href = "mailto:" + toEmail + "?subject=" + subject + "&body=" + body;
      status.classList.remove("error");
      status.textContent = "Opening your email client…";
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var name = (data.get("name") || "").toString().trim();
      var email = (data.get("email") || "").toString().trim();
      var message = (data.get("message") || "").toString().trim();

      if (!name || !email || !message) {
        status.classList.add("error");
        status.textContent = "Please fill in your name, email and message.";
        return;
      }

      status.classList.remove("error");
      status.textContent = "Sending…";
      var btn = form.querySelector("button[type=submit]");
      if (btn) btn.disabled = true;

      fetch(form.getAttribute("action") || "/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data).toString()
      }).then(function (res) {
        if (!res.ok) throw new Error("Request failed");
        form.reset();
        status.textContent = "Thanks! We'll get back to you shortly.";
      }).catch(function () {
        mailtoFallback(name, email, message);
      }).finally(function () {
        if (btn) btn.disabled = false;
      });
    });
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
