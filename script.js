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

/* CANVAS REFLECTION */

const canvas = document.getElementById("reflection-canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function drawReflection() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const text = document.getElementById("clock-digits").innerText;
    const fontSize = canvas.height * 0.8;

    ctx.save();
    ctx.translate(canvas.width / 2, 0);
    ctx.scale(1, -1);

    ctx.font = `900 ${fontSize}px Orbitron`;
    ctx.textAlign = "center";

    const gradient = ctx.createLinearGradient(0, 0, 0, -fontSize);
    gradient.addColorStop(0, getComputedStyle(document.documentElement).getPropertyValue('--g1'));
    gradient.addColorStop(1, getComputedStyle(document.documentElement).getPropertyValue('--g2'));

    ctx.fillStyle = gradient;

    for (let y = 0; y < canvas.height; y++) {
        const distortion =
            Math.sin((y * 0.05) + wavePhase) * waveIntensity;

        ctx.fillText(text, distortion, -y);
    }

    ctx.restore();

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
