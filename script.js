/**
 * SETTINGS - SYNC WITH PYTHON SCRIPT
 */
const OWM_API_KEY = '1c0040b3f90c6dd5de9a748785fc56cf'; // <--- PASTE KEY HERE
let unitMode = 'fahrenheit'; 
let waveIntensity = 45;  // Default intensity

// 1. Clock Logic
function runClock() {
    const timeString = new Date().toLocaleTimeString('en-US', { hour12: false });
    document.getElementById('clock-digits').innerText = timeString;
    document.getElementById('clock-reflection').innerText = timeString;
}
setInterval(runClock, 1000);
runClock();

// 2. Wave Distort Animation
let phase = 0;
function animateWaves() {
    phase += 0.005;
    const ripple = (waveIntensity / 100) + Math.sin(phase) * 0.02;
    const turb = document.querySelector('feTurbulence');
    if (turb) turb.setAttribute('baseFrequency', `0.01 ${ripple}`);
    requestAnimationFrame(animateWaves);
}
animateWaves();

// 3. Meteorological Engine (Supports OWM Hardcode)
async function getAtmosphere(lat, lng, name) {
    const apiUnit = unitMode === 'fahrenheit' ? 'imperial' : 'metric';
    
    try {
        // High-Accuracy Current Data via OpenWeatherMap (Matches Python)
        const owmUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OWM_API_KEY}&units=${apiUnit}`;
        const res = await fetch(owmUrl);
        const d = await res.json();

        // Update HUD
        document.getElementById('temp-val').innerText = Math.round(d.main.temp);
        document.getElementById('cond-tag').innerText = d.weather[0].main.toUpperCase();
        document.getElementById('city-label').innerText = name.toUpperCase();
        document.getElementById('unit-val').innerText = unitMode === 'fahrenheit' ? '°F' : '°C';

    } catch (e) {
        console.warn("OWM Key Sync Failed - Ensure API Key is hardcoded in script.js");
        document.getElementById('city-label').innerText = "API KEY ERROR - Please check connection";
    }

    // Load 7-Day Extension via Meteor-Standard (Free-tier friendly)
    try {
        const metUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weathercode,temperature_2m_max&timezone=auto&temperature_unit=${unitMode}`;
        const resM = await fetch(metUrl);
        const data = await resM.json();

        const strip = document.getElementById('forecast-container');
        strip.innerHTML = '';
        const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const codes = { 0: "Clear", 1: "Fair", 3: "Cloudy", 61: "Rain", 71: "Snow", 95: "Storm" };

        data.daily.time.forEach((t, i) => {
            const date = new Date(t + "T00:00:00");
            const card = document.createElement('div');
            card.className = 'day-card';
            card.innerHTML = `
                <div class="day-name">${dayNames[date.getDay()]}</div>
                <div class="day-temp">${Math.round(data.daily.temperature_2m_max[i])}°</div>
                <div class="day-cond">${codes[data.daily.weathercode[i]] || 'Clear'}</div>
            `;
            strip.appendChild(card);
        });
    } catch (e) { console.error("Forecast Error"); }
}

// 4. UI Events
document.getElementById('btn-c').onclick = function() {
    unitMode = 'celsius'; this.classList.add('active'); 
    document.getElementById('btn-f').classList.remove('active');
};
document.getElementById('btn-f').onclick = function() {
    unitMode = 'fahrenheit'; this.classList.add('active'); 
    document.getElementById('btn-c').classList.remove('active');
};

document.getElementById('grad-start').oninput = (e) => document.documentElement.style.setProperty('--g1', e.target.value);
document.getElementById('grad-end').oninput = (e) => document.documentElement.style.setProperty('--g2', e.target.value);
document.getElementById('bg-picker').oninput = (e) => document.documentElement.style.setProperty('--bg', e.target.value);

// 5. Wave Intensity Slider
document.getElementById('wave-intensity').oninput = (e) => {
    waveIntensity = e.target.value;  // Update wave intensity
};

// 6. Leaflet Geographic Map
let map = L.map('map').setView([44.0, -120.0], 4);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Alaska (Anchorage) & Arizona (Phoenix) Fast-Pins
const pins = [
    { coords: [61.21, -149.9], name: "Anchorage, AK" },
    { coords: [33.44, -112.07], name: "Phoenix, AZ" }
];

pins.forEach(p => {
    L.marker(p.coords).addTo(map).on('click', () => getAtmosphere(p.coords[0], p.coords[1], p.name));
});

map.on('click', e => getAtmosphere(e.latlng.lat, e.latlng.lng, "Pinned Zone"));

// Sidebar Toggle
document.getElementById('sidebar-toggle').onclick = () => {
    document.getElementById('settings-sidebar').classList.add('active');
    setTimeout(() => map.invalidateSize(), 400); // Reveal map correctly
};
document.getElementById('close-sidebar').onclick = () => document.getElementById('settings-sidebar').classList.remove('active');
