/* =========================================================
   VÉRONA — VINI ITALIANI
   Site interactions + form submissions
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    document.documentElement.classList.add("js-enabled");


    /* =====================================================
       MOBILE NAVIGATION
       ===================================================== */

    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    const closeMobileMenu = () => {
        if (!menuToggle || !navLinks) return;

        navLinks.classList.remove("mobile-active");
        menuToggle.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");
    };

    if (menuToggle && navLinks) {

        menuToggle.addEventListener("click", (event) => {
            event.stopPropagation();

            const isOpen = navLinks.classList.toggle("mobile-active");
            menuToggle.classList.toggle("active", isOpen);
            menuToggle.setAttribute("aria-expanded", String(isOpen));
            menuToggle.setAttribute(
                "aria-label",
                isOpen ? "Close navigation menu" : "Open navigation menu"
            );
        });

        navLinks.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", closeMobileMenu);
        });

        document.addEventListener("click", (event) => {
            if (!event.target.closest(".navbar") && navLinks.classList.contains("mobile-active")) {
                closeMobileMenu();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeMobileMenu();
            }
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 900) {
                closeMobileMenu();
            }
        });
    }


    /* =====================================================
       SCROLL REVEAL
       ===================================================== */

    const revealElements = document.querySelectorAll(".reveal");

    if ("IntersectionObserver" in window && revealElements.length) {

        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("revealed");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 }
        );

        revealElements.forEach((element) => {
            revealObserver.observe(element);
        });

    } else {
        revealElements.forEach((element) => {
            element.classList.add("revealed");
        });
    }


    /* =====================================================
       WINE COLLECTION FILTERS
       ===================================================== */

    const filterButtons = document.querySelectorAll(".filter-button");
    const wineCards = document.querySelectorAll(".wine-card");

    if (filterButtons.length && wineCards.length) {

        filterButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const selectedCategory = button.dataset.filter;

                filterButtons.forEach((item) => {
                    item.classList.remove("active");
                    item.setAttribute("aria-pressed", "false");
                });

                button.classList.add("active");
                button.setAttribute("aria-pressed", "true");

                wineCards.forEach((card) => {
                    const shouldShow =
                        selectedCategory === "all" ||
                        card.dataset.category === selectedCategory;

                    card.classList.toggle("hidden", !shouldShow);
                });
            });
        });
    }


    /* =====================================================
       SHARED WEB3FORMS SUBMISSION
       ===================================================== */

    const submitFormToWeb3Forms = async (form, options = {}) => {
        const submitButton = form.querySelector('button[type="submit"]');
        const statusSuccess = options.successElement;
        const statusError = options.errorElement;
        const originalButtonHTML = submitButton ? submitButton.innerHTML : "";

        if (statusSuccess) {
            statusSuccess.classList.remove("show");
        }

        if (statusError) {
            statusError.classList.remove("show");
            statusError.textContent = "";
        }

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.classList.add("is-loading");
            submitButton.innerHTML = "Sending…";
        }

        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(payload)
            });

            let result = null;

            try {
                result = await response.json();
            } catch {
                result = null;
            }

            if (!response.ok || !result?.success) {
                throw new Error(
                    result?.message ||
                    "We could not send your message right now. Please try again."
                );
            }

            form.reset();

            if (statusSuccess) {
                statusSuccess.classList.add("show");
            }

            return true;

        } catch (error) {
            console.error("VÉRONA form submission error:", error);

            if (statusError) {
                statusError.textContent =
                    error.message ||
                    "Something went wrong. Please try again.";
                statusError.classList.add("show");
            }

            return false;

        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.classList.remove("is-loading");
                submitButton.innerHTML = originalButtonHTML;
            }
        }
    };


    /* =====================================================
       CONTACT FORM
       ===================================================== */

    const contactForm = document.querySelector("#contactForm");

    if (contactForm) {
        contactForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            await submitFormToWeb3Forms(contactForm, {
                successElement: document.querySelector("#contactSuccess"),
                errorElement: document.querySelector("#contactError")
            });
        });
    }


    /* =====================================================
       RESERVATION MODAL + FORM
       ===================================================== */

    const reservationModal = document.querySelector("#reservationModal");
    const openReservationButtons =
        document.querySelectorAll("[data-open-reservation]");
    const closeReservationButtons =
        document.querySelectorAll("[data-close-reservation]");
    const reservationForm = document.querySelector("#reservationForm");
    const reservationSuccess =
        document.querySelector("#reservationSuccess");
    const reservationError =
        document.querySelector("#reservationError");
    const reservationDate =
        document.querySelector("#reservationDate");

    let lastReservationTrigger = null;

    const setMinimumReservationDate = () => {
        if (!reservationDate) return;

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");

        reservationDate.min = `${year}-${month}-${day}`;
    };

    const openReservationModal = (trigger) => {
        if (!reservationModal) return;

        lastReservationTrigger = trigger || null;
        reservationModal.hidden = false;
        reservationModal.setAttribute("aria-hidden", "false");
        document.body.classList.add("no-scroll");

        if (reservationSuccess) {
            reservationSuccess.classList.remove("show");
        }

        if (reservationError) {
            reservationError.classList.remove("show");
            reservationError.textContent = "";
        }

        setMinimumReservationDate();

        const firstField = reservationModal.querySelector(
            "input:not([type='hidden']):not([type='checkbox']), select, textarea"
        );

        requestAnimationFrame(() => {
            firstField?.focus();
        });
    };

    const closeReservationModal = () => {
        if (!reservationModal) return;

        reservationModal.hidden = true;
        reservationModal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("no-scroll");

        lastReservationTrigger?.focus();
        lastReservationTrigger = null;
    };

    const getModalFocusableElements = () => {
        if (!reservationModal) return [];

        return Array.from(
            reservationModal.querySelectorAll(
                "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex=\"-1\"])"
            )
        ).filter((element) => {
            return !element.hidden && element.offsetParent !== null;
        });
    };

    if (reservationModal) {
        reservationModal.addEventListener("keydown", (event) => {
            if (event.key !== "Tab" || reservationModal.hidden) return;

            const focusable = getModalFocusableElements();
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
        });
    }

    if (reservationModal) {

        openReservationButtons.forEach((button) => {
            button.addEventListener("click", () => {
                openReservationModal(button);
            });
        });

        closeReservationButtons.forEach((button) => {
            button.addEventListener("click", closeReservationModal);
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !reservationModal.hidden) {
                closeReservationModal();
            }
        });

        if (reservationForm) {
            reservationForm.addEventListener("submit", async (event) => {
                event.preventDefault();

                await submitFormToWeb3Forms(reservationForm, {
                    successElement: reservationSuccess,
                    errorElement: reservationError
                });
            });
        }
    }


    /* =====================================================
       PLACEHOLDER FOOTER LINKS
       ===================================================== */

    document.querySelectorAll('.site-footer a[href="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
        });
    });

});
