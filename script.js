const root = document.documentElement;
const clockMain = document.getElementById('clock-main');
const clockReflect = document.getElementById('clock-reflect');

// 1. Dual-Clock Sync
setInterval(() => {
    const timeStr = new Date().toLocaleTimeString();
    clockMain.textContent = timeStr;
    clockReflect.textContent = timeStr;
}, 1000);

// 2. Wave Motion Logic
let waveStep = 0;
function animateWaves() {
    waveStep += 0.005;
    const ripple = 0.05 + Math.sin(waveStep) * 0.02;
    document.querySelector('feTurbulence').setAttribute('baseFrequency', `0.01 ${ripple}`);
    requestAnimationFrame(animateWaves);
}
animateWaves();

// 3. Map with Geographic Markers
let map = L.map('map').setView([37.09, -95.71], 3); // Centered on North America
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

// Featured Weather Locations
const regions = [
    { name: "Alaska", lat: 64.2, lng: -149.5 },
    { name: "Arizona", lat: 34.0, lng: -111.0 },
    { name: "New York", lat: 40.7, lng: -74.0 },
    { name: "London", lat: 51.5, lng: -0.1 },
    { name: "Tokyo", lat: 35.6, lng: 139.7 },
    { name: "Sydney", lat: -33.8, lng: 151.2 }
];

regions.forEach(loc => {
    let marker = L.marker([loc.lat, loc.lng]).addTo(map);
    marker.bindPopup(`<b>${loc.name}</b><br>Click to fetch weather`);
    marker.on('click', () => getWeather(loc.lat, loc.lng, loc.name));
});

map.on('click', (e) => getWeather(e.latlng.lat, e.latlng.lng, "Custom Area"));

async function getWeather(lat, lng, name) {
    document.getElementById('condition').innerText = `Checking ${name}...`;
    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`);
        const data = await res.json();
        const temp = Math.round(data.current_weather.temperature);
        document.getElementById('temp').innerText = `${temp}°C`;
        document.getElementById('condition').innerText = name;
    } catch (err) {
        document.getElementById('condition').innerText = "Offline";
    }
}

// 4. Color & Intensity Controls
document.getElementById('font-color-pk').oninput = (e) => {
    const color = e.target.value;
    root.style.setProperty('--font-color', color);
    document.getElementById('font-color-hex').value = color.toUpperCase();
};

document.getElementById('wave-slider').oninput = (e) => {
    document.getElementById('wave-intensity-map').setAttribute('scale', e.target.value);
};

// 5. Toggle Controls
document.getElementById('menu-toggle').onclick = () => {
    document.getElementById('settings-sidebar').classList.toggle('active');
    setTimeout(() => map.invalidateSize(), 400); 
};
document.getElementById('close-menu').onclick = () => document.getElementById('settings-sidebar').classList.remove('active');
document.getElementById('study-btn').onclick = () => document.getElementById('study-modal').style.display = 'block';
document.getElementById('close-study').onclick = () => document.getElementById('study-modal').style.display = 'none';

// Calculator logic
function calc(v) { document.getElementById('calc-screen').value += v; }
function calculate() {
    try { document.getElementById('calc-screen').value = eval(document.getElementById('calc-screen').value); }
    catch { document.getElementById('calc-screen').value = 'Error'; }
}
