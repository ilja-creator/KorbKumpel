document.addEventListener("DOMContentLoaded", async () => {
    const registerButton = document.getElementById("register");
    const loginButton = document.getElementById("login");

    registerButton.addEventListener("click", () => {
        window.location.href = "/app/account/registration/register/";
    });

    loginButton.addEventListener("click", () => {
        window.location.href = "/app/account/registration/login/";
    })
});