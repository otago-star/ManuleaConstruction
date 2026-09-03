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
  const formStatus = document.getElementById("form-status");
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (formStatus) {
      formStatus.textContent = "Sending your inquiry...";
      formStatus.className = "form-status is-sending";
    }
    if (submitButton) submitButton.disabled = true;

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });

      if (!response.ok) {
        throw new Error("Form submission failed");
      }

      form.reset();
      if (formStatus) {
        formStatus.textContent = "Thanks, your inquiry has been sent. We will be in touch soon.";
        formStatus.className = "form-status is-success";
      }
    } catch (error) {
      if (formStatus) {
        formStatus.textContent = "We could not send your inquiry. Please email manuleacon@gmail.com directly.";
        formStatus.className = "form-status is-error";
      }
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
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
      loadMoreButton.textContent = "Load More Gallery Images";
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
