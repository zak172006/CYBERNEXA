
"use strict";

// ======================================
// CYBERNEXA DASHBOARD
// ======================================

const API_URL = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", async () => {

    // AUTHENTICATION
    const token = sessionStorage.getItem("cybernexa_token");

    if (!token) {
        window.location.replace("login.html");
        return;
    }

    const userNameElement = document.getElementById("userName");
    const userRoleElement = document.getElementById("userRole");
    const userAvatarElement = document.getElementById("userAvatar");
    const logoutButton = document.getElementById("logoutButton");

    // LOGOUT
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            sessionStorage.removeItem("cybernexa_token");
            sessionStorage.removeItem("cybernexa_user");
        });
    }

    // LOAD USER PROFILE
    try {
        const response = await fetch(`${API_URL}/users/me`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();

        if (!response.ok || !data.success || !data.user) {
            throw new Error("Authentication failed.");
        }

        const user = data.user;

        if (userNameElement) {
            userNameElement.textContent = user.name;
        }

        if (userRoleElement) {
            userRoleElement.textContent =
                user.role === "admin" ? "Administrator" : "User";
        }

        if (userAvatarElement) {
            userAvatarElement.textContent =
                user.name.charAt(0).toUpperCase();
        }

        sessionStorage.setItem(
            "cybernexa_user",
            JSON.stringify(user)
        );

    } catch (error) {
        sessionStorage.removeItem("cybernexa_token");
        sessionStorage.removeItem("cybernexa_user");

        window.location.replace("login.html");
        return;
    }

    // SIDEBAR
    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebarToggle");

    if (sidebar && sidebarToggle) {
        sidebarToggle.addEventListener("click", () => {
            sidebar.classList.toggle("open");
        });
    }

    // SIDEBAR NAVIGATION
    document.querySelectorAll(".side-link").forEach((link) => {
        link.addEventListener("click", () => {

            document.querySelectorAll(".side-link").forEach((item) => {
                item.classList.remove("active");
            });

            link.classList.add("active");

            if (sidebar) {
                sidebar.classList.remove("open");
            }
        });
    });

    // ACTIVE SECTION OBSERVER
    const sections = document.querySelectorAll(
        "main section[id], main div[id]"
    );

    if ("IntersectionObserver" in window && sections.length > 0) {

        const observer = new IntersectionObserver(
            (entries) => {

                entries.forEach((entry) => {

                    if (!entry.isIntersecting) return;

                    const activeLink = document.querySelector(
                        `.side-link[href="#${entry.target.id}"]`
                    );

                    if (activeLink) {

                        document.querySelectorAll(".side-link").forEach((link) => {
                            link.classList.remove("active");
                        });

                        activeLink.classList.add("active");
                    }
                });

            },
            { threshold: 0.35 }
        );

        sections.forEach((section) => observer.observe(section));
    }

    // DEMO SCANNER
    const scanButton = document.getElementById("scanButton");
    const scanMessage = document.getElementById("scanMessage");

    if (scanButton) {

        scanButton.addEventListener("click", () => {

            if (scanMessage) {
                scanMessage.textContent =
                    "Demo mode: الفحص الحقيقي غير متصل حاليًا. سيتم تفعيل محرك الفحص عند إعداد النظام الخلفي.";

                scanMessage.classList.add("visible");
            }

            scanButton.disabled = true;
            scanButton.textContent = "Demo Mode";

            setTimeout(() => {
                scanButton.disabled = false;
                scanButton.textContent = "Start Demo Scan";
            }, 2500);

        });
    }

    // CURRENT YEAR
    const yearElement = document.getElementById("currentYear");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

});
