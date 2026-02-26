/* ===============================
   GLOBAL SETTINGS
================================= */

let clockMode = "12";
let waveIntensity = 8;     // Default smooth
let waveSpeed = 0.04;      // Default smooth
let wavePhase = 0;


/* ===============================
   CLOCK
================================= */

function runClock() {
    const now = new Date();

    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    let ampm = "";

    if (clockMode === "12") {
        ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12;
        document.getElementById("ampm-tag").style.display = "block";
        document.getElementById("ampm-tag").innerText = ampm;
    } else {
        document.getElementById("ampm-tag").style.display = "none";
    }

    const timeString =
        String(hours).padStart(2, "0") + ":" +
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");

    document.getElementById("clock-digits").innerText = timeString;
}

setInterval(runClock, 1000);
runClock();


/* ===============================
   SIDEBAR (SAFE LOAD)
================================= */

document.addEventListener("DOMContentLoaded", function () {

    const sidebar = document.getElementById("settings-sidebar");
    const toggleBtn = document.getElementById("sidebar-toggle");
    const closeBtn = document.getElementById("close-sidebar");

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener("click", function () {
            sidebar.classList.add("active");
        });
    }

    if (closeBtn && sidebar) {
        closeBtn.addEventListener("click", function () {
            sidebar.classList.remove("active");
        });
    }

});


/* ===============================
   CLOCK MODE TOGGLE
================================= */

const btn12 = document.getElementById("btn-12");
const btn24 = document.getElementById("btn-24");

if (btn12 && btn24) {

    btn12.onclick = function () {
        clockMode = "12";
        btn12.classList.add("active");
        btn24.classList.remove("active");
    };

    btn24.onclick = function () {
        clockMode = "24";
        btn24.classList.add("active");
        btn12.classList.remove("active");
    };

}


/* ===============================
   SLIDERS
================================= */

const intensitySlider = document.getElementById("wave-intensity");
const speedSlider = document.getElementById("wave-speed");

if (intensitySlider) {
    intensitySlider.oninput = function (e) {
        waveIntensity = parseFloat(e.target.value);
    };
}

if (speedSlider) {
    speedSlider.oninput = function (e) {
        waveSpeed = parseFloat(e.target.value) / 100;
    };
}


/* ===============================
   CLEAN WAVY REFLECTION
================================= */

const canvas = document.getElementById("reflection-canvas");
const ctx = canvas ? canvas.getContext("2d") : null;

if (canvas && ctx) {

    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    function drawReflection() {

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const text = document.getElementById("clock-digits").innerText;
        const fontSize = canvas.height * 0.7;

        // Create offscreen canvas
        const offCanvas = document.createElement("canvas");
        const offCtx = offCanvas.getContext("2d");

        offCanvas.width = canvas.width;
        offCanvas.height = canvas.height;

        offCtx.font = `900 ${fontSize}px Orbitron`;
        offCtx.textAlign = "center";

        const gradient = offCtx.createLinearGradient(0, 0, 0, fontSize);
        gradient.addColorStop(0, getComputedStyle(document.documentElement).getPropertyValue('--g1'));
        gradient.addColorStop(1, getComputedStyle(document.documentElement).getPropertyValue('--g2'));

        offCtx.fillStyle = gradient;
        offCtx.fillText(text, offCanvas.width / 2, fontSize);

        // Flip
        ctx.save();
        ctx.translate(0, canvas.height);
        ctx.scale(1, -1);

        const sliceHeight = 2;

        for (let y = 0; y < canvas.height; y += sliceHeight) {

            const offset =
                Math.sin(y * 0.03 + wavePhase) * waveIntensity;

            ctx.drawImage(
                offCanvas,
                0, y, canvas.width, sliceHeight,
                offset, y,
                canvas.width, sliceHeight
            );
        }

        ctx.restore();

        // Fade out bottom
        const fade = ctx.createLinearGradient(0, 0, 0, canvas.height);
        fade.addColorStop(0, "rgba(0,0,0,0.2)");
        fade.addColorStop(1, "rgba(0,0,0,1)");

        ctx.fillStyle = fade;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        wavePhase += waveSpeed;
        requestAnimationFrame(drawReflection);
    }

    drawReflection();
}
