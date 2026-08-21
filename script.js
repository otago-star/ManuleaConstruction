const form = document.getElementById("quote-form");
const yearEl = document.getElementById("year");

function enforceCanonicalHost() {
  const currentHost = window.location.hostname;

  // Keep local development hosts untouched.
  if (currentHost === "localhost" || currentHost === "127.0.0.1") {
    return;
  }

  if (currentHost === "manuleaconstruction.co.nz") {
    const target = `https://www.manuleaconstruction.co.nz${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.location.replace(target);
  }
}

enforceCanonicalHost();

function getSeason(month, hemisphere) {
  const seasonMapNorth = {
    11: "winter", 0: "winter", 1: "winter",
    2: "spring", 3: "spring", 4: "spring",
    5: "summer", 6: "summer", 7: "summer",
    8: "autumn", 9: "autumn", 10: "autumn"
  };

  const seasonMapSouth = {
    11: "summer", 0: "summer", 1: "summer",
    2: "autumn", 3: "autumn", 4: "autumn",
    5: "winter", 6: "winter", 7: "winter",
    8: "spring", 9: "spring", 10: "spring"
  };

  return hemisphere === "southern" ? seasonMapSouth[month] : seasonMapNorth[month];
}

function getHoliday(month, day) {
  if ((month === 11 && day >= 1) || (month === 0 && day <= 5)) {
    return "christmas";
  }

  if ((month === 11 && day >= 26) || (month === 0 && day <= 3)) {
    return "newyear";
  }

  if (month === 9 && day >= 24) {
    return "halloween";
  }

  return "";
}

function getTimeBand(hour) {
  if (hour >= 6 && hour < 17) {
    return "day";
  }

  if (hour >= 17 && hour < 21) {
    return "evening";
  }

  return "night";
}

function applyDynamicTheme() {
  if (!document.body) {
    return;
  }

  const now = new Date();
  const nzParts = new Intl.DateTimeFormat("en-NZ", {
    timeZone: "Pacific/Auckland",
    month: "numeric",
    day: "numeric"
  }).formatToParts(now);
  const nzMonth = Number(nzParts.find((part) => part.type === "month").value) - 1;
  const nzDay = Number(nzParts.find((part) => part.type === "day").value);
  const hour = now.getHours();

  const season = getSeason(nzMonth, "southern");
  const holiday = getHoliday(nzMonth, nzDay);
  const timeBand = getTimeBand(hour);

  document.body.classList.remove(
    "time-day",
    "time-evening",
    "time-night",
    "season-summer",
    "season-autumn",
    "season-winter",
    "season-spring",
    "holiday-christmas",
    "holiday-newyear",
    "holiday-halloween"
  );

  document.body.classList.add(`time-${timeBand}`);
  document.body.classList.add(`season-${season}`);

  if (holiday) {
    document.body.classList.add(`holiday-${holiday}`);
  }

  document.body.dataset.timezone = "Pacific/Auckland";
  document.body.dataset.season = season;
  document.body.dataset.timeBand = timeBand;
  document.body.dataset.holiday = holiday || "none";

  const badge = document.getElementById("theme-badge");
  if (badge) {
    const prettySeason = season.charAt(0).toUpperCase() + season.slice(1);
    const prettyTime = timeBand.charAt(0).toUpperCase() + timeBand.slice(1);
    const prettyHoliday = holiday ? holiday.charAt(0).toUpperCase() + holiday.slice(1) : "Standard";
    badge.textContent = `Theme: ${prettyTime} | ${prettySeason} | ${prettyHoliday}`;
  }
}

applyDynamicTheme();
setInterval(applyDynamicTheme, 15 * 60 * 1000);

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

document.querySelectorAll(".review-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = document.getElementById(btn.getAttribute("aria-controls"));
    if (!target) return;
    const isOpen = !target.hidden;
    target.hidden = isOpen;
    btn.setAttribute("aria-expanded", String(!isOpen));
    btn.textContent = isOpen ? "Read Review" : "Close Review";
  });
});

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
