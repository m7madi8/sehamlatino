/* Gift experience modal.
   Selection is finished in the interface. Gift checkout is not connected.
   Listen on the dialog for `seham:gift-selected`:
     detail.programId = "private-lesson" | "in-person-course" | "online-course"
   preventDefault() on that event to replace the pending-checkout status. */
(function () {
  const dialog = document.getElementById("seham-gift-modal");
  if (!dialog || dialog.dataset.bound === "1") return;
  dialog.dataset.bound = "1";

  const form = dialog.querySelector("form");
  const next = dialog.querySelector(".slg-next");
  const status = dialog.querySelector(".slg-status");
  const closeBtn = dialog.querySelector("[data-seham-gift-close]");
  const root = document.documentElement;
  const drawer = document.getElementById("drawer");
  const idle = dialog.dataset.statusIdle || "";
  const selectedCopy = dialog.dataset.statusSelected || "";
  const pendingCopy = dialog.dataset.statusPending || "";
  const supportsStableGutter =
    typeof CSS !== "undefined" && CSS.supports && CSS.supports("scrollbar-gutter", "stable");

  let opener = null;
  let lockedByGift = false;
  let lockedScrollY = 0;
  let suppressClose = false;

  function measureScrollbarWidth() {
    return Math.max(0, window.innerWidth - root.clientWidth);
  }

  function lockScroll() {
    if (root.classList.contains("is-scroll-locked")) return;
    lockedScrollY = window.scrollY || window.pageYOffset || 0;
    const sbw = measureScrollbarWidth();
    root.dataset.scrollY = String(lockedScrollY);
    root.style.setProperty("--scroll-lock-offset", sbw + "px");
    if (sbw > 0 && !supportsStableGutter) root.setAttribute("data-sb-comp", "1");
    else root.removeAttribute("data-sb-comp");
    root.style.scrollBehavior = "auto";
    root.classList.add("is-scroll-locked");
    window.scrollTo(0, lockedScrollY);
    lockedByGift = true;
  }

  function unlockScroll() {
    if (!lockedByGift) return;
    lockedByGift = false;
    if (drawer && drawer.open) return;
    const y = Number(root.dataset.scrollY || lockedScrollY || 0);
    root.classList.remove("is-scroll-locked");
    root.removeAttribute("data-sb-comp");
    root.style.removeProperty("--scroll-lock-offset");
    delete root.dataset.scrollY;
    window.scrollTo(0, y);
    requestAnimationFrame(function () {
      root.style.scrollBehavior = "";
      if (Math.abs((window.scrollY || 0) - y) > 1) window.scrollTo(0, y);
    });
  }

  function syncSelection() {
    const chosen = form.querySelector("input:checked");
    next.disabled = !chosen;
    if (!status) return;
    status.textContent = chosen ? selectedCopy : idle;
  }

  function focusClose() {
    const focusTarget = closeBtn || dialog;
    try {
      focusTarget.focus({ preventScroll: true });
    } catch (err) {
      focusTarget.focus();
    }
  }

  function reveal() {
    if (dialog.open && !dialog.matches(":modal")) {
      suppressClose = true;
      dialog.close();
      suppressClose = false;
    }
    if (!dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }
    dialog.scrollTop = 0;
    syncSelection();
    focusClose();
  }

  function openFrom(trigger) {
    opener = trigger || null;
    lockScroll();
    // Defer so the opening click cannot fall through onto the backdrop.
    window.setTimeout(reveal, 0);
  }

  document.addEventListener("click", function (event) {
    const trigger = event.target.closest("[data-seham-gift-open]");
    if (!trigger) return;
    event.preventDefault();
    openFrom(trigger);
  });

  if (closeBtn) closeBtn.addEventListener("click", function () { dialog.close(); });

  dialog.addEventListener("click", function (event) {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    const outside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;
    if (outside) dialog.close();
  });

  dialog.addEventListener("keydown", function (event) {
    if (event.key !== "Escape" || !dialog.open) return;
    event.preventDefault();
    dialog.close();
  });

  dialog.addEventListener("close", function () {
    if (suppressClose) return;
    unlockScroll();
    if (!opener || typeof opener.focus !== "function") return;
    try {
      opener.focus({ preventScroll: true });
    } catch (err) {
      opener.focus();
    }
  });

  form.addEventListener("change", syncSelection);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const chosen = form.querySelector("input:checked");
    if (!chosen) return;
    const giftEvent = new CustomEvent("seham:gift-selected", {
      bubbles: true,
      cancelable: true,
      detail: { programId: chosen.value }
    });
    if (dialog.dispatchEvent(giftEvent) && status) status.textContent = pendingCopy;
  });

  syncSelection();
})();
