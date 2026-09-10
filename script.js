/* ==========================================================================
   A. SMOOTH SCROLL HELPER
   ========================================================================== */
function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: "smooth" });
}

/* ==========================================================================
   A2. MOBILE NAV TOGGLE (hamburger)
   ========================================================================== */
(function initMobileNav() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("primaryNav");
  if (!toggle || !nav) return;

  function closeMenu() {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = '<i class="fas fa-bars"></i>';
  }
  function openMenu() {
    nav.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.innerHTML = '<i class="fas fa-xmark"></i>';
  }

  toggle.addEventListener("click", () => {
    nav.classList.contains("open") ? closeMenu() : openMenu();
  });

  // Close after picking a section
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));

  // If the viewport is resized past the mobile breakpoint, make sure the
  // dropdown doesn't stay stuck open underneath the now-visible inline nav
  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) closeMenu();
  });
})();

/* ==========================================================================
   B. SCROLL TIMELINE (scrubber fill, chapter markers, timecode label)
   ========================================================================== */
(function initScrubber() {
  const sections = [
    { id: "home",     label: "Home" },
    { id: "about",    label: "About" },
    { id: "skills",   label: "Skills" },
    { id: "projects", label: "Projects" },
    { id: "contact",  label: "Contact" }
  ];

  const marksEl = document.getElementById("scrubberMarks");
  const fillEl = document.getElementById("scrubberFill");
  const labelEl = document.getElementById("scrubberLabel");

  sections.forEach((s, i) => {
    const btn = document.createElement("button");
    btn.dataset.target = s.id;
    btn.setAttribute("aria-label", "Jump to " + s.label);
    btn.addEventListener("click", () => scrollToSection(s.id));
    marksEl.appendChild(btn);
  });

  const markButtons = marksEl.querySelectorAll("button");

  function formatTimecode(fraction) {
    const totalSeconds = Math.floor(fraction * 240); // stylised 4-minute reel
    const m = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const s = String(totalSeconds % 60).padStart(2, "0");
    return m + ":" + s;
  }

  function updateScrubber() {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const scrollHeight = doc.scrollHeight - doc.clientHeight;
    const fraction = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

    fillEl.style.width = (fraction * 100) + "%";

    let current = sections[0];
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) {
        current = s;
      }
    }
    labelEl.textContent = formatTimecode(fraction) + " — " + current.label;
    markButtons.forEach(btn => btn.classList.toggle("active", btn.dataset.target === current.id));
  }

  window.addEventListener("scroll", updateScrubber, { passive: true });
  window.addEventListener("resize", updateScrubber);
  updateScrubber();
})();

/* ==========================================================================
   C. PROJECT IMAGE SLIDERS
   ========================================================================== */
const sliderStates = {};
function moveSlide(sliderId, direction) {
  const container = document.getElementById(sliderId);
  const slider = container.querySelector(".slider");
  const slides = container.querySelectorAll(".slide");
  if (!sliderStates[sliderId]) sliderStates[sliderId] = 0;
  sliderStates[sliderId] = (sliderStates[sliderId] + direction + slides.length) % slides.length;
  slider.style.transform = `translateX(-${sliderStates[sliderId] * 100}%)`;
}

/* ==========================================================================
   D. CONTACT FORM (AJAX submit via Formspree)
   ========================================================================== */
(function initContactForm() {
  const form = document.getElementById("azim-contact-form");
  const thankYou = document.getElementById("thank-you-msg");
  const submitBtn = document.getElementById("submit-btn");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerText = "Sending...";

    const data = new FormData(event.target);
    try {
      const response = await fetch(event.target.action, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" }
      });
      if (response.ok) {
        form.style.display = "none";
        thankYou.style.display = "block";
      } else {
        alert("Oops! There was a problem submitting your form.");
        submitBtn.disabled = false;
        submitBtn.innerText = "Send Message";
      }
    } catch (err) {
      alert("Network error. Please try again later.");
      submitBtn.disabled = false;
      submitBtn.innerText = "Send Message";
    }
  });

  window.resetForm = function () {
    form.reset();
    form.style.display = "grid";
    thankYou.style.display = "none";
    submitBtn.disabled = false;
    submitBtn.innerText = "Send Message";
  };
})();
