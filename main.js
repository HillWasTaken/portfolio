// ===== Pas dit aan =====
const GITHUB = "HillWasTaken"; // als dit klopt, worden je repo's automatisch geladen
const PROJECTS = [
    { name: "Lijnvolger-robot", desc: "Robot die een zwarte lijn volgt met een 5-kanaals sensor, aangestuurd door een ESP32-S3.", tags: ["MicroPython", "ESP32-S3", "TCRT5000"], url: "https://github.com/jouw-gebruikersnaam/lijnvolger" },
    { name: "Discord ticketbot", desc: "Bot met een ticketsysteem en rechtenbeheer voor een community-server.", tags: ["Node.js", "discord.js"], url: "https://github.com/jouw-gebruikersnaam/ticketbot" },
    { name: "FiveM roleplay-server", desc: "Eigen scripts en resources voor een roleplay-server op het ESX-framework.", tags: ["Lua", "ESX", "FiveM"], url: "https://github.com/jouw-gebruikersnaam/fivem-server" },
    { name: "Hardware Interfacing", desc: "Schoolopdrachten voor vak BC1: sensoren en actuatoren koppelen aan een microcontroller.", tags: ["MicroPython", "ESP32-S3"], url: "https://github.com/jouw-gebruikersnaam/bc1" }
];
// =======================
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
function render(items) {
    document.getElementById('list').innerHTML = items.map(p => `<li class="border-top"><a class="d-flex justify-content-between align-items-start gap-3 py-4" href="${esc(p.url)}" target="_blank" rel="noopener"><div><h3 class="mb-2">${esc(p.name)}</h3><p class="text-secondary mb-3">${esc(p.desc)}</p><div class="d-flex flex-wrap gap-2">${p.tags.map(t => `<span class="badge rounded-pill px-3 py-2">${esc(t)}</span>`).join('')}</div></div><span class="arrow" aria-hidden="true">↗</span></a></li>`).join('') + '<li class="border-top"></li>';
    requestAnimationFrame(build);
}
render(PROJECTS);
(async () => {
    const list = document.getElementById('list');
    const say = t => list.insertAdjacentHTML('beforebegin', `<p class="text-secondary small" id="ghmsg">${t}</p>`);
    try {
        if (GITHUB === "jouw-gebruikersnaam") return say("GitHub: gebruikersnaam nog niet ingevuld");
        const r = await fetch(`https://api.github.com/users/${GITHUB}/repos?sort=updated&per_page=30`);
        if (!r.ok) return say("GitHub: foutstatus " + r.status);
        const all = await r.json();
        const d = all.filter(x => !x.fork).map(x => ({ name: x.name, desc: x.description || "Zie de repository voor details.", tags: [x.language].filter(Boolean), url: x.html_url }));
        if (!d.length) return say("GitHub: " + all.length + " repo's gevonden, maar " + all.length + " zijn forks of er zijn er geen");
        render(d);
        say("GitHub: " + d.length + " repo's geladen");
    } catch (e) { say("GitHub: fout, " + e.message); }
})();
document.getElementById('yr').textContent = new Date().getFullYear();
document.getElementById('themeBtn').addEventListener('click', () => {
    const t = document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-bs-theme', t);
    try { localStorage.setItem('theme', t) } catch (e) {
        console.error(e)
    }
});

const rail = document.getElementById('rail'), ink = document.getElementById('ink'), bot = document.getElementById('bot'), svg = document.getElementById('track');
let len = 0;
function build() {
    const H = document.body.scrollHeight, small = innerWidth < 760;
    const a = small ? 20 : Math.min(48, innerWidth * .05), b = a + (small ? 14 : 34);
    svg.setAttribute('height', H); svg.setAttribute('width', innerWidth);
    let d = `M${a} 0`, x = a, i = 0;
    document.querySelectorAll('[data-node]').forEach(s => {
        const y = s.offsetTop + 40, nx = i % 2 === 0 ? b : a;
        d += ` V${y - 150} C${x} ${y - 40},${nx} ${y - 110},${nx} ${y}`; x = nx; i++;
    });
    d += ` V${H - 40}`;
    rail.setAttribute('d', d); ink.setAttribute('d', d);
    len = ink.getTotalLength();
    ink.style.strokeDasharray = len;
    move();
}
function move() {
    if (!len) return;
    const p = Math.min(1, Math.max(0, (scrollY + innerHeight * .45) / document.body.scrollHeight));
    const l = p * len, pt = ink.getPointAtLength(l), p2 = ink.getPointAtLength(Math.min(len, l + 2));
    ink.style.strokeDashoffset = len - l;
    bot.setAttribute('transform', `translate(${pt.x} ${pt.y}) rotate(${Math.atan2(p2.y - pt.y, p2.x - pt.x) * 180 / Math.PI})`);
}
addEventListener('scroll', () => requestAnimationFrame(move), { passive: true });
addEventListener('resize', build);
addEventListener('load', build);