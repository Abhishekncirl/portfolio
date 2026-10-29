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
