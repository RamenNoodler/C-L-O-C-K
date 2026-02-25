/**
 * SETTINGS - SYNC WITH PYTHON SCRIPT
 */
const OWM_API_KEY = '1c0040b3f90c6dd5de9a748785fc56cf'; // <--- PASTE KEY HERE
let unitMode = 'fahrenheit'; 
let clockMode = '12'; // default
let waveIntensity = 10;  // Default intensity (1–30 scale)
let waveSpeed = 0.05;  // Default wave speed

// 1. Clock Logic
function runClock() {
    const now = new Date();

    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    let ampm = '';

    if (clockMode === '12') {
        ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // 0 becomes 12
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
    document.getElementById('clock-reflection').innerText = timeString;
}
setInterval(runClock, 1000);
runClock();

// 2. REAL WATER WAVE REFLECTION (Canvas-based)
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
        const distortion = Math.sin((y * 0.05) + wavePhase) * waveIntensity;
        ctx.fillText(text, distortion, -y);
    }

    ctx.restore();

    wavePhase += waveSpeed;
    requestAnimationFrame(drawReflection);
}

drawReflection();

// 3. Wave Intensity & Speed Controls
document.getElementById("wave-intensity").oninput = (e) => {
    waveIntensity = parseFloat(e.target.value);
};

document.getElementById("wave-speed").oninput = (e) => {
    waveSpeed = parseFloat(e.target.value) / 100;
};

// 4. 12-hour/24-hour clock mode switch
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
