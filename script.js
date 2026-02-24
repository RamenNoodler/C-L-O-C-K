const root = document.documentElement;
const clockMain = document.getElementById('clock-main');
const clockReflect = document.getElementById('clock-reflect');

// 1. Precise Sync Logic
function updateClocks() {
    const timeStr = new Date().toLocaleTimeString();
    clockMain.textContent = timeStr;
    clockReflect.textContent = timeStr;
}
setInterval(updateClocks, 1000);
updateClocks();

// 2. Animated Wave Engine (Reflection Only)
let angle = 0;
function animateWaves() {
    angle += 0.004;
    const shift = 0.05 + Math.sin(angle) * 0.02;
    document.querySelector('feTurbulence').setAttribute('baseFrequency', `0.01 ${shift}`);
    requestAnimationFrame(animateWaves);
}
animateWaves();

// 3. Map & Location Engine
let map = L.map('map').setView([45, -100], 3); 
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Pre-defined markers (requested regions)
const markers = [
    { name: "Alaska", lat: 64.2, lng: -149.5 },
    { name: "Arizona", lat: 34.0, lng: -111.0 },
    { name: "New York", lat: 40.7, lng: -74.0 },
    { name: "London", lat: 51.5, lng: -0.1 }
];

markers.forEach(loc => {
    let m = L.marker([loc.lat, loc.lng]).addTo(map);
    m.on('click', () => getWeather(loc.lat, loc.lng, loc.name));
});

map.on('click', e => getWeather(e.latlng.lat, e.latlng.lng, "Custom Point"));

// 4. Weather Logic (Based on your Python logic)
async function getWeather(lat, lng, label) {
    document.getElementById('city-name').innerText = "Fetching...";
    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`);
        const data = await res.json();
        const weather = data.current_weather;
        
        document.getElementById('temp').innerText = `${Math.round(weather.temperature)}°C`;
        document.getElementById('city-name').innerText = label;
        
        // Maps numeric codes to descriptions like your Python code
        const codes = { 0: "Clear", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast", 45: "Foggy", 61: "Rainy" };
        document.getElementById('condition').innerText = codes[weather.weathercode] || "Stable";
    } catch {
        document.getElementById('city-name').innerText = "Error: API Down";
    }
}

// City Search functionality (Python equivalent)
document.getElementById('search-btn').onclick = async () => {
    const city = document.getElementById('city-input').value;
    if(!city) return;
    try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
        const data = await res.json();
        if(data.results) {
            const { latitude, longitude, name } = data.results[0];
            map.setView([latitude, longitude], 8);
            getWeather(latitude, longitude, name);
        }
    } catch (e) { alert("City not found"); }
};

// 5. Controls & Sidebar
document.getElementById('menu-toggle').onclick = () => {
    document.getElementById('settings-sidebar').classList.add('active');
    setTimeout(() => map.invalidateSize(), 400);
};
document.getElementById('close-menu').onclick = () => document.getElementById('settings-sidebar').classList.remove('active');
document.getElementById('study-btn').onclick = () => document.getElementById('study-modal').style.display = 'block';
document.getElementById('close-study').onclick = () => document.getElementById('study-modal').style.display = 'none';

document.getElementById('font-color-pk').oninput = (e) => {
    root.style.setProperty('--font-color', e.target.value);
    document.getElementById('font-color-hex').value = e.target.value.toUpperCase();
};

document.getElementById('wave-slider').oninput = (e) => {
    document.getElementById('wave-intensity-map').setAttribute('scale', e.target.value);
};

// Calculator Logic
function calc(v) { document.getElementById('calc-screen').value += v; }
function calculate() {
    try {
        document.getElementById('calc-screen').value = eval(document.getElementById('calc-screen').value);
    } catch { document.getElementById('calc-screen').value = "Error"; }
}
