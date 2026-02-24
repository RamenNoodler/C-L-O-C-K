const root = document.documentElement;

// 1. Clock
setInterval(() => {
    const time = new Date().toLocaleTimeString();
    document.getElementById('clock-main').textContent = time;
    document.getElementById('clock-reflect').textContent = time;
}, 1000);

// 2. Waves
let angle = 0;
function animate() {
    angle += 0.005;
    const ripple = 0.05 + Math.sin(angle) * 0.02;
    const turb = document.querySelector('feTurbulence');
    if(turb) turb.setAttribute('baseFrequency', `0.01 ${ripple}`);
    requestAnimationFrame(animate);
}
animate();

// 3. Precise Weather (Fixed Temperature logic)
const WMO = {
    0: "Clear", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
    45: "Fog", 51: "Light Drizzle", 61: "Light Rain", 63: "Rain", 
    71: "Light Snow", 73: "Snow", 75: "Heavy Snow", 95: "Storm"
};

async function getWeatherData(lat, lng, name) {
    try {
        // We use timezone=auto to ensure we aren't getting "tomorrow's" low temp at 10 PM.
        // We add &temperature_unit=fahrenheit for US-based zones like Alaska/Arizona.
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&temperature_unit=fahrenheit`);
        const data = await response.json();

        // Update Main Widget
        document.getElementById('current-temp').innerText = `${Math.round(data.current_weather.temperature)}°F`;
        document.getElementById('current-desc').innerText = WMO[data.current_weather.weathercode] || "Stable";
        document.getElementById('city-name').innerText = name.toUpperCase();

        // Update 7-Day Strip
        const strip = document.getElementById('weekly-strip');
        strip.innerHTML = ''; // Reset
        
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        data.daily.time.forEach((t, i) => {
            const date = new Date(t + "T00:00:00");
            const dayLabel = dayNames[date.getDay()];
            const high = Math.round(data.daily.temperature_2m_max[i]);
            const code = data.daily.weathercode[i];

            const card = document.createElement('div');
            card.className = 'day-card';
            card.innerHTML = `
                <div class="day-name">${dayLabel}</div>
                <div class="day-temp">${high}°</div>
                <div class="day-cond">${WMO[code] || 'Clear'}</div>
            `;
            strip.appendChild(card);
        });

    } catch (err) { console.error("Weather Error"); }
}

// 4. Customization Handlers
document.getElementById('text-style-select').onchange = (e) => {
    const cls = e.target.value;
    const main = document.getElementById('clock-main');
    const refl = document.getElementById('clock-reflect');
    main.className = refl.className = cls;
};

document.getElementById('bg-color-pk').oninput = (e) => {
    document.getElementById('app-bg').style.backgroundColor = e.target.value;
};

document.getElementById('theme-pk').oninput = (e) => {
    root.style.setProperty('--theme', e.target.value);
};

// 5. Map & Search
let map = L.map('map').setView([37, -110], 4);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Alaska marker
L.marker([61.21, -149.9]).addTo(map).on('click', () => getWeatherData(61.21, -149.9, "Anchorage, AK"));
// Arizona marker
L.marker([33.44, -112.07]).addTo(map).on('click', () => getWeatherData(33.44, -112.07, "Phoenix, AZ"));

map.on('click', e => getWeatherData(e.latlng.lat, e.latlng.lng, "Pinned Area"));

document.getElementById('search-btn').onclick = async () => {
    const city = document.getElementById('city-input').value;
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
    const d = await res.json();
    if(d.results) {
        const { latitude, longitude, name } = d.results[0];
        map.setView([latitude, longitude], 9);
        getWeatherData(latitude, longitude, name);
    }
};

// Toggle
document.getElementById('menu-toggle').onclick = () => {
    document.getElementById('settings-sidebar').classList.toggle('active');
    setTimeout(() => map.invalidateSize(), 400);
};
document.getElementById('close-menu').onclick = () => document.getElementById('settings-sidebar').classList.remove('active');
