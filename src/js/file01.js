"use strict";

const showToast = () => {
    const toast = document.getElementById("toast-interactive");
    if (toast) {
        toast.classList.add("md:block");
    }
};

const showVideo = () => {
    const demo = document.getElementById("demo");
    if (demo) {
        demo.addEventListener("click", () => {
            window.open("https://www.youtube.com/watch?v=tl6u2NASUzU", "_blank");
        });
    }
};

(() => {
    alert("¡Bienvenido a la página!");
    console.log("Mensaje de bienvenida mostrado.");
    showToast();
    showVideo();
})();