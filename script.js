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

const loadMoreButton = document.getElementById("load-more-galleries");

if (loadMoreButton) {
  const hiddenAlbums = Array.from(document.querySelectorAll(".project-album.is-hidden"));
  let nextIndex = 0;

  const revealNextGallery = () => {
    const album = hiddenAlbums[nextIndex];

    if (!album) {
      loadMoreButton.style.display = "none";
      return;
    }

    album.classList.remove("is-hidden");
    nextIndex += 1;

    if (nextIndex === 1) {
      loadMoreButton.textContent = "Load More Images";
    }

    if (nextIndex >= hiddenAlbums.length) {
      loadMoreButton.style.display = "none";
    }
  };

  loadMoreButton.addEventListener("click", revealNextGallery);

  if (!hiddenAlbums.length) {
    loadMoreButton.style.display = "none";
  }
}
