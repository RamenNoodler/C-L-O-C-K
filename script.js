function updateTime() {
    const now = new Date();
    const clock = document.getElementById('clock-display');
    clock.innerText = now.toLocaleTimeString();
}

// Customization Logic
const root = document.querySelector(':root');
const controls = {
    'font-family': (val) => root.style.setProperty('--font-family', val),
    'font-size': (val) => root.style.setProperty('--font-size', val + 'px'),
    'font-color': (val) => root.style.setProperty('--font-color', val),
    'bg-color': (val) => root.style.setProperty('--bg-color', val)
};

// Listen for changes
Object.keys(controls).forEach(id => {
    const input = document.getElementById(id);
    input.addEventListener('input', (e) => {
        controls[id](e.target.value);
        saveSettings();
    });
});

// Persistence
function saveSettings() {
    const settings = {};
    Object.keys(controls).forEach(id => {
        settings[id] = document.getElementById(id).value;
    });
    localStorage.setItem('clockSettings', JSON.stringify(settings));
}

function loadSettings() {
    const saved = localStorage.getItem('clockSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        Object.keys(settings).forEach(id => {
            const input = document.getElementById(id);
            input.value = settings[id];
            controls[id](settings[id]);
        });
    }
}

document.getElementById('reset-btn').onclick = () => {
    localStorage.removeItem('clockSettings');
    location.reload();
};

setInterval(updateTime, 1000);
updateTime();
loadSettings();
