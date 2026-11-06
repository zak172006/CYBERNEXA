
"use strict";

const API_URL = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registerForm");
    const nameInput = document.getElementById("fullName");
    const emailInput = document.getElementById("registerEmail");
    const passwordInput = document.getElementById("registerPassword");
    const confirmInput = document.getElementById("confirmPassword");
    const termsInput = document.getElementById("terms");
    const message = document.getElementById("registerMessage");

    if (!form || !nameInput || !emailInput || !passwordInput ||
        !confirmInput || !termsInput || !message) {
        console.error("CYBERNEXA: Registration form elements are missing.");
        return;
    }

    // SHOW / HIDE PASSWORD
    document.querySelectorAll("[data-toggle]").forEach(button => {
        button.addEventListener("click", () => {
            const input = document.getElementById(button.dataset.toggle);
            if (!input) return;

            const isHidden = input.type === "password";
            input.type = isHidden ? "text" : "password";
            button.textContent = isHidden ? "Hide" : "Show";
        });
    });

    // PASSWORD STRENGTH
    function validatePassword(password) {
        return (
            password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /[0-9]/.test(password) &&
            /[^A-Za-z0-9]/.test(password)
        );
    }

    // REGISTER FORM
    form.addEventListener("submit", async event => {
        event.preventDefault();

        message.textContent = "";
        message.style.color = "#ffb86b";

        const fullName = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmInput.value;

        if (fullName.length < 3) {
            message.textContent = "Please enter your full name.";
            return;
        }

        if (!emailInput.checkValidity()) {
            message.textContent = "Enter a valid email address.";
            return;
        }

        if (!validatePassword(password)) {
            message.textContent =
                "Password needs 8 characters, uppercase, lowercase, a number and a symbol.";
            return;
        }

        if (password !== confirmPassword) {
            message.textContent = "Passwords do not match.";
            return;
        }

        if (!termsInput.checked) {
            message.textContent = "Please accept the terms.";
            return;
        }

        const submitButton = form.querySelector(
            'button[type="submit"], input[type="submit"]'
        );

        if (submitButton) submitButton.disabled = true;

        try {
            message.textContent = "Creating your account...";

            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: fullName,
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Registration failed.");
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

            message.style.color = "#00e59b";
            message.textContent = "Account created successfully!";

            window.location.href = "dashboard.html";

        } catch (error) {
            message.style.color = "#ff6b6b";
            message.textContent = error.message;
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });
});
