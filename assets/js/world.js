var isAnimating = false;
// var globe = new Globe();
var sections = [];

$(document).ready(function() {
  setSectionLocations();
  setActiveSectionFromScroll();
  createStars();

  createCountdown(
    "#wedding-countdown",
    new Date("2020-05-04T12:00:00-05:00"),
    "the wedding"
  );
  createCountdown(
    "#party-countdown",
    new Date("2020-08-29T12:00:00-05:00"),
    "our celebration"
  );

  $(document).on(
    "scroll",
    throttle(() => {
      if (!isAnimating) setActiveSectionFromScroll();
    }, 100)
  );

  $(window).on(
    "resize",
    throttle(function() {
      setSectionLocations();
      setActiveSectionFromScroll();
    }, 100)
  );

  $("a").on("click", function() {
    const id = $(this).attr("href");
    const target = $(id);
    if (!target.length) return;

    $(this).addClass("is-active");
    isAnimating = true;
    const targetOffset = target.offset();
    $("html, body").animate(
      {
        scrollTop: targetOffset.top,
        scrollLeft: targetOffset.left
      },
      1000,
      function() {
        isAnimating = false;
      }
    );
    return false;
  });
});

function animateToSection(section) {
  if (isAnimating) return;
  setActiveSection(section);
  isAnimating = true;

  const target = $("#" + section);
  const targetOffset = target.offset();
  $("html, body").animate(
    {
      scrollTop: targetOffset.top,
      scrollLeft: targetOffset.left
    },
    1000,
    function() {
      isAnimating = false;
    }
  );
}

function setActiveSectionFromScroll() {
  setActiveSection(getActiveSection());
}

function setActiveSection(section) {
  $(".is-active").removeClass("is-active");
  if (section) {
    $(`a[href='#${section}']`).addClass("is-active");
  }
  // if (section === "home") {
  //   globe.setActive(true);
  // } else {
  //   globe.setActive(false);
  // }
}

function getActiveSection() {
  const top = document.scrollingElement.scrollTop;
  const left = document.scrollingElement.scrollLeft;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const rect = {
    left: left,
    right: left + width,
    top: top,
    bottom: top + height
  };

  for (let i = 0; i < sections.length; ++i) {
    const section = sections[i];
    const xOverlap = Math.max(
      0,
      Math.min(section.right, rect.right) - Math.max(section.left, rect.left)
    );
    const yOverlap = Math.max(
      0,
      Math.min(section.bottom, rect.bottom) - Math.max(section.top, rect.top)
    );
    const overlapArea = xOverlap * yOverlap;
    if (overlapArea > 2000) {
      return section.id;
    }
  }
  return null;
}

function setSectionLocations() {
  sections = [];
  $("section").each(function() {
    sections.push({
      id: this.id,
      top: this.offsetTop,
      left: this.offsetLeft,
      bottom: this.offsetTop + this.clientHeight,
      right: this.offsetLeft + this.clientWidth,
      width: this.clientWidth,
      height: this.clientHeight
    });
  });
}

function createCountdown(el, date, label) {
  function update() {
    let remaining = date.getTime() - new Date().getTime();
    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    remaining = remaining - days * 24 * 60 * 60 * 1000;
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    remaining = remaining - hours * 60 * 60 * 1000;
    const minutes = Math.floor(remaining / (60 * 1000));
    remaining = remaining - minutes * 60 * 1000;
    const seconds = Math.floor(remaining / 1000);
    $(el).html(formatCountdown(days, hours, minutes, seconds, label));
  }
  update();
  setInterval(update, 1000);
}

function createStars() {
  const starTargetSize = 75;
  const starMinSize = 15;
  const starChance = 0.1;
  const rows = Math.round(document.body.clientHeight / starTargetSize);
  const columns = Math.round(document.body.clientWidth / starTargetSize);
  const w = document.body.clientWidth / columns;
  const h = document.body.clientHeight / rows;

  const fragment = document.createDocumentFragment()

  for (let y = 0; y < rows; ++y) {
    for (let x = 0; x < columns; ++x) {
      if (Math.random() < starChance) {
        const size =
          starMinSize + Math.random() * (starTargetSize - starMinSize);
        fragment.appendChild(getStar(x, y, w, h, size))
      }
    }
  }

  document.body.appendChild(fragment)
}

function getStar(x, y, w, h, size) {
  const star = document.createElement("div")
  star.className = `background-star background-star-${Math.ceil(Math.random() * 3)}`
  star.style.transform = `translate(${Math.round(y * h)}px, ${Math.round(x * w)}px)`
  star.style.width = Math.round(size) + 'px'
  star.style.height = Math.round(size) + 'px'
  return star
}

function formatCountdown(days, hours, minutes, seconds, label) {
  days = addZeros(days);
  hours = addZeros(hours);
  minutes = addZeros(minutes);
  seconds = addZeros(seconds);

  return `${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds until ${label}`;
}

function addZeros(n) {
  let str = n + "";
  while (str.length < 2) {
    str = "0" + str;
  }
  return str;
}

function throttle(fn, duration) {
  let waiting;
  let pending;

  const run = () => {
    if (waiting) {
      pending = true;
      return;
    }
    fn();
    waiting = true;
    setTimeout(cleanup, duration);
  };

  const cleanup = () => {
    waiting = false;
    if (!pending) return;
    pending = false;
    run();
  }

  return run;
}
