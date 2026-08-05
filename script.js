(function () {
  "use strict";

  const SITE_CONFIG = {
    graduateName: "Nguyễn Phương Thảo",
    eventDate: "2026-08-08T15:30:00+07:00",
    eventDurationMinutes: 90,
    venue: "Đại học Văn Lang – Cơ sở 3, Tòa J",
    address: "69/68 Đặng Thùy Trâm, Phường Bình Lợi Trung, TP. HCM",
    mapsQuery: "Trường Đại học Văn Lang Cơ sở 3, Đặng Thùy Trâm, Phường Bình Lợi Trung, Thành phố Hồ Chí Minh",
    contactName: "Nguyên Trí",
    contactPhone: "+84886871437",
    shareText: "Mời bạn đến tham dự Lễ tốt nghiệp của Nguyễn Phương Thảo lúc 15:30 ngày 08.08.2026 tại Đại học Văn Lang – Cơ sở 3."
  };

  const CAMPUS_MAPS = [
    {
      number: "01",
      title: "Đường đến trường",
      description: "Lộ trình tiếp cận Cơ sở 3 qua cổng chính Đặng Thùy Trâm và các cổng đường Dương Quảng Hàm.",
      src: "assets/campus-access-map.jpg",
      alt: "Sơ đồ đường đến cơ sở 3 Đại học Văn Lang, thể hiện cổng chính Đặng Thùy Trâm, cổng Quảng Hàm và hướng tiếp cận bằng ô tô, xe máy.",
      points: [
        { label: "Cổng chính Đặng Thùy Trâm", detail: "Lối vào chính dành cho khách mời trong ngày diễn ra buổi lễ.", x: 64, y: 43, zoom: 2.25 },
        { label: "Cổng phụ đường Quảng Hàm", detail: "Một hướng tiếp cận khác ở phía trên sơ đồ.", x: 43, y: 30, zoom: 2.35 },
        { label: "Cổng đường Quảng Hàm", detail: "Lối tiếp cận từ đường Dương Quảng Hàm ở phía dưới khuôn viên.", x: 43, y: 57, zoom: 2.35 }
      ]
    },
    {
      number: "02",
      title: "Trong khuôn viên",
      description: "Các lối vào, khu vực đón tiếp và hướng di chuyển giữa những tòa nhà trong ngày lễ tốt nghiệp.",
      src: "assets/graduation-campus-map.jpg",
      alt: "Sơ đồ khuôn viên cơ sở 3, thể hiện lối vào, các tòa nhà và hướng di chuyển đến khu vực lễ tốt nghiệp.",
      points: [
        { label: "Cổng chính & khu kiểm soát", detail: "Điểm vào trường từ đường Đặng Thùy Trâm và khu vực kiểm soát an ninh.", x: 65, y: 20, zoom: 2.35 },
        { label: "Tòa J · khu đón tiếp", detail: "Người thân dự lễ tại khu vực đón tiếp có bố trí truyền hình trực tiếp ở Tòa J.", x: 55, y: 53, zoom: 2.5 },
        { label: "Tòa G · hội trường N2T1", detail: "Khu vực đón tiếp và livestream tại Hội trường N2T1, Tòa G.", x: 60, y: 68, zoom: 2.55 },
        { label: "Tòa F · nhận bằng & trả lễ phục", detail: "Phòng đón tiếp, nhận bằng tốt nghiệp và trả lễ phục tại các lầu 3, 4, 5 của Tòa F.", x: 70, y: 68, zoom: 2.55 },
        { label: "Lối ra dành cho tân khoa", detail: "Lối ra dành riêng cho tân khoa theo hướng đường Hòa Trạng Nguyên.", x: 69, y: 46, zoom: 2.4 }
      ]
    }
  ];

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const openingScreen = document.getElementById("openingScreen");
  const pageShell = document.getElementById("pageShell");
  const openButton = document.getElementById("openInvitation");
  const openHint = document.getElementById("openHint");
  const skipButton = document.getElementById("skipOpening");
  const skipLink = document.getElementById("skipLink");
  const confettiLayer = document.getElementById("confettiLayer");
  const toast = document.getElementById("toast");
  const dialog = document.getElementById("responseDialog");
  const dialogClose = document.getElementById("dialogClose");
  const wishField = document.getElementById("wishField");
  const wishInput = document.getElementById("wishInput");
  const smsLink = document.getElementById("smsLink");
  const copyMessageButton = document.getElementById("copyMessage");
  let invitationOpened = false;
  let countdownTimer = 0;
  let toastTimer = 0;
  let dialogTrigger = null;
  let dialogMode = "yes";
  let personalizedGuest = "";

  function getGuestFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const rawGuest = params.get("guest") || params.get("to") || "";
    return rawGuest.replace(/\s+/g, " ").trim().slice(0, 80);
  }

  function applyPersonalization() {
    const guestNameElements = Array.from(document.querySelectorAll("[data-guest-name]"));
    const legacyGuestName = document.getElementById("guestName");

    if (legacyGuestName && !guestNameElements.includes(legacyGuestName)) {
      guestNameElements.push(legacyGuestName);
    }

    const domGuest = guestNameElements.reduce(function (name, element) {
      if (name) return name;
      return (element.textContent || "").replace(/\s+/g, " ").trim();
    }, "");

    personalizedGuest = getGuestFromUrl() || domGuest || "Nguyên Trí";

    const nameLength = Array.from(personalizedGuest.replace(/\s+/g, "")).length;
    const lengthGroup = nameLength <= 10 ? "short" : nameLength <= 18 ? "medium" : "long";

    guestNameElements.forEach(function (element) {
      element.textContent = personalizedGuest;
      element.setAttribute("data-name-length", lengthGroup);
    });

    document.title = "Thiệp mời " + personalizedGuest + " · Graduation Phương Thảo";

    try {
      const rsvpStatus = document.getElementById("rsvpStatus");
      if (rsvpStatus && window.localStorage.getItem("phuong-thao-rsvp") === "yes") {
        rsvpStatus.textContent = "Đã ghi nhận: bạn sẽ đến chung vui cùng Phương Thảo ♥";
      }
    } catch (error) {
      // Storage can be unavailable in private browsing; the invitation still works.
    }
  }

  function prepareMainPage() {
    pageShell.classList.add("is-visible", "is-bridging");
    document.querySelectorAll("#invitation [data-reveal]").forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  function activateMainPage() {
    pageShell.removeAttribute("inert");
    pageShell.setAttribute("aria-hidden", "false");
    document.body.classList.remove("is-locked");
  }

  function revealMainPage() {
    pageShell.classList.add("is-visible", "is-entered");
    pageShell.classList.remove("is-bridging");
    activateMainPage();
  }

  function clearOpeningBridgeArtifacts() {
    document.querySelectorAll(".shared-transition").forEach(function (layer) { layer.remove(); });
    const letter = document.querySelector(".letter-card");
    if (letter) letter.style.opacity = "";
    openingScreen.classList.remove("is-opening", "flap-opened", "is-bridging");
  }

  function completeOpeningImmediately() {
    clearOpeningBridgeArtifacts();
    revealMainPage();
    openingScreen.classList.add("is-covered", "is-complete");
    openingScreen.setAttribute("aria-hidden", "true");
    openButton.blur();
  }

  function nextPaint() {
    return new Promise(function (resolve) {
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(resolve);
      });
    });
  }

  function waitForAnimation(animation, timeoutMs) {
    return new Promise(function (resolve) {
      let settled = false;
      const timer = window.setTimeout(function () {
        if (settled) return;
        settled = true;
        resolve(false);
      }, timeoutMs);

      animation.finished.then(function () {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        resolve(true);
      }, function () {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        resolve(false);
      });
    });
  }

  function createSharedLayer(letter, source) {
    const layer = document.createElement("div");
    const surface = document.createElement("div");
    const tint = document.createElement("div");
    const sourceCopy = letter.querySelector(".letter-card-content");
    const copy = sourceCopy.cloneNode(true);

    layer.className = "shared-transition";
    layer.setAttribute("aria-hidden", "true");
    surface.className = "shared-surface";
    tint.className = "shared-paper-tint";
    copy.className = "shared-letter-copy";
    copy.style.left = String(source.left) + "px";
    copy.style.top = String(source.top) + "px";
    copy.style.width = String(source.width) + "px";
    copy.style.height = String(source.height) + "px";

    surface.appendChild(tint);
    layer.appendChild(surface);
    layer.appendChild(copy);

    return { layer: layer, surface: surface, tint: tint, copy: copy };
  }

  async function bridgeLetterToPage() {
    const letter = document.querySelector(".letter-card");
    const envelopeScene = document.getElementById("envelopeScene");

    if (!letter || !envelopeScene || typeof letter.animate !== "function") {
      completeOpeningImmediately();
      return;
    }

    const source = letter.getBoundingClientRect();
    prepareMainPage();
    openingScreen.classList.add("is-bridging");

    const shared = createSharedLayer(letter, source);
    document.body.appendChild(shared.layer);

    const target = shared.surface.getBoundingClientRect();
    const fromTransform = "translate3d(" + String(source.left - target.left) + "px," +
      String(source.top - target.top) + "px,0) scale(" +
      String(source.width / target.width) + "," + String(source.height / target.height) + ")";

    shared.surface.style.transform = fromTransform;
    await nextPaint();
    letter.style.opacity = "0";

    let finalized = false;
    const animations = [];
    const bridgeStartWidth = window.innerWidth;

    function finalizeBridge(withConfetti) {
      if (finalized) return;
      finalized = true;
      animations.forEach(function (animation) {
        try { animation.cancel(); } catch (error) { /* The animation may already be idle. */ }
      });
      window.removeEventListener("resize", handleBridgeResize);
      shared.layer.remove();
      letter.style.opacity = "";
      openingScreen.classList.remove("is-opening", "flap-opened", "is-bridging");
      openingScreen.classList.add("is-covered", "is-complete");
      openingScreen.setAttribute("aria-hidden", "true");
      pageShell.classList.remove("is-bridging");
      pageShell.classList.add("is-entered");
      activateMainPage();
      openButton.blur();
      document.getElementById("invitation").focus({ preventScroll: true });
      if (withConfetti) createConfetti(12);
    }

    function handleBridgeResize() {
      if (Math.abs(window.innerWidth - bridgeStartWidth) > 32) finalizeBridge(false);
    }

    window.addEventListener("resize", handleBridgeResize, { passive: true });

    let surfaceMotion;
    try {
      surfaceMotion = shared.surface.animate([
        { transform: fromTransform },
        { transform: "translate3d(0,0,0) scale(1,1)" }
      ], {
        duration: 720,
        easing: "cubic-bezier(.22,1,.36,1)",
        fill: "forwards"
      });
      animations.push(surfaceMotion);

      animations.push(shared.tint.animate([
        { opacity: 1 },
        { opacity: 1, offset: 0.4 },
        { opacity: 0 }
      ], {
        duration: 720,
        easing: "ease-out",
        fill: "forwards"
      }));

      animations.push(shared.copy.animate([
        { opacity: 1, transform: "translate3d(0,0,0) scale(1)" },
        { opacity: 0, transform: "translate3d(0,-8px,0) scale(1.06)" }
      ], {
        duration: 420,
        delay: 80,
        easing: "cubic-bezier(.22,1,.36,1)",
        fill: "forwards"
      }));

      animations.push(envelopeScene.animate([
        { opacity: 1, transform: "translate3d(0,0,0) scale(1)" },
        { opacity: 0, transform: "translate3d(0,8vh,0) scale(.94)" }
      ], {
        duration: 540,
        delay: 80,
        easing: "cubic-bezier(.65,0,.35,1)",
        fill: "forwards"
      }));
    } catch (error) {
      finalizeBridge(false);
      return;
    }

    const surfaceCompleted = await waitForAnimation(surfaceMotion, 1300);
    if (!surfaceCompleted) {
      if (!finalized) finalizeBridge(false);
      return;
    }

    if (finalized) return;
    openingScreen.classList.add("is-covered");
    pageShell.classList.remove("is-bridging");
    pageShell.classList.add("is-entered");

    let layerFade;
    try {
      layerFade = shared.layer.animate([
        { opacity: 1 },
        { opacity: 0 }
      ], {
        duration: 300,
        easing: "cubic-bezier(.65,0,.35,1)",
        fill: "forwards"
      });
    } catch (error) {
      finalizeBridge(false);
      return;
    }
    animations.push(layerFade);

    await waitForAnimation(layerFade, 700);
    finalizeBridge(true);
  }

  function finishOpening(skipAnimation) {
    if (invitationOpened) return;
    invitationOpened = true;
    openButton.disabled = true;
    openHint.disabled = true;
    skipButton.disabled = true;

    if (skipAnimation || reducedMotion) {
      completeOpeningImmediately();
      window.setTimeout(function () {
        document.getElementById("invitation").focus({ preventScroll: true });
      }, 30);
      return;
    }

    openingScreen.classList.add("is-opening");
    window.setTimeout(function () {
      openingScreen.classList.add("flap-opened");
    }, 470);
    window.setTimeout(function () {
      bridgeLetterToPage().catch(function () {
        completeOpeningImmediately();
      });
    }, 1030);
  }

  function createConfetti(amount) {
    if (reducedMotion || document.hidden) return;
    const total = typeof amount === "number" ? amount : 24;
    const colors = ["#620914", "#8f2935", "#dbba76", "#f1d9a4", "#fffdf7"];
    const fragment = document.createDocumentFragment();

    for (let index = 0; index < total; index += 1) {
      const piece = document.createElement("i");
      piece.className = "confetti-piece";
      piece.style.setProperty("--x", String(5 + Math.random() * 90) + "%");
      piece.style.setProperty("--w", String(5 + Math.random() * 7) + "px");
      piece.style.setProperty("--color", colors[index % colors.length]);
      piece.style.setProperty("--duration", String(1.45 + Math.random() * 0.8) + "s");
      piece.style.setProperty("--delay", String(Math.random() * 0.28) + "s");
      piece.style.setProperty("--drift", String(-90 + Math.random() * 180) + "px");
      piece.style.setProperty("--spin", String(-540 + Math.random() * 1080) + "deg");
      fragment.appendChild(piece);
    }

    confettiLayer.replaceChildren(fragment);
    window.setTimeout(function () {
      confettiLayer.replaceChildren();
    }, 3100);
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 3000);
  }

  function setupRevealAnimations() {
    const items = Array.from(document.querySelectorAll("[data-reveal]"));

    items.forEach(function (item) {
      const parent = item.parentElement;
      if (!parent) return;
      const siblings = Array.from(parent.children).filter(function (child) {
        return child.hasAttribute && child.hasAttribute("data-reveal");
      });
      const position = siblings.indexOf(item);
      if (position > 0) {
        item.style.setProperty("--reveal-delay", String(Math.min(position * 85, 255)) + "ms");
      }
    });

    if (reducedMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (item) { item.classList.add("is-visible"); });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.13, rootMargin: "0px 0px -5% 0px" });

    items.forEach(function (item) { observer.observe(item); });
  }

  function setupScrollEffects() {
    const progress = document.querySelector(".scroll-progress span");
    const topbar = document.getElementById("topbar");
    if (!progress && !topbar) return;

    let frame = 0;

    function paint() {
      const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const ratio = Math.min(1, Math.max(0, window.scrollY / scrollable));
      if (progress) progress.style.transform = "scaleX(" + String(ratio) + ")";
      if (topbar) topbar.classList.toggle("is-active", invitationOpened && window.scrollY > 110);
      frame = 0;
    }

    function requestPaint() {
      if (!frame) frame = window.requestAnimationFrame(paint);
    }

    window.addEventListener("scroll", requestPaint, { passive: true });
    window.addEventListener("resize", requestPaint, { passive: true });
    paint();
  }

  function setupPointerMotion() {
    if (reducedMotion || !window.matchMedia("(pointer: fine) and (min-width: 821px)").matches) return;

    const portraitWrap = document.querySelector("[data-parallax-card]");
    const portraitCard = portraitWrap ? portraitWrap.querySelector(".portrait-card") : null;

    if (portraitWrap && portraitCard) {
      let portraitFrame = 0;
      let portraitX = 0;
      let portraitY = 0;

      function paintPortrait() {
        portraitCard.style.setProperty("--tilt-x", String(portraitY * -3.2) + "deg");
        portraitCard.style.setProperty("--tilt-y", String(portraitX * 3.7) + "deg");
        portraitFrame = 0;
      }

      portraitWrap.addEventListener("pointermove", function (event) {
        const bounds = portraitWrap.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        portraitX = (event.clientX - bounds.left) / bounds.width - 0.5;
        portraitY = (event.clientY - bounds.top) / bounds.height - 0.5;
        if (!portraitFrame) portraitFrame = window.requestAnimationFrame(paintPortrait);
      }, { passive: true });

      portraitWrap.addEventListener("pointerleave", function () {
        portraitX = 0;
        portraitY = 0;
        if (!portraitFrame) portraitFrame = window.requestAnimationFrame(paintPortrait);
      }, { passive: true });
    }

    const collage = document.querySelector("[data-collage]");
    if (collage) {
      const collageItems = Array.from(collage.querySelectorAll("[data-depth]"));
      let collageFrame = 0;
      let collageX = 0;
      let collageY = 0;

      function paintCollage() {
        collageItems.forEach(function (item) {
          const depth = Number(item.getAttribute("data-depth")) || 0;
          item.style.setProperty("--collage-x", String(collageX * depth) + "px");
          item.style.setProperty("--collage-y", String(collageY * depth) + "px");
        });
        collageFrame = 0;
      }

      collage.addEventListener("pointermove", function (event) {
        const bounds = collage.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        collageX = (event.clientX - bounds.left) / bounds.width - 0.5;
        collageY = (event.clientY - bounds.top) / bounds.height - 0.5;
        if (!collageFrame) collageFrame = window.requestAnimationFrame(paintCollage);
      }, { passive: true });

      collage.addEventListener("pointerleave", function () {
        collageX = 0;
        collageY = 0;
        if (!collageFrame) collageFrame = window.requestAnimationFrame(paintCollage);
      }, { passive: true });
    }

    const sourceCollage = document.querySelector("[data-source-collage]");
    if (sourceCollage) {
      const sourceItems = Array.from(sourceCollage.querySelectorAll("[data-depth]"));
      let sourceFrame = 0;
      let sourceX = 0;
      let sourceY = 0;

      function paintSourceCollage() {
        sourceCollage.style.setProperty("--source-tilt-x", String(sourceY * -1.4) + "deg");
        sourceCollage.style.setProperty("--source-tilt-y", String(sourceX * 1.7) + "deg");
        sourceItems.forEach(function (item) {
          const depth = Number(item.getAttribute("data-depth")) || 0;
          item.style.setProperty("--source-depth-x", String(sourceX * depth) + "px");
          item.style.setProperty("--source-depth-y", String(sourceY * depth) + "px");
        });
        sourceFrame = 0;
      }

      sourceCollage.addEventListener("pointermove", function (event) {
        const bounds = sourceCollage.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        sourceX = (event.clientX - bounds.left) / bounds.width - 0.5;
        sourceY = (event.clientY - bounds.top) / bounds.height - 0.5;
        if (!sourceFrame) sourceFrame = window.requestAnimationFrame(paintSourceCollage);
      }, { passive: true });

      sourceCollage.addEventListener("pointerleave", function () {
        sourceX = 0;
        sourceY = 0;
        if (!sourceFrame) sourceFrame = window.requestAnimationFrame(paintSourceCollage);
      }, { passive: true });
    }
  }

  function updateCountdown() {
    const target = new Date(SITE_CONFIG.eventDate).getTime();
    const distance = target - Date.now();
    const message = document.getElementById("countdownMessage");
    const units = ["days", "hours", "minutes", "seconds"];
    const unitElements = units.reduce(function (elements, unit) {
      const element = document.querySelector("[data-unit='" + unit + "']");
      if (element) elements[unit] = element;
      return elements;
    }, {});

    if (!message && !Object.keys(unitElements).length) return;

    if (!Number.isFinite(target) || distance <= 0) {
      Object.keys(unitElements).forEach(function (unit) {
        unitElements[unit].textContent = "00";
      });
      if (message) message.textContent = "Hôm nay là ngày Phương Thảo tỏa sáng — chúc mừng tân cử nhân!";
      window.clearInterval(countdownTimer);
      return;
    }

    const values = {
      days: Math.floor(distance / 86400000),
      hours: Math.floor((distance % 86400000) / 3600000),
      minutes: Math.floor((distance % 3600000) / 60000),
      seconds: Math.floor((distance % 60000) / 1000)
    };

    Object.keys(values).forEach(function (unit) {
      const element = unitElements[unit];
      if (element) element.textContent = String(values[unit]).padStart(2, "0");
    });
  }

  function startCountdown() {
    window.clearInterval(countdownTimer);
    if (!document.getElementById("countdownMessage") && !document.querySelector("[data-unit]")) return;
    updateCountdown();
    if (!document.hidden) countdownTimer = window.setInterval(updateCountdown, 1000);
  }

  function toICSDate(date) {
    return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  }

  function escapeICS(value) {
    return String(value)
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  }

  function downloadCalendarEvent() {
    const start = new Date(SITE_CONFIG.eventDate);
    if (!Number.isFinite(start.getTime())) {
      showToast("Ngày diễn ra sự kiện chưa hợp lệ.");
      return;
    }

    const end = new Date(start.getTime() + SITE_CONFIG.eventDurationMinutes * 60000);
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Phuong Thao Graduation Invitation//VI",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:" + String(start.getTime()) + "@phuong-thao-graduation",
      "DTSTAMP:" + toICSDate(new Date()),
      "DTSTART:" + toICSDate(start),
      "DTEND:" + toICSDate(end),
      "SUMMARY:" + escapeICS("Lễ tốt nghiệp của Nguyễn Phương Thảo"),
      "DESCRIPTION:" + escapeICS(SITE_CONFIG.shareText),
      "LOCATION:" + escapeICS(SITE_CONFIG.venue + ", " + SITE_CONFIG.address),
      "END:VEVENT",
      "END:VCALENDAR"
    ];

    const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Le-tot-nghiep-Nguyen-Phuong-Thao.ics";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    showToast("Đã tạo lịch hẹn cho ngày 08.08.2026.");
  }

  function openMap() {
    const url = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(SITE_CONFIG.mapsQuery);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function shareInvitation() {
    const shareData = {
      title: "Graduation Invitation · Nguyễn Phương Thảo",
      text: SITE_CONFIG.shareText,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Đã sao chép đường dẫn thiệp mời.");
    } catch (error) {
      window.prompt("Sao chép đường dẫn thiệp mời:", window.location.href);
    }
  }

  function rsvpMessage() {
    const namePrefix = personalizedGuest ? personalizedGuest + " xác nhận" : "Mình xác nhận";
    if (dialogMode === "wish") {
      const wish = wishInput.value.trim();
      const sender = personalizedGuest ? " — " + personalizedGuest : "";
      return "Chúc mừng tốt nghiệp Phương Thảo!" + (wish ? " " + wish : " Chúc bạn luôn rạng rỡ và thật thành công trên chặng đường mới!") + sender;
    }
    return namePrefix + " sẽ tham dự Lễ tốt nghiệp của Phương Thảo lúc 15:30 ngày 08.08.2026 tại Đại học Văn Lang – Cơ sở 3. Hẹn gặp mọi người nhé!";
  }

  function updateSmsLink() {
    const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const separator = isiOS ? "&" : "?";
    smsLink.href = "sms:" + SITE_CONFIG.contactPhone + separator + "body=" + encodeURIComponent(rsvpMessage());
  }

  function openResponseDialog(mode, trigger) {
    dialogMode = mode;
    dialogTrigger = trigger;
    const title = document.getElementById("dialogTitle");
    const eyebrow = document.getElementById("dialogEyebrow");
    const copy = document.getElementById("dialogCopy");

    if (mode === "wish") {
      eyebrow.textContent = "Send your love";
      title.textContent = "Gửi Phương Thảo một lời chúc";
      copy.textContent = "Bạn có thể viết lời chúc bên dưới rồi gửi trực tiếp qua tin nhắn.";
      wishField.hidden = false;
      smsLink.textContent = "Gửi lời chúc";
    } else {
      eyebrow.textContent = "See you there";
      title.textContent = "Hẹn gặp bạn nhé!";
      copy.textContent = "Mình đã chuẩn bị sẵn lời nhắn xác nhận để bạn gửi cho Nguyên Trí.";
      wishField.hidden = true;
      smsLink.textContent = "Gửi qua tin nhắn";
      document.getElementById("rsvpStatus").textContent = "Đã ghi nhận: bạn sẽ đến chung vui cùng Phương Thảo ♥";
      try { window.localStorage.setItem("phuong-thao-rsvp", "yes"); } catch (error) { /* no-op */ }
      createConfetti(16);
    }

    updateSmsLink();
    dialog.hidden = false;
    document.body.classList.add("dialog-open");
    window.requestAnimationFrame(function () {
      dialog.classList.add("is-visible");
      if (mode === "wish") wishInput.focus();
      else dialogClose.focus();
    });
  }

  function closeResponseDialog() {
    if (dialog.hidden) return;
    dialog.classList.remove("is-visible");
    document.body.classList.remove("dialog-open");
    window.setTimeout(function () {
      dialog.hidden = true;
      if (dialogTrigger) dialogTrigger.focus();
    }, reducedMotion ? 0 : 260);
  }

  async function copyRsvpMessage() {
    const message = rsvpMessage();
    updateSmsLink();
    try {
      await navigator.clipboard.writeText(message);
    } catch (error) {
      const temporary = document.createElement("textarea");
      temporary.value = message;
      temporary.setAttribute("readonly", "");
      temporary.style.position = "fixed";
      temporary.style.opacity = "0";
      document.body.appendChild(temporary);
      temporary.select();
      document.execCommand("copy");
      temporary.remove();
    }
    showToast("Đã sao chép lời nhắn.");
  }

  function setupCampusMaps() {
    const section = document.getElementById("campus-map");
    const previewTabs = Array.from(document.querySelectorAll("[data-map-tab]"));
    const previewSlides = Array.from(document.querySelectorAll("[data-map-slide]"));
    const previewOpenButtons = Array.from(document.querySelectorAll("[data-open-map]"));
    const expandButton = document.getElementById("mapExpandButton");
    const mapNumber = document.getElementById("mapNumber");
    const mapTitle = document.getElementById("mapTitle");
    const mapDescription = document.getElementById("mapDescription");
    const quickPoints = document.getElementById("mapQuickPoints");
    const modal = document.getElementById("mapModal");
    const modalClose = document.getElementById("mapModalClose");
    const modalTabs = Array.from(document.querySelectorAll("[data-map-modal-tab]"));
    const modalTitle = document.getElementById("mapModalTitle");
    const modalDescription = document.getElementById("mapModalDescription");
    const modalStage = document.getElementById("mapModalStage");
    const mapCanvas = document.getElementById("mapCanvas");
    const modalImage = document.getElementById("mapModalImage");
    const modalHotspots = document.getElementById("mapModalHotspots");
    const zoomOutButton = document.getElementById("mapZoomOut");
    const zoomInButton = document.getElementById("mapZoomIn");
    const resetButton = document.getElementById("mapReset");
    const zoomLevel = document.getElementById("mapZoomLevel");

    if (!section || !modal || !modalStage || !mapCanvas || !modalImage) return;

    let activeIndex = 0;
    let modalIndex = 0;
    let modalTrigger = null;
    let closeTimer = 0;
    let modalClosing = false;
    let modalRenderToken = 0;
    let scale = 1;
    let panX = 0;
    let panY = 0;
    let transformFrame = 0;
    let viewAnimationFrame = 0;
    let viewAnimationToken = 0;
    let viewTargetScale = 1;
    let movingTimer = 0;
    let gesture = null;
    let lastTap = { time: 0, x: 0, y: 0 };
    const viewMetrics = { stageWidth: 0, stageHeight: 0, canvasWidth: 0, canvasHeight: 0 };
    const pointers = new Map();
    const pointerStarts = new Map();
    const capturedPointers = new Set();

    function boundedIndex(value) {
      const parsed = Number(value);
      return Number.isInteger(parsed) && parsed >= 0 && parsed < CAMPUS_MAPS.length ? parsed : 0;
    }

    function renderHotspots(container, mapIndex, inModal) {
      const map = CAMPUS_MAPS[mapIndex];
      const fragment = document.createDocumentFragment();

      map.points.forEach(function (point, pointIndex) {
        const button = document.createElement("button");
        button.className = "map-hotspot";
        button.type = "button";
        button.style.left = String(point.x) + "%";
        button.style.top = String(point.y) + "%";
        button.setAttribute("data-label", point.label);
        button.setAttribute("aria-label", point.label + ". " + point.detail);
        button.title = point.label;
        button.addEventListener("click", function (event) {
          event.stopPropagation();
          if (inModal) {
            focusMapPoint(pointIndex);
          } else {
            openMapModal(mapIndex, pointIndex, button);
          }
        });
        fragment.appendChild(button);
      });

      container.replaceChildren(fragment);
    }

    function renderQuickPoints(mapIndex) {
      const map = CAMPUS_MAPS[mapIndex];
      const fragment = document.createDocumentFragment();

      map.points.forEach(function (point, pointIndex) {
        const button = document.createElement("button");
        button.className = "map-point-chip";
        button.type = "button";
        button.textContent = point.label;
        button.addEventListener("click", function () {
          openMapModal(mapIndex, pointIndex, button);
        });
        fragment.appendChild(button);
      });

      quickPoints.replaceChildren(fragment);
    }

    function setPreviewMap(index, focusTab) {
      const nextIndex = boundedIndex(index);
      activeIndex = nextIndex;

      previewTabs.forEach(function (tab, tabIndex) {
        const selected = tabIndex === nextIndex;
        tab.classList.toggle("is-active", selected);
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });

      previewSlides.forEach(function (slide, slideIndex) {
        if (slideIndex === nextIndex) {
          slide.hidden = false;
          slide.removeAttribute("inert");
          slide.setAttribute("aria-hidden", "false");
          window.requestAnimationFrame(function () {
            if (activeIndex === slideIndex) slide.classList.add("is-active");
          });
        } else {
          slide.classList.remove("is-active");
          slide.setAttribute("inert", "");
          slide.setAttribute("aria-hidden", "true");
          window.setTimeout(function () {
            if (activeIndex !== slideIndex) slide.hidden = true;
          }, reducedMotion ? 0 : 440);
        }
      });

      const map = CAMPUS_MAPS[nextIndex];
      mapNumber.textContent = map.number;
      mapTitle.textContent = map.title;
      mapDescription.textContent = map.description;
      renderQuickPoints(nextIndex);

      if (focusTab && previewTabs[nextIndex]) previewTabs[nextIndex].focus();
    }

    function markCanvasMoving() {
      window.clearTimeout(movingTimer);
      mapCanvas.classList.add("is-moving");
      movingTimer = window.setTimeout(function () {
        if (!pointers.size) mapCanvas.classList.remove("is-moving");
      }, 180);
    }

    function syncCanvasFit() {
      const stageWidth = modalStage.clientWidth;
      const stageHeight = modalStage.clientHeight;
      if (stageWidth < 40 || stageHeight < 40) return false;

      const canvasWidth = Math.max(80, Math.min(stageWidth - 2, (stageHeight - 2) * 2));
      viewMetrics.stageWidth = stageWidth;
      viewMetrics.stageHeight = stageHeight;
      viewMetrics.canvasWidth = canvasWidth;
      viewMetrics.canvasHeight = canvasWidth / 2;
      mapCanvas.style.width = String(canvasWidth) + "px";
      return true;
    }

    function clampPan() {
      if (!viewMetrics.canvasWidth || !viewMetrics.stageWidth) return;
      const maxX = Math.max(0, (viewMetrics.canvasWidth * scale - viewMetrics.stageWidth) / 2);
      const maxY = Math.max(0, (viewMetrics.canvasHeight * scale - viewMetrics.stageHeight) / 2);
      panX = Math.min(maxX, Math.max(-maxX, panX));
      panY = Math.min(maxY, Math.max(-maxY, panY));
    }

    function paintMapTransform() {
      clampPan();
      mapCanvas.style.transform = "translate3d(-50%,-50%,0) translate3d(" +
        String(panX) + "px," + String(panY) + "px,0) scale(" + String(scale) + ")";
      mapCanvas.style.setProperty("--map-inverse-scale", String(1 / scale));
      const nextZoomLabel = String(Math.round(scale * 100)) + "%";
      const atMinimum = scale <= 1.001;
      const atMaximum = scale >= 5;
      if (zoomLevel.textContent !== nextZoomLabel) zoomLevel.textContent = nextZoomLabel;
      if (zoomOutButton.disabled !== atMinimum) zoomOutButton.disabled = atMinimum;
      if (zoomInButton.disabled !== atMaximum) zoomInButton.disabled = atMaximum;
      transformFrame = 0;
    }

    function requestTransform() {
      if (!transformFrame) transformFrame = window.requestAnimationFrame(paintMapTransform);
    }

    function cancelMapViewAnimation() {
      viewAnimationToken += 1;
      if (viewAnimationFrame) window.cancelAnimationFrame(viewAnimationFrame);
      viewAnimationFrame = 0;
      viewTargetScale = scale;
    }

    function animateMapView(nextScale, nextPanX, nextPanY, duration) {
      cancelMapViewAnimation();
      const token = viewAnimationToken;
      const startScale = scale;
      const startPanX = panX;
      const startPanY = panY;
      const startTime = performance.now();
      const animationDuration = duration || 320;
      viewTargetScale = nextScale;

      window.clearTimeout(movingTimer);
      mapCanvas.classList.add("is-moving");

      function step(now) {
        if (token !== viewAnimationToken) return;
        const progress = Math.min(1, (now - startTime) / animationDuration);
        const eased = 1 - Math.pow(1 - progress, 3);
        scale = startScale + (nextScale - startScale) * eased;
        panX = startPanX + (nextPanX - startPanX) * eased;
        panY = startPanY + (nextPanY - startPanY) * eased;
        if (transformFrame) {
          window.cancelAnimationFrame(transformFrame);
          transformFrame = 0;
        }
        paintMapTransform();

        if (progress < 1) {
          viewAnimationFrame = window.requestAnimationFrame(step);
        } else {
          viewAnimationFrame = 0;
          markCanvasMoving();
        }
      }

      viewAnimationFrame = window.requestAnimationFrame(step);
    }

    function setMapZoom(nextScale, anchor, smooth) {
      const previousScale = scale;
      const clampedScale = Math.min(5, Math.max(1, nextScale));
      if (Math.abs(clampedScale - previousScale) < 0.001) return;
      let nextPanX = panX;
      let nextPanY = panY;

      if (anchor) {
        const bounds = modalStage.getBoundingClientRect();
        const anchorX = anchor.clientX - (bounds.left + bounds.width / 2);
        const anchorY = anchor.clientY - (bounds.top + bounds.height / 2);
        const ratio = clampedScale / previousScale;
        nextPanX += (anchorX - nextPanX) * (1 - ratio);
        nextPanY += (anchorY - nextPanY) * (1 - ratio);
      }

      if (smooth && !reducedMotion) {
        animateMapView(clampedScale, nextPanX, nextPanY, 300);
        return;
      }

      cancelMapViewAnimation();
      scale = clampedScale;
      panX = nextPanX;
      panY = nextPanY;
      viewTargetScale = scale;
      markCanvasMoving();
      requestTransform();
    }

    function resetMapView(restoreDescription, smooth) {
      syncCanvasFit();
      if (restoreDescription !== false) {
        modalTitle.textContent = CAMPUS_MAPS[modalIndex].title;
        modalDescription.textContent = CAMPUS_MAPS[modalIndex].description;
      }

      if (smooth && !reducedMotion) {
        animateMapView(1, 0, 0, 320);
        return;
      }

      cancelMapViewAnimation();
      scale = 1;
      panX = 0;
      panY = 0;
      viewTargetScale = scale;
      markCanvasMoving();
      requestTransform();
    }

    function focusMapPoint(pointIndex) {
      const map = CAMPUS_MAPS[modalIndex];
      const point = map.points[pointIndex];
      if (!point) return;

      syncCanvasFit();
      const targetScale = Math.min(5, Math.max(1, point.zoom || 2.3));
      const targetPanX = -((point.x / 100) - 0.5) * viewMetrics.canvasWidth * targetScale;
      const targetPanY = -((point.y / 100) - 0.5) * viewMetrics.canvasHeight * targetScale;
      modalTitle.textContent = point.label;
      modalDescription.textContent = point.label + " — " + point.detail;
      modalStage.classList.add("has-interacted");
      if (reducedMotion) {
        cancelMapViewAnimation();
        scale = targetScale;
        panX = targetPanX;
        panY = targetPanY;
        viewTargetScale = scale;
        requestTransform();
      } else {
        animateMapView(targetScale, targetPanX, targetPanY, 380);
      }
    }

    function updateModalMap(index, pointIndex) {
      modalIndex = boundedIndex(index);
      const map = CAMPUS_MAPS[modalIndex];
      const requestedIndex = modalIndex;
      const renderToken = ++modalRenderToken;

      modalTabs.forEach(function (tab, tabIndex) {
        const selected = tabIndex === modalIndex;
        tab.classList.toggle("is-active", selected);
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });

      modalTitle.textContent = map.title;
      modalDescription.textContent = map.description;
      mapCanvas.classList.add("is-loading");
      modalImage.src = map.src;
      modalImage.alt = map.alt;
      renderHotspots(modalHotspots, modalIndex, true);
      modalStage.classList.remove("has-interacted");
      resetMapView(false);

      const decoded = typeof modalImage.decode === "function" ? modalImage.decode().catch(function () {}) : Promise.resolve();
      decoded.then(nextPaint).then(function () {
        if (renderToken !== modalRenderToken || modal.hidden || modalClosing || modalIndex !== requestedIndex) return;
        mapCanvas.classList.remove("is-loading");
        syncCanvasFit();
        if (Number.isInteger(pointIndex)) focusMapPoint(pointIndex);
        else requestTransform();
      });
    }

    function openMapModal(index, pointIndex, trigger) {
      window.clearTimeout(closeTimer);
      modalClosing = false;
      modalTrigger = trigger || document.activeElement;
      setPreviewMap(index, false);
      modal.hidden = false;
      modal.setAttribute("aria-hidden", "false");
      pageShell.setAttribute("inert", "");
      document.body.classList.add("map-open");
      updateModalMap(index, pointIndex);

      window.requestAnimationFrame(function () {
        syncCanvasFit();
        requestTransform();
        modal.classList.add("is-visible");
        modalClose.focus({ preventScroll: true });
      });
    }

    function closeMapModal() {
      if (modal.hidden || modalClosing) return;
      modalClosing = true;
      modalRenderToken += 1;
      cancelMapViewAnimation();
      window.clearTimeout(closeTimer);
      modal.classList.remove("is-visible");
      pointers.clear();
      pointerStarts.clear();
      capturedPointers.clear();
      gesture = null;
      modalStage.classList.remove("is-dragging");
      mapCanvas.classList.remove("is-moving");

      closeTimer = window.setTimeout(function () {
        modal.hidden = true;
        modalClosing = false;
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("map-open");
        pageShell.removeAttribute("inert");
        let focusTarget = modalTrigger;
        if (!focusTarget || !focusTarget.isConnected || focusTarget.closest("[hidden]") || focusTarget.closest("[inert]")) {
          focusTarget = previewTabs[activeIndex] || expandButton;
        }
        if (focusTarget && typeof focusTarget.focus === "function") {
          focusTarget.focus({ preventScroll: true });
        }
      }, reducedMotion ? 0 : 240);
    }

    function captureGesture() {
      const values = Array.from(pointers.values());
      const bounds = modalStage.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      if (values.length === 1) {
        gesture = {
          mode: "pan",
          x: values[0].x,
          y: values[0].y,
          panX: panX,
          panY: panY,
          centerX: centerX,
          centerY: centerY
        };
        return;
      }

      if (values.length >= 2) {
        const first = values[0];
        const second = values[1];
        gesture = {
          mode: "pinch",
          distance: Math.max(1, Math.hypot(second.x - first.x, second.y - first.y)),
          midX: (first.x + second.x) / 2,
          midY: (first.y + second.y) / 2,
          scale: scale,
          panX: panX,
          panY: panY,
          centerX: centerX,
          centerY: centerY
        };
      }
    }

    function handlePointerDown(event) {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (event.target.closest && event.target.closest(".map-hotspot")) return;
      cancelMapViewAnimation();
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      pointerStarts.set(event.pointerId, { x: event.clientX, y: event.clientY, time: performance.now() });
      try {
        modalStage.setPointerCapture(event.pointerId);
        if (typeof modalStage.hasPointerCapture !== "function" || modalStage.hasPointerCapture(event.pointerId)) {
          capturedPointers.add(event.pointerId);
        }
      } catch (error) { /* Window listeners below cover older Safari without pointer capture. */ }
      modalStage.classList.add("is-dragging", "has-interacted");
      mapCanvas.classList.add("is-moving");
      captureGesture();
      event.preventDefault();
    }

    function handlePointerMove(event) {
      if (!pointers.has(event.pointerId) || !gesture) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      const values = Array.from(pointers.values());

      if (gesture.mode === "pan" && values.length === 1) {
        panX = gesture.panX + values[0].x - gesture.x;
        panY = gesture.panY + values[0].y - gesture.y;
      } else if (values.length >= 2) {
        const first = values[0];
        const second = values[1];
        const distance = Math.max(1, Math.hypot(second.x - first.x, second.y - first.y));
        const nextScale = Math.min(5, Math.max(1, gesture.scale * distance / gesture.distance));
        const currentMidX = (first.x + second.x) / 2;
        const currentMidY = (first.y + second.y) / 2;
        const ratio = nextScale / gesture.scale;

        scale = nextScale;
        panX = currentMidX - gesture.centerX - (gesture.midX - gesture.centerX - gesture.panX) * ratio;
        panY = currentMidY - gesture.centerY - (gesture.midY - gesture.centerY - gesture.panY) * ratio;
      }

      requestTransform();
      event.preventDefault();
    }

    function handlePointerEnd(event) {
      if (!pointers.has(event.pointerId) && !pointerStarts.has(event.pointerId)) return;
      const start = pointerStarts.get(event.pointerId);
      const pointerCountBeforeRelease = pointers.size;
      pointers.delete(event.pointerId);
      pointerStarts.delete(event.pointerId);
      capturedPointers.delete(event.pointerId);
      try { modalStage.releasePointerCapture(event.pointerId); } catch (error) { /* Capture may already be released. */ }

      if (event.type === "pointerup" && event.pointerType === "touch" && pointerCountBeforeRelease === 1 && start) {
        const duration = performance.now() - start.time;
        const travel = Math.hypot(event.clientX - start.x, event.clientY - start.y);
        const now = performance.now();
        if (duration < 280 && travel < 10) {
          if (now - lastTap.time < 320 && Math.hypot(event.clientX - lastTap.x, event.clientY - lastTap.y) < 32) {
            setMapZoom(scale > 1.2 ? 1 : 2.35, { clientX: event.clientX, clientY: event.clientY }, true);
            lastTap.time = 0;
          } else {
            lastTap = { time: now, x: event.clientX, y: event.clientY };
          }
        }
      }

      if (pointers.size) {
        captureGesture();
      } else {
        gesture = null;
        modalStage.classList.remove("is-dragging");
        window.clearTimeout(movingTimer);
        movingTimer = window.setTimeout(function () { mapCanvas.classList.remove("is-moving"); }, 180);
      }
    }

    function handleFallbackPointerMove(event) {
      if (!pointers.has(event.pointerId) || capturedPointers.has(event.pointerId)) return;
      if (event.target && modalStage.contains(event.target)) return;
      handlePointerMove(event);
    }

    function handleFallbackPointerEnd(event) {
      if (pointers.has(event.pointerId)) handlePointerEnd(event);
    }

    previewTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        setPreviewMap(tab.getAttribute("data-map-tab"), false);
      });
      tab.addEventListener("keydown", function (event) {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        setPreviewMap((activeIndex + direction + CAMPUS_MAPS.length) % CAMPUS_MAPS.length, true);
      });
    });

    previewOpenButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        openMapModal(button.getAttribute("data-open-map"), null, button);
      });
    });

    expandButton.addEventListener("click", function () {
      openMapModal(activeIndex, null, expandButton);
    });

    modalTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        const index = boundedIndex(tab.getAttribute("data-map-modal-tab"));
        setPreviewMap(index, false);
        updateModalMap(index, null);
      });
      tab.addEventListener("keydown", function (event) {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const index = (modalIndex + direction + CAMPUS_MAPS.length) % CAMPUS_MAPS.length;
        setPreviewMap(index, false);
        updateModalMap(index, null);
        modalTabs[index].focus();
      });
    });

    modalClose.addEventListener("click", closeMapModal);
    zoomOutButton.addEventListener("click", function () { setMapZoom(viewTargetScale - 0.35, null, true); });
    zoomInButton.addEventListener("click", function () { setMapZoom(viewTargetScale + 0.35, null, true); });
    resetButton.addEventListener("click", function () { resetMapView(true, true); });
    modalStage.addEventListener("pointerdown", handlePointerDown);
    modalStage.addEventListener("pointermove", handlePointerMove);
    modalStage.addEventListener("pointerup", handlePointerEnd);
    modalStage.addEventListener("pointercancel", handlePointerEnd);
    modalStage.addEventListener("lostpointercapture", handlePointerEnd);
    window.addEventListener("pointermove", handleFallbackPointerMove, { passive: false });
    window.addEventListener("pointerup", handleFallbackPointerEnd);
    window.addEventListener("pointercancel", handleFallbackPointerEnd);
    modalStage.addEventListener("wheel", function (event) {
      event.preventDefault();
      modalStage.classList.add("has-interacted");
      setMapZoom(scale + (event.deltaY < 0 ? 0.28 : -0.28), { clientX: event.clientX, clientY: event.clientY });
    }, { passive: false });
    modalStage.addEventListener("dblclick", function (event) {
      if (event.target.closest && event.target.closest(".map-hotspot")) return;
      event.preventDefault();
      modalStage.classList.add("has-interacted");
      setMapZoom(scale > 1.2 ? 1 : 2.35, { clientX: event.clientX, clientY: event.clientY }, true);
    });

    document.addEventListener("keydown", function (event) {
      if (modal.hidden) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeMapModal();
        return;
      }
      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        setMapZoom(viewTargetScale + 0.35, null, true);
      } else if (event.key === "-") {
        event.preventDefault();
        setMapZoom(viewTargetScale - 0.35, null, true);
      } else if (event.key === "0") {
        event.preventDefault();
        resetMapView(true, true);
      } else if (event.key === "Tab") {
        const focusable = Array.from(modal.querySelectorAll("button:not([disabled])"));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    window.addEventListener("resize", function () {
      if (!modal.hidden) {
        syncCanvasFit();
        requestTransform();
      }
    }, { passive: true });

    document.querySelectorAll("[data-inline-hotspots]").forEach(function (container) {
      renderHotspots(container, boundedIndex(container.getAttribute("data-inline-hotspots")), false);
    });
    setPreviewMap(0, false);
    paintMapTransform();

    const previewImages = Array.from(section.querySelectorAll(".map-slide img"));
    function decodePreviewImages() {
      previewImages.forEach(function (image) {
        image.loading = "eager";
        if (typeof image.decode === "function") image.decode().catch(function () {});
      });
    }

    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver(function (entries) {
        if (!entries.some(function (entry) { return entry.isIntersecting; })) return;
        decodePreviewImages();
        imageObserver.disconnect();
      }, { rootMargin: "400px 0px" });
      imageObserver.observe(section);
    } else {
      decodePreviewImages();
    }
  }

  function setupInteractions() {
    if (openButton) openButton.addEventListener("click", function () { finishOpening(false); });
    if (openHint) openHint.addEventListener("click", function () { finishOpening(false); });
    if (skipButton) skipButton.addEventListener("click", function () { finishOpening(true); });
    if (skipLink) {
      skipLink.addEventListener("click", function (event) {
        if (!invitationOpened) {
          event.preventDefault();
          finishOpening(true);
          window.setTimeout(function () {
            const invitation = document.getElementById("invitation");
            if (invitation) invitation.scrollIntoView();
          }, 40);
        }
      });
    }

    const interactionButtons = [
      ["calendarButton", downloadCalendarEvent],
      ["calendarTopButton", downloadCalendarEvent],
      ["mapButton", openMap],
      ["shareButton", shareInvitation]
    ];

    interactionButtons.forEach(function (entry) {
      const button = document.getElementById(entry[0]);
      if (button) button.addEventListener("click", entry[1]);
    });

    const dialogReady = Boolean(dialog && dialogClose && wishField && wishInput && smsLink);
    if (dialogReady) {
      document.querySelectorAll("[data-rsvp]").forEach(function (button) {
        button.addEventListener("click", function () {
          openResponseDialog(button.getAttribute("data-rsvp"), button);
        });
      });

      dialogClose.addEventListener("click", closeResponseDialog);
      dialog.addEventListener("click", function (event) {
        if (event.target === dialog) closeResponseDialog();
      });
      wishInput.addEventListener("input", updateSmsLink);
      smsLink.addEventListener("click", function () {
        updateSmsLink();
        showToast("Đang mở ứng dụng tin nhắn…");
      });
    }

    if (copyMessageButton && dialogReady) {
      copyMessageButton.addEventListener("click", copyRsvpMessage);
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && dialog && !dialog.hidden) closeResponseDialog();
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) window.clearInterval(countdownTimer);
      else startCountdown();
    });
  }

  function init() {
    const invitation = document.getElementById("invitation");
    if (invitation) invitation.setAttribute("tabindex", "-1");
    applyPersonalization();
    setupRevealAnimations();
    setupScrollEffects();
    setupPointerMotion();
    setupCampusMaps();
    setupInteractions();
    startCountdown();

    const previewParams = new URLSearchParams(window.location.search);
    if (previewParams.get("preview") === "1") {
      document.documentElement.dataset.previewSection = previewParams.get("section") || window.location.hash.slice(1) || "invitation";
      finishOpening(true);
      if (window.location.hash && !previewParams.get("section")) {
        let targetId = "";
        try {
          targetId = previewParams.get("section") || decodeURIComponent(window.location.hash.slice(1));
        } catch (error) { targetId = ""; }
        const alignPreviewTarget = function () {
          const target = targetId ? document.getElementById(targetId) : null;
          if (target) {
            const previousBehavior = document.documentElement.style.scrollBehavior;
            document.documentElement.style.scrollBehavior = "auto";
            target.scrollIntoView({ block: "start", behavior: "auto" });
            window.requestAnimationFrame(function () {
              document.documentElement.style.scrollBehavior = previousBehavior;
            });
          }
        };
        const schedulePreviewAlignment = function () {
          window.setTimeout(function () {
            window.requestAnimationFrame(function () {
              window.requestAnimationFrame(alignPreviewTarget);
            });
          }, 180);
        };
        schedulePreviewAlignment();
        window.addEventListener("load", schedulePreviewAlignment, { once: true });
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(schedulePreviewAlignment);
        }
      }
    }
  }

  init();
})();
