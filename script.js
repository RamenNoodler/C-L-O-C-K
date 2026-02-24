// Variable and Element Selectors
const root = document.documentElement;
const fontPx = document.getElementById('font-color-pk');
const fontHex = document.getElementById('font-color-hex');
const clockDisplay = document.getElementById('clock-display');

// 1. Theme Synchronization (Hex & Picker)
function updateTheme(color) {
    root.style.setProperty('--font-color', color);
    fontPx.value = color;
    fontHex.value = color.toUpperCase();
    drawGraph(); // Redraw grapher with new color
}

fontPx.oninput = (e) => updateTheme(e.target.value);
fontHex.oninput = (e) => {
    if(/^#[0-9A-F]{6}$/i.test(e.target.value)) updateTheme(e.target.value);
};

// 2. Glow & Waves Logic
document.getElementById('glow-slider').oninput = (e) => {
    root.style.setProperty('--glow', e.target.value + 'px');
};

document.getElementById('wave-slider').oninput = (e) => {
    document.getElementById('wave-intensity-map').setAttribute('scale', e.target.value);
};

// Moving Wave Animation
let waveTime = 0;
function animateWaves() {
    waveTime += 0.002;
    const baseFreq = `0.01 ${0.05 + Math.sin(waveTime) * 0.03}`;
    document.querySelector('feTurbulence').setAttribute('baseFrequency', baseFreq);
    requestAnimationFrame(animateWaves);
}
animateWaves();

// 3. Clock Timer
setInterval(() => {
    const now = new Date();
    clockDisplay.innerText = now.toLocaleTimeString();
}, 1000);

// 4. Background Management
document.getElementById('apply-bg-btn').onclick = () => {
    const type = document.getElementById('bg-type').value;
    const val = document.getElementById('bg-val').value;
    const container = document.getElementById('video-bg-container');
    
    if (type === 'color') {
        container.innerHTML = '';
        root.style.setProperty('--bg-color', val);
    } else if (type === 'youtube') {
        const id = val.split('v=')[1]?.split('&')[0] || val.split('/').pop();
        container.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}"></iframe>`;
    } else {
        container.innerHTML = `<video autoplay muted loop><source src="${val}" type="video/mp4"></video>`;
    }
};

// 5. Menu Toggles
document.getElementById('menu-toggle').onclick = () => document.getElementById('settings-sidebar').classList.add('active');
document.getElementById('close-menu').onclick = () => document.getElementById('settings-sidebar').classList.remove('active');
document.getElementById('study-btn').onclick = () => {
    document.getElementById('study-modal').style.display = 'block';
    setTimeout(drawGraph, 100);
};
document.getElementById('close-study').onclick = () => document.getElementById('study-modal').style.display = 'none';

// 6. Study Suite: Calculator
function calc(v) { document.getElementById('calc-screen').value += v; }
function clearCalc() { document.getElementById('calc-screen').value = ''; }
function calculate() {
    try {
        const result = eval(document.getElementById('calc-screen').value);
        document.getElementById('calc-screen').value = result;
    } catch {
        document.getElementById('calc-screen').value = 'Error';
    }
}

// 7. Study Suite: Graphing Engine
function drawGraph() {
    const canvas = document.getElementById('graph-canvas');
    const ctx = canvas.getContext('2d');
    const expr = document.getElementById('graph-input').value;
    const color = getComputedStyle(root).getPropertyValue('--font-color').trim();
    
    ctx.clearRect(0,0, canvas.width, canvas.height);
    
    // Grid Lines
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.beginPath();
    for(let i=0; i<canvas.width; i+=40) { ctx.moveTo(i,0); ctx.lineTo(i,canvas.height); }
    for(let i=0; i<canvas.height; i+=40) { ctx.moveTo(0,i); ctx.lineTo(canvas.width,i); }
    ctx.stroke();

    // Plot Function
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for(let x = 0; x < canvas.width; x++) {
        const xVal = (x - canvas.width/2) / 20;
        try {
            const func = expr.replace(/x/g, `(${xVal})`);
            const yVal = eval(func);
            const y = canvas.height/2 - (yVal * 20);
            if(x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        } catch(e) {}
    }
    ctx.stroke();
}
document.getElementById('graph-input').oninput = drawGraph;
