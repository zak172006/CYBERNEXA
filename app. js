
"use strict";

// ======================================
// CYBERNEXA - MAIN APPLICATION
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    // MOBILE NAVIGATION
    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.querySelector(".nav-links");

    if (menuToggle && navLinks) {

        menuToggle.addEventListener("click", () => {
            const isOpen = navLinks.classList.toggle("show");

            menuToggle.setAttribute("aria-expanded", String(isOpen));
            menuToggle.textContent = isOpen ? "✕" : "☰";
        });

        navLinks.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("show");
                menuToggle.setAttribute("aria-expanded", "false");
                menuToggle.textContent = "☰";
            });
        });

    }

    // ACTIVE NAVIGATION LINKS
    const sections = document.querySelectorAll("main section[id]");
    const links = document.querySelectorAll(".nav-links a");

    if ("IntersectionObserver" in window) {

        const observer = new IntersectionObserver(entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    const sectionId = entry.target.id;

                    links.forEach(link => {
                        link.classList.toggle(
                            "active",
                            link.getAttribute("href") === `#${sectionId}`
                        );
                    });

                }

            });

        }, {
            threshold: 0.35
        });

        sections.forEach(section => observer.observe(section));

    }

    // SCROLL REVEAL ANIMATION
    const revealElements = document.querySelectorAll(
        ".service-card, .section-heading, .technology-content, .tech-panel, .about, .final-cta"
    );

    if ("IntersectionObserver" in window) {

        const revealObserver = new IntersectionObserver(entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("revealed");
                    revealObserver.unobserve(entry.target);

                }

            });

        }, {
            threshold: 0.12
        });

        revealElements.forEach(element => {
            element.classList.add("reveal");
            revealObserver.observe(element);
        });

    }

    // CURRENT YEAR
    const footer = document.querySelector(".footer");

    if (footer) {
        const yearText = footer.querySelector("p");

        if (yearText) {
            yearText.textContent =
                `© ${new Date().getFullYear()} CYBERNEXA. All Rights Reserved.`;
        }
    }

    // BUTTON FEEDBACK
    document.querySelectorAll('a[href="#"]').forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();
        });
    });

    console.log("CYBERNEXA application initialized successfully.");

});
