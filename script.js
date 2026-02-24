const root = document.querySelector(':root');
const clockMain = document.getElementById('clock-display');
const clockReflect = document.getElementById('clock-reflect');
const turb = document.getElementById('turbulence');

// 1. Core Clock Engine
function updateTime() {
    const timeStr = new Date().toLocaleTimeString();
    clockMain.innerText = timeStr;
    clockReflect.innerText = timeStr;
}
setInterval(updateTime, 1000);
updateTime();

// 2. UI Controls
document.getElementById('menu-toggle').onclick = () => document.getElementById('settings-sidebar').classList.add('active');
document.getElementById('close-menu').onclick = () => document.getElementById('settings-sidebar').classList.remove('active');

// Glow & Reflection Logic
document.getElementById('glow-slider').oninput = (e) => root.style.setProperty('--glow-blur', e.target.value + 'px');
document.getElementById('reflect-opacity').oninput = (e) => root.style.setProperty('--reflect-alpha', e.target.value / 100);

// Water Intensity (Waves)
document.getElementById('wave-slider').oninput = (e) => {
    const frequency = 0.01 + (e.target.value / 1000);
    turb.setAttribute('baseFrequency', `0.01 ${frequency}`);
};

// Color & Theme Sync
document.getElementById('font-color').oninput = (e) => {
    const color = e.target.value;
    root.style.setProperty('--font-color', color);
    // Draw graph with new theme color
    if(window.drawGraph) window.drawGraph();
};

document.getElementById('font-family').onchange = (e) => root.style.setProperty('--font-family', e.target.value);

// Background Engine
document.getElementById('apply-bg').onclick = () => {
    const type = document.getElementById('bg-type').value;
    const val = document.getElementById('bg-val').value;
    const container = document.getElementById('video-bg-container');
    
    if (type === 'youtube') {
        const id = val.split('v=')[1] || val.split('/').pop();
        container.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}" style="width:100%;height:100%;border:none;"></iframe>`;
    } else if (type === 'video') {
        container.innerHTML = `<video autoplay muted loop style="width:100%;height:100%;object-fit:cover;"><source src="${val}" type="video/mp4"></video>`;
    } else {
        container.innerHTML = '';
        root.style.setProperty('--bg-color', val);
    }
};

// Study Suite (Calculator & Grapher)
document.getElementById('study-btn').onclick = () => document.getElementById('study-modal').style.display = 'block';
document.getElementById('close-study').onclick = () => document.getElementById('study-modal').style.display = 'none';

window.calc = (v) => document.getElementById('calc-screen').value += v;
window.clearCalc = () => document.getElementById('calc-screen').value = '';
window.calculate = () => {
    try { document.getElementById('calc-screen').value = eval(document.getElementById('calc-screen').value); }
    catch { document.getElementById('calc-screen').value = 'Error'; }
};
