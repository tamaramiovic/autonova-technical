
document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('[data-admin-tab]');

    const panels = {
        reservations: document.getElementById('dashboard-reservations'),
        messages: document.getElementById('dashboard-messages')
    };

    function activateTab(name) {
        if (!panels[name]) return;

        tabs.forEach(tab => {
            const active = tab.dataset.adminTab === name;

            tab.classList.toggle('active', active);
            tab.setAttribute('aria-selected', String(active));
        });

        Object.entries(panels).forEach(([key, panel]) => {
            panel.hidden = key !== name;
        });
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            activateTab(tab.dataset.adminTab);
        });
    });

    activateTab('reservations');
});
