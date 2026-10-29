// Year in footer
document.getElementById("year").textContent = new Date().getFullYear();

// Mobile nav toggle + body scroll lock + scrim
const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");
const scrim = document.querySelector(".nav-scrim");

const closeMenu = () => {
  if (!links) return;
  links.classList.remove("open");
  document.body.classList.remove("menu-open");
  if (toggle) toggle.setAttribute("aria-expanded", "false");
};

if (toggle && links) {
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
  links.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
}
if (scrim) scrim.addEventListener("click", closeMenu);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

// Quick-glance pill controls (Apple product-viewer pattern) — single-select accordion
(function () {
  const buttons = document.querySelectorAll(".qg-btn");
  const panels = document.querySelectorAll(".qg-panel");
  if (!buttons.length) return;

  const closeAll = () => {
    buttons.forEach((b) => b.setAttribute("aria-expanded", "false"));
    panels.forEach((p) => {
      p.classList.remove("open");
      // wait for the exit transition before truly hiding, so screen-readers
      // don't catch it mid-fade
      setTimeout(() => {
        if (!p.classList.contains("open")) p.hidden = true;
      }, 260);
    });
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.panel;
      const panel = document.getElementById("qg-" + key);
      if (!panel) return;
      const wasOpen = btn.getAttribute("aria-expanded") === "true";
      closeAll();
      if (!wasOpen) {
        btn.setAttribute("aria-expanded", "true");
        panel.hidden = false;
        // let the browser register `hidden=false` before adding .open so the
        // transition from the pre-state actually runs
        requestAnimationFrame(() => {
          requestAnimationFrame(() => panel.classList.add("open"));
        });
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const openBtn = document.querySelector('.qg-btn[aria-expanded="true"]');
      if (openBtn) {
        closeAll();
        openBtn.focus();
      }
    }
  });

  // Close when clicking outside the pill row / open panel
  document.addEventListener("click", (e) => {
    const open = document.querySelector(".qg-panel.open");
    if (!open) return;
    const inside =
      e.target.closest(".qg-panels") || e.target.closest(".qg-pills");
    if (!inside) closeAll();
  });
})();

// Reveal on scroll — respects prefers-reduced-motion via the stylesheet
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!prefersReduced && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document
    .querySelectorAll(".section, .t-item, .project, .skill-col, .contact-card")
    .forEach((el) => io.observe(el));
} else {
  document
    .querySelectorAll(".section, .t-item, .project, .skill-col, .contact-card")
    .forEach((el) => el.classList.add("in"));
}
