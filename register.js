
"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("registerForm");
    const nameInput = document.getElementById("fullName");
    const emailInput = document.getElementById("registerEmail");
    const passwordInput = document.getElementById("registerPassword");
    const confirmInput = document.getElementById("confirmPassword");
    const termsInput = document.getElementById("terms");
    const message = document.getElementById("registerMessage");

    // SHOW / HIDE PASSWORD
    document.querySelectorAll("[data-toggle]").forEach(button => {

        button.addEventListener("click", () => {

            const input = document.getElementById(
                button.dataset.toggle
            );

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
    form.addEventListener("submit", event => {

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

        message.style.color = "#00e59b";

        message.textContent =
            "All validations passed. Backend registration is not connected yet.";

        console.log("CYBERNEXA registration form validated.");

    });

});
