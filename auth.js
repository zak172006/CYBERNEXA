
"use strict";

// ======================================
// CYBERNEXA AUTHENTICATION
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");
    const loginMessage = document.getElementById("loginMessage");

    // SHOW / HIDE PASSWORD
    if (togglePassword && passwordInput) {

        togglePassword.addEventListener("click", () => {

            const isHidden = passwordInput.type === "password";

            passwordInput.type = isHidden ? "text" : "password";

            togglePassword.textContent = isHidden ? "Hide" : "Show";

            togglePassword.setAttribute(
                "aria-label",
                isHidden ? "Hide password" : "Show password"
            );

        });

    }

    // LOGIN FORM VALIDATION
    if (loginForm) {

        loginForm.addEventListener("submit", (event) => {

            event.preventDefault();

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            loginMessage.textContent = "";
            loginMessage.style.color = "#ffb86b";

            if (!email || !password) {
                loginMessage.textContent = "Please complete all fields.";
                return;
            }

            if (!emailInput.checkValidity()) {
                loginMessage.textContent = "Please enter a valid email address.";
                return;
            }

            if (password.length < 8) {
                loginMessage.textContent =
                    "Password must contain at least 8 characters.";
                return;
            }

            loginMessage.style.color = "#00e59b";

            loginMessage.textContent =
                "Input validation successful. Backend authentication is not connected yet.";

            console.log("CYBERNEXA login form validated.");

        });

    }

});
