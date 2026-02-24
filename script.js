const root = document.documentElement;

// 1. Clock Engine
function updateTime() {
    const timeStr = new Date().toLocaleTimeString();
    document.getElementById('clock-main').textContent = timeStr;
    document.getElementById('clock-reflect').textContent = timeStr;
}
setInterval(updateTime, 1000);
updateTime();

// 2. Ripple Animation
let phase = 0;
function animateWaves() {
    phase += 0.006;
    const ripple = 0.05 + Math.sin(phase) * 0.03;
    document.querySelector('feTurbulence').setAttribute('baseFrequency', `0.005 ${ripple}`);
    requestAnimationFrame(animateWaves);
}
animateWaves();

// 3. Precise Weather Mapping (WMO Standards)
const weatherMap = {
    0: "Clear Skies", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
    45: "Fog", 48: "Rime Fog", 51: "Light Drizzle", 53: "Drizzle", 55: "Heavy Drizzle",
    61: "Slight Rain", 63: "Moderate Rain", 65: "Heavy Rain", 71: "Slight Snow",
    73: "Moderate Snow", 75: "Heavy Snow", 95: "Thunderstorm"
};

async function getWeather(lat, lng, label) {
    try {
        // Fetching temperature, feels-like, and wind speed
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=apparent_temperature`;
        const res = await fetch(url);
        const data = await res.json();
        
        const curr = data.current_weather;
        const apparent = data.hourly.apparent_temperature[0]; // Nearest hourly feels like

        document.getElementById('temp').innerText = `${Math.round(curr.temperature)}°C`;
        document.getElementById('condition-label').innerText = weatherMap[curr.weathercode] || "Stable";
        document.getElementById('city-display').innerText = label.toUpperCase();
        document.getElementById('feels-like').innerText = `Feels like: ${Math.round(apparent)}°C`;
        document.getElementById('wind').innerText = `Wind: ${curr.windspeed} km/h`;
    } catch (e) {
        document.getElementById('city-display').innerText = "Network Error";
    }
}

// 4. Map & Markers (Alaska & Arizona Specific)
let map = L.map('map').setView([45, -100], 3);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const regions = [
    { name: "Anchorage, AK", lat: 61.2181, lng: -149.9003 },
    { name: "Phoenix, AZ", lat: 33.4484, lng: -112.0740 }
];

regions.forEach(loc => {
    let pin = L.marker([loc.lat, loc.lng]).addTo(map);
    pin.on('click', () => getWeather(loc.lat, loc.lng, loc.name));
});

map.on('click', e => getWeather(e.latlng.lat, e.latlng.lng, "Pinned Location"));

// 5. Tool Toggles & Customization
document.getElementById('search-btn').onclick = async () => {
    const city = document.getElementById('city-input').value;
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
    const data = await res.json();
    if(data.results) {
        const { latitude, longitude, name } = data.results[0];
        map.setView([latitude, longitude], 9);
        getWeather(latitude, longitude, name);
    }
};

document.getElementById('menu-toggle').onclick = () => {
    document.getElementById('settings-sidebar').classList.add('active');
    setTimeout(() => map.invalidateSize(), 400);
};

document.getElementById('font-color-pk').oninput = (e) => {
    const val = e.target.value;
    root.style.setProperty('--font-color', val);
    document.getElementById('font-color-hex').value = val.toUpperCase();
};

document.getElementById('wave-slider').oninput = (e) => {
    document.getElementById('wave-intensity-map').setAttribute('scale', e.target.value);
};

// Simple Close Logic
document.getElementById('close-menu').onclick = () => document.getElementById('settings-sidebar').classList.remove('active');
document.getElementById('study-btn').onclick = () => document.getElementById('study-modal').style.display = 'block';
document.getElementById('close-study').onclick = () => document.getElementById('study-modal').style.display = 'none';

// Calculator Logic
function calc(v) { document.getElementById('calc-screen').value += v; }
function calculate() {
    try {
        document.getElementById('calc-screen').value = eval(document.getElementById('calc-screen').value);
    } catch { document.getElementById('calc-screen').value = "Error"; }
}
