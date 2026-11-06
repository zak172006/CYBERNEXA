
"use strict";

// ======================================
// CYBERNEXA AUTHENTICATION
// ======================================

const API_URL = "http://localhost:5000/api";

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

    // LOGIN
    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
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

            const submitButton = loginForm.querySelector(
                'button[type="submit"], input[type="submit"]'
            );

            if (submitButton) submitButton.disabled = true;

            try {
                loginMessage.textContent = "Signing in...";

                const response = await fetch(`${API_URL}/auth/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.message || "Login failed.");
                }

                if (!data.token) {
                    throw new Error("Authentication token was not received.");
                }

                // Temporary session storage for development
                sessionStorage.setItem("cybernexa_token", data.token);

                if (data.user) {
                    sessionStorage.setItem(
                        "cybernexa_user",
                        JSON.stringify(data.user)
                    );
                }

                loginMessage.style.color = "#00e59b";
                loginMessage.textContent = "Login successful!";

                window.location.href = "dashboard.html";

            } catch (error) {
                loginMessage.style.color = "#ff6b6b";
                loginMessage.textContent = error.message;
            } finally {
                if (submitButton) submitButton.disabled = false;
            }
        });
    }
});
