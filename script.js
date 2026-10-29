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

// Pill controls (Apple product-viewer pattern) — scoped per [data-pill-group].
// Each group is an independent single-select accordion.
(function () {
  const groups = document.querySelectorAll("[data-pill-group]");
  if (!groups.length) return;

  groups.forEach((group) => {
    const buttons = group.querySelectorAll(".qg-btn");
    const panels = group.querySelectorAll(".qg-panel");
    if (!buttons.length) return;

    const closeAll = () => {
      buttons.forEach((b) => b.setAttribute("aria-expanded", "false"));
      panels.forEach((p) => {
        p.classList.remove("open");
        setTimeout(() => {
          if (!p.classList.contains("open")) p.hidden = true;
        }, 260);
      });
    };

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("aria-controls");
        const panel = targetId ? group.querySelector("#" + targetId) : null;
        if (!panel) return;
        const wasOpen = btn.getAttribute("aria-expanded") === "true";
        closeAll();
        if (!wasOpen) {
          btn.setAttribute("aria-expanded", "true");
          panel.hidden = false;
          requestAnimationFrame(() => {
            requestAnimationFrame(() => panel.classList.add("open"));
          });
        }
      });
    });
  });

  // Esc closes any open panel across all groups
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const openBtn = document.querySelector('[data-pill-group] .qg-btn[aria-expanded="true"]');
    if (!openBtn) return;
    const group = openBtn.closest("[data-pill-group]");
    if (!group) return;
    group.querySelectorAll(".qg-btn").forEach((b) => b.setAttribute("aria-expanded", "false"));
    group.querySelectorAll(".qg-panel").forEach((p) => {
      p.classList.remove("open");
      setTimeout(() => {
        if (!p.classList.contains("open")) p.hidden = true;
      }, 260);
    });
    openBtn.focus();
  });

  // Click outside closes any open panel in that group only
  document.addEventListener("click", (e) => {
    groups.forEach((group) => {
      const openPanel = group.querySelector(".qg-panel.open");
      if (!openPanel) return;
      if (group.contains(e.target)) return;
      group.querySelectorAll(".qg-btn").forEach((b) => b.setAttribute("aria-expanded", "false"));
      group.querySelectorAll(".qg-panel").forEach((p) => {
        p.classList.remove("open");
        setTimeout(() => {
          if (!p.classList.contains("open")) p.hidden = true;
        }, 260);
      });
    });
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
