let unitMode = 'fahrenheit';
let owmKey = '';
let ytPlayer;

// 1. YouTube Background API
function onYouTubeIframeAPIReady() {
    ytPlayer = new YT.Player('player', {
        videoId: 'jfKfPfyJRdk', // Default: Lofi Rain
        playerVars: {
            'autoplay': 1, 'mute': 1, 'loop': 1,
            'controls': 0, 'showinfo': 0, 'modestbranding': 1, 'playlist': 'jfKfPfyJRdk'
        },
        events: {
            'onReady': (event) => event.target.playVideo()
        }
    });
}

// 2. Clock Sync
function updateClock() {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    document.getElementById('clock-digits').innerText = time;
    document.getElementById('clock-reflection').innerText = time;
}
setInterval(updateClock, 1000);

// 3. Dynamic Weather Logic
const WMO_MAP = { 0: "Clear", 1: "Fair", 3: "Cloudy", 45: "Fog", 61: "Rain", 71: "Snow", 95: "Storm" };

async function loadWeather(lat, lng, label) {
    const sym = unitMode === 'fahrenheit' ? '°F' : '°C';
    
    // Check for professional API key
    if (owmKey && owmKey.length > 10) {
        try {
            const apiUnit = unitMode === 'fahrenheit' ? 'imperial' : 'metric';
            const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${owmKey}&units=${apiUnit}`);
            const d = await res.json();
            document.getElementById('temp-val').innerText = Math.round(d.main.temp);
            document.getElementById('cond-tag').innerText = d.weather[0].main.toUpperCase();
        } catch(e) { console.error("Key Invalid"); }
    }

    // Always load 7-day strip from Meteo
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&temperature_unit=${unitMode}`;
        const res = await fetch(url);
        const data = await res.json();

        if(!owmKey) {
            document.getElementById('temp-val').innerText = Math.round(data.current_weather.temperature);
            document.getElementById('cond-tag').innerText = WMO_MAP[data.current_weather.weathercode] || "STABLE";
        }
        document.getElementById('city-label').innerText = label.toUpperCase();

        const strip = document.getElementById('forecast-container');
        strip.innerHTML = '';
        const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

        data.daily.time.forEach((t, i) => {
            const date = new Date(t + "T00:00:00");
            const div = document.createElement('div');
            div.className = 'day-card';
            div.innerHTML = `
                <div class="day-name">${dayNames[date.getDay()]}</div>
                <div class="day-temp">${Math.round(data.daily.temperature_2m_max[i])}°</div>
                <div class="day-cond">${WMO_MAP[data.daily.weathercode[i]] || 'Clear'}</div>
            `;
            strip.appendChild(div);
        });
    } catch(e) { document.getElementById('city-label').innerText = "OFFLINE"; }
}

// 4. Interactive Elements
document.getElementById('yt-id-field').onchange = (e) => {
    const newId = e.target.value;
    if(ytPlayer) ytPlayer.loadVideoById(newId);
};

document.getElementById('grad-start').oninput = (e) => document.documentElement.style.setProperty('--g1', e.target.value);
document.getElementById('grad-end').oninput = (e) => document.documentElement.style.setProperty('--g2', e.target.value);
document.getElementById('bg-picker').oninput = (e) => document.documentElement.style.setProperty('--bg', e.target.value);
document.getElementById('api-field').onchange = (e) => owmKey = e.target.value;

document.getElementById('btn-c').onclick = function() { unitMode = 'celsius'; this.classList.add('active'); document.getElementById('btn-f').classList.remove('active'); };
document.getElementById('btn-f').onclick = function() { unitMode = 'fahrenheit'; this.classList.add('active'); document.getElementById('btn-c').classList.remove('active'); };

// 5. Map Control
let map = L.map('map').setView([33.44, -112.07], 4);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

L.marker([61.21, -149.9]).addTo(map).bindPopup("Anchorage").on('click', () => loadWeather(61.21, -149.9, "Anchorage, AK"));
L.marker([33.44, -112.07]).addTo(map).bindPopup("Phoenix").on('click', () => loadWeather(33.44, -112.07, "Phoenix, AZ"));

map.on('click', e => loadWeather(e.latlng.lat, e.latlng.lng, "Target Zone"));

document.getElementById('sidebar-toggle').onclick = () => document.getElementById('settings-sidebar').classList.add('active');
document.getElementById('close-sidebar').onclick = () => document.getElementById('settings-sidebar').classList.remove('active');

// Ripple Animation
let phase = 0;
function animateWaves() {
    phase += 0.005;
    const ripple = 0.05 + Math.sin(phase) * 0.02;
    document.querySelector('feTurbulence').setAttribute('baseFrequency', `0.01 ${ripple}`);
    requestAnimationFrame(animateWaves);
}
animateWaves();
