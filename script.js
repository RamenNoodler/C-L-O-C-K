let clockMode = '12';
let waveIntensity = 12;
let waveSpeed = 0.04;
let wavePhase = 0;

/* CLOCK */

function runClock() {
    const now = new Date();

    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    let ampm = '';

    if (clockMode === '12') {
        ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        document.getElementById('ampm-tag').style.display = 'block';
        document.getElementById('ampm-tag').innerText = ampm;
    } else {
        document.getElementById('ampm-tag').style.display = 'none';
    }

    const timeString =
        String(hours).padStart(2, '0') + ':' +
        String(minutes).padStart(2, '0') + ':' +
        String(seconds).padStart(2, '0');

    document.getElementById('clock-digits').innerText = timeString;
}

setInterval(runClock, 1000);
runClock();

/* SIDEBAR SAFE LOAD */

document.addEventListener("DOMContentLoaded", function () {

    const sidebar = document.getElementById("settings-sidebar");
    const toggleBtn = document.getElementById("sidebar-toggle");
    const closeBtn = document.getElementById("close-sidebar");

    toggleBtn.addEventListener("click", function () {
        sidebar.classList.add("active");
    });

    closeBtn.addEventListener("click", function () {
        sidebar.classList.remove("active");
    });

});

/* CLOCK MODE TOGGLE */

document.getElementById('btn-12').onclick = function() {
    clockMode = '12';
    this.classList.add('active');
    document.getElementById('btn-24').classList.remove('active');
};

document.getElementById('btn-24').onclick = function() {
    clockMode = '24';
    this.classList.add('active');
    document.getElementById('btn-12').classList.remove('active');
};

/* ===== CLEAN WAVY REFLECTION ===== */

const canvas = document.getElementById("reflection-canvas");
const ctx = canvas.getContext("2d");

let wavePhase = 0;

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

    // Flip main canvas
    ctx.save();
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);

    const sliceHeight = 2;

    for (let y = 0; y < canvas.height; y += sliceHeight) {
        const offset = Math.sin(y * 0.03 + wavePhase) * waveIntensity;

        ctx.drawImage(
            offCanvas,
            0, y, canvas.width, sliceHeight,
            offset, y,
            canvas.width, sliceHeight
        );
    }

    ctx.restore();

    // Fade out
    const fade = ctx.createLinearGradient(0, 0, 0, canvas.height);
    fade.addColorStop(0, "rgba(0,0,0,0.1)");
    fade.addColorStop(1, "rgba(0,0,0,1)");

    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    wavePhase += waveSpeed;
    requestAnimationFrame(drawReflection);
}

drawReflection();
/* SLIDERS */

document.getElementById("wave-intensity").oninput = (e) => {
    waveIntensity = parseFloat(e.target.value);
};

document.getElementById("wave-speed").oninput = (e) => {
    waveSpeed = parseFloat(e.target.value) / 100;
};
