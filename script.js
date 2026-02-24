// Variable Mapping
const root = document.documentElement;
const cMain = document.getElementById('clock-main');
const cReflect = document.getElementById('clock-reflection');

// 1. Clock Engine (Syncs Main and Reflection)
setInterval(() => {
    const time = new Date().toLocaleTimeString();
    cMain.innerText = time;
    cReflect.innerText = time;
}, 1000);

// 2. Wave Animation Logic
let waveFrame = 0;
function rippleEffect() {
    waveFrame += 0.005;
    const baseFreq = `0.01 ${0.04 + Math.sin(waveFrame) * 0.02}`;
    document.querySelector('feTurbulence').setAttribute('baseFrequency', baseFreq);
    requestAnimationFrame(rippleEffect);
}
rippleEffect();

// 3. Map & Weather Integration
let map = L.map('map').setView([40.7, -74], 3);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

map.on('click', (e) => {
    const {lat, lng} = e.latlng;
    fetchWeather(lat, lng);
});

async function fetchWeather(lat, lng) {
    document.getElementById('condition').innerText = "Updating...";
    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`);
        const data = await res.json();
        document.getElementById('temp').innerText = `${data.current_weather.temperature}°C`;
        document.getElementById('condition').innerText = "Live Update";
    } catch {
        document.getElementById('condition').innerText = "API Error";
    }
}

// 4. Color & Customization Hub
const cpK = document.getElementById('font-color-pk');
const cpX = document.getElementById('font-color-hex');

function applyTheme(hex) {
    root.style.setProperty('--font-color', hex);
    cpK.value = hex;
    cpX.value = hex.toUpperCase();
    drawGraph();
}

cpK.oninput = (e) => applyTheme(e.target.value);
cpX.oninput = (e) => { if(/^#[0-9A-F]{6}$/i.test(e.target.value)) applyTheme(e.target.value); };

document.getElementById('wave-slider').oninput = (e) => {
    document.getElementById('wave-intensity-map').setAttribute('scale', e.target.value);
};

// 5. UI Control
document.getElementById('menu-toggle').onclick = () => {
    document.getElementById('settings-sidebar').classList.add('active');
    setTimeout(() => map.invalidateSize(), 400); 
};
document.getElementById('close-menu').onclick = () => document.getElementById('settings-sidebar').classList.remove('active');
document.getElementById('study-btn').onclick = () => {
    document.getElementById('study-modal').style.display = 'block';
    setTimeout(drawGraph, 100);
};
document.getElementById('close-study').onclick = () => document.getElementById('study-modal').style.display = 'none';

// 6. YouTube Background Engine
document.getElementById('apply-bg-btn').onclick = () => {
    const url = document.getElementById('bg-val').value;
    const id = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    if(id) {
        document.getElementById('video-bg-container').innerHTML = 
            `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}"></iframe>`;
    }
};

// 7. Graphing Logic
function drawGraph() {
    const canv = document.getElementById('graph-canvas');
    const ctx = canv.getContext('2d');
    const expr = document.getElementById('graph-input').value;
    const color = getComputedStyle(root).getPropertyValue('--font-color').trim();
    
    ctx.clearRect(0,0, canv.width, canv.height);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for(let x = 0; x < canv.width; x++) {
        const xVal = (x - canv.width/2) / 20;
        try {
            const func = expr.replace(/x/g, `(${xVal})`);
            const y = canv.height/2 - (eval(func) * 20);
            if(x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        } catch(e) {}
    }
    ctx.stroke();
}
document.getElementById('graph-input').oninput = drawGraph;

// 8. Calculator
function calc(v) { document.getElementById('calc-screen').value += v; }
function clearCalc() { document.getElementById('calc-screen').value = ''; }
function calculate() {
    try { document.getElementById('calc-screen').value = eval(document.getElementById('calc-screen').value); }
    catch { document.getElementById('calc-screen').value = "Err"; }
}
