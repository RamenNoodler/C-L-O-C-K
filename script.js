const root = document.documentElement;
const clockMain = document.getElementById('clock-main');
const clockReflect = document.getElementById('clock-reflection');

// 1. Clock Engine
setInterval(() => {
    const timeStr = new Date().toLocaleTimeString();
    clockMain.innerText = timeStr;
    clockReflect.innerText = timeStr;
}, 1000);

// 2. Wave Animation Logic (Reflection Only)
let waveTime = 0;
function animateWaves() {
    waveTime += 0.005;
    const freq = `0.01 ${0.05 + Math.sin(waveTime) * 0.03}`;
    document.querySelector('feTurbulence').setAttribute('baseFrequency', freq);
    requestAnimationFrame(animateWaves);
}
animateWaves();

// 3. Map & Weather Engine
let map = L.map('map').setView([51.505, -0.09], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

map.on('click', function(e) {
    const { lat, lng } = e.latlng;
    getWeather(lat, lng);
});

async function getWeather(lat, lng) {
    document.getElementById('condition').innerText = "Fetching...";
    try {
        // Using open-meteo (Free, no key needed)
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`);
        const data = await res.json();
        const temp = data.current_weather.temperature;
        const code = data.current_weather.weathercode;
        document.getElementById('temp').innerText = `${temp}°C`;
        document.getElementById('condition').innerText = `Code: ${code}`;
    } catch (e) {
        document.getElementById('condition').innerText = "Error";
    }
}

// 4. Customization Sync
const fontPx = document.getElementById('font-color-pk');
const fontHex = document.getElementById('font-color-hex');

function updateColor(hex) {
    root.style.setProperty('--font-color', hex);
    fontPx.value = hex;
    fontHex.value = hex.toUpperCase();
}

fontPx.oninput = (e) => updateColor(e.target.value);
fontHex.oninput = (e) => { if(/^#[0-9A-F]{6}$/i.test(e.target.value)) updateColor(e.target.value); };

document.getElementById('wave-slider').oninput = (e) => {
    document.getElementById('wave-intensity-map').setAttribute('scale', e.target.value);
};

// 5. Sidebar/Modal Toggles
document.getElementById('menu-toggle').onclick = () => {
    document.getElementById('settings-sidebar').classList.add('active');
    setTimeout(() => map.invalidateSize(), 400); // Forces map to render correctly
};
document.getElementById('close-menu').onclick = () => document.getElementById('settings-sidebar').classList.remove('active');
document.getElementById('study-btn').onclick = () => document.getElementById('study-modal').style.display = 'block';
document.getElementById('close-study').onclick = () => document.getElementById('study-modal').style.display = 'none';

// Background Engine
document.getElementById('apply-bg-btn').onclick = () => {
    const type = document.getElementById('bg-type').value;
    const val = document.getElementById('bg-val').value;
    const container = document.getElementById('video-bg-container');
    if (type === 'youtube') {
        const id = val.split('v=')[1] || val.split('/').pop();
        container.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1&mute=1&playlist=${id}&loop=1"></iframe>`;
    } else {
        container.innerHTML = '';
        root.style.setProperty('--bg-color', val);
    }
};
