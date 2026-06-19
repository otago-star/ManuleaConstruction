const form = document.getElementById("quote-form");
const yearEl = document.getElementById("year");

if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("name")?.value.trim() || "";
    const phone = document.getElementById("phone")?.value.trim() || "";
    const address = document.getElementById("address")?.value.trim() || "";
    const details = document.getElementById("details")?.value.trim() || "";

    const subject = encodeURIComponent("Renovation / Repair Project Inquiry");
    const body = encodeURIComponent(
      `Hello Manulea Construction,\n\n` +
      `I would like to discuss renovation/repair services.\n\n` +
      `Name: ${name}\n` +
      `Phone: ${phone}\n` +
      `Property Address: ${address}\n\n` +
      `Project Details:\n${details}\n\n` +
      `Please contact me when available.`
    );

    window.location.href = `mailto:manuleacon@gmail.com?subject=${subject}&body=${body}`;
  });
}

const projectShots = Array.from(document.querySelectorAll(".project-shot"));

if (projectShots.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let frameId = null;

  const renderParallax = () => {
    frameId = null;

    const xNorm = (pointerX / Math.max(window.innerWidth, 1) - 0.5) * 2;
    const yNorm = (pointerY / Math.max(window.innerHeight, 1) - 0.5) * 2;
    const scrollNorm = window.scrollY * 0.03;

    projectShots.forEach((shot, index) => {
      const direction = index % 2 === 0 ? 1 : -1;
      const depth = 14 + (index % 3) * 6;
      const shiftX = xNorm * depth * direction;
      const shiftY = yNorm * depth + Math.sin(scrollNorm + index) * 22 * direction;
      const rotate = xNorm * 4 * direction + yNorm * 2;

      shot.style.transform = `translate3d(${shiftX}px, ${shiftY}px, 0) scale(1.08) rotateZ(${rotate}deg)`;
    });
  };

  const queueParallax = () => {
    if (frameId !== null) {
      return;
    }

    frameId = window.requestAnimationFrame(renderParallax);
  };

  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    queueParallax();
  });

  window.addEventListener("scroll", queueParallax, { passive: true });
  window.addEventListener("resize", queueParallax);

  queueParallax();
}
