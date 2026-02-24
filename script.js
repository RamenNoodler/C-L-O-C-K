const root = document.querySelector(':root');
const clock = document.getElementById('clock-display');
const panel = document.getElementById('settings-panel');
const ytContainer = document.getElementById('youtube-bg-container');
const vidContainer = document.getElementById('video-bg-container');

// Time Update
function updateTime() {
    clock.innerText = new Date().toLocaleTimeString();
}
setInterval(updateTime, 1000);
updateTime();

// Toggle Logic
document.getElementById('menu-toggle').onclick = () => panel.classList.toggle('hidden');

// Function Maps
const updates = {
    'font-family': (v) => root.style.setProperty('--font-family', v),
    'font-size': (v) => {
        root.style.setProperty('--font-size', v + 'px');
        document.getElementById('size-val').innerText = v;
    },
    'font-color': (v) => root.style.setProperty('--font-color', v),
    'bg-color': (v) => root.style.setProperty('--bg-color', v),
    'bg-dim': (v) => root.style.setProperty('--overlay-opacity', v / 100),
    'video-url': (v) => {
        vidContainer.innerHTML = v ? `<video autoplay muted loop><source src="${v}" type="video/mp4"></video>` : '';
        if (v) ytContainer.innerHTML = ''; // Clear YT if direct video set
    },
    'yt-id': (v) => {
        ytContainer.innerHTML = v ? `<iframe src="https://www.youtube.com/embed/${v}?autoplay=1&mute=1&loop=1&playlist=${v}&controls=0&showinfo=0" frameborder="0"></iframe>` : '';
        if (v) vidContainer.innerHTML = ''; // Clear direct video if YT set
    }
};

// Apply Listeners
document.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', (e) => {
        if (updates[el.id]) updates[el.id](e.target.value);
        savePreferences();
    });
});

function savePreferences() {
    const prefs = {};
    document.querySelectorAll('input, select').forEach(el => prefs[el.id] = el.value);
    localStorage.setItem('clock_v2_prefs', JSON.stringify(prefs));
}

function loadPreferences() {
    const saved = localStorage.getItem('clock_v2_prefs');
    if (saved) {
        const prefs = JSON.parse(saved);
        Object.keys(prefs).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.value = prefs[id];
                if (updates[id]) updates[id](prefs[id]);
            }
        });
    }
}

document.getElementById('reset-btn').onclick = () => {
    localStorage.removeItem('clock_v2_prefs');
    location.reload();
};

loadPreferences();
