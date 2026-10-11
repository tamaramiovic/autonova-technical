
(() => {
    'use strict';

    const STORAGE_KEY = 'autonova_portfolio_messages_v1';

    function readMessages() {
        try {
            const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            return Array.isArray(data) ? data : [];
        } catch {
            return [];
        }
    }

    function saveMessages(messages) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }

    function generateMessageId() {
        return 'MSG-' +
            Date.now().toString(36).toUpperCase() +
            '-' +
            Math.random().toString(36).slice(2, 6).toUpperCase();
    }

    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', event => {
            event.preventDefault();

            const feedback = document.getElementById('contact-feedback');

            const name = document.getElementById('contact-name').value.trim();
            const email = document.getElementById('contact-email').value.trim();
            const phone = document.getElementById('contact-phone').value.trim();
            const service = document.getElementById('contact-service').value;
            const message = document.getElementById('contact-message').value.trim();
            const consent = document.getElementById('contact-consent').checked;

            feedback.textContent = '';

            if (
                name.length < 3 ||
                message.length < 10 ||
                !service ||
                !consent ||
                !contactForm.reportValidity()
            ) {
                feedback.textContent = 'Proverite obavezna polja i pokušajte ponovo.';
                return;
            }

            const newMessage = {
                id: generateMessageId(),
                name,
                email,
                phone,
                service,
                message,
                status: 'Nepročitano',
                createdAt: new Date().toISOString()
            };

            try {
                const messages = readMessages();
                messages.push(newMessage);
                saveMessages(messages);

                contactForm.reset();

                feedback.textContent =
                    `Poruka ${newMessage.id} je uspešno sačuvana u lokalnom demo sistemu.`;

            } catch {
                feedback.textContent =
                    'Poruka nije sačuvana. Proverite podešavanja browsera.';
            }
        });
    }

    const messageList = document.getElementById('admin-message-list');

    if (!messageList) return;

    const searchInput = document.getElementById('admin-message-search');
    const statusFilter = document.getElementById('admin-message-filter');

    function createElement(tag, className, text) {
        const element = document.createElement(tag);

        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;

        return element;
    }

    function updateStatus(id, status) {
        const messages = readMessages();
        const target = messages.find(item => item.id === id);

        if (!target) return;

        target.status = status;
        saveMessages(messages);
        renderMessages();
    }

    function deleteMessage(id) {
        if (!confirm('Da li želite da obrišete ovu poruku?')) return;

        const messages = readMessages().filter(item => item.id !== id);
        saveMessages(messages);
        renderMessages();
    }

    function renderMessages() {
        const messages = readMessages().sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        document.getElementById('admin-messages-total').textContent =
            messages.length;

        document.getElementById('admin-messages-unread').textContent =
            messages.filter(item => item.status === 'Nepročitano').length;

        document.getElementById('admin-messages-done').textContent =
            messages.filter(item => item.status === 'Obrađeno').length;

        const query = searchInput.value.trim().toLocaleLowerCase('sr');

        const filtered = messages.filter(item => {
            const matchesStatus =
                statusFilter.value === 'Svi' ||
                item.status === statusFilter.value;

            const matchesSearch = [
                item.id,
                item.name,
                item.email,
                item.phone,
                item.service,
                item.message
            ].some(value =>
                String(value || '').toLocaleLowerCase('sr').includes(query)
            );

            return matchesStatus && matchesSearch;
        });

        messageList.replaceChildren();

        if (!filtered.length) {
            messageList.append(
                createElement(
                    'div',
                    'admin-message-empty',
                    'Nema poruka za prikazane kriterijume.'
                )
            );
            return;
        }

        filtered.forEach(item => {
            const card = createElement(
                'article',
                'admin-message-card' +
                (item.status === 'Nepročitano' ? ' is-unread' : '')
            );

            const head = createElement('div', 'admin-message-head');
            const title = createElement('h3', '', item.name);
            const status = createElement('span', '', item.status);

            head.append(title, status);

            const date = new Date(item.createdAt);

            const dateText = Number.isNaN(date.getTime())
                ? 'Nepoznat datum'
                : date.toLocaleString('sr-RS');

            const meta = createElement(
                'div',
                'admin-message-meta',
                `${item.id} | ${dateText}\n${item.service} | ${item.email} | ${item.phone || 'Bez telefona'}`
            );

            meta.style.whiteSpace = 'pre-line';

            const body = createElement(
                'div',
                'admin-message-body',
                item.message
            );

            const actions = createElement('div', 'admin-message-actions');

            if (item.status === 'Nepročitano') {
                const readButton = createElement(
                    'button',
                    '',
                    'OZNAČI KAO PROČITANO'
                );

                readButton.type = 'button';
                readButton.addEventListener('click', () => {
                    updateStatus(item.id, 'Pročitano');
                });

                actions.append(readButton);
            }

            if (item.status !== 'Obrađeno') {
                const doneButton = createElement(
                    'button',
                    '',
                    'OZNAČI KAO OBRAĐENO'
                );

                doneButton.type = 'button';
                doneButton.addEventListener('click', () => {
                    updateStatus(item.id, 'Obrađeno');
                });

                actions.append(doneButton);
            }

            if (item.email) {
                const reply = createElement('a', '', 'ODGOVORI EMAILOM ↗');

                const subject = encodeURIComponent(
                    'AUTONOVA — Odgovor na vaš upit'
                );

                reply.href =
                    `mailto:${item.email}?subject=${subject}`;

                actions.append(reply);
            }

            const deleteButton = createElement('button', '', 'OBRIŠI');

            deleteButton.type = 'button';
            deleteButton.addEventListener('click', () => {
                deleteMessage(item.id);
            });

            actions.append(deleteButton);

            card.append(head, meta, body, actions);
            messageList.append(card);
        });
    }

    searchInput.addEventListener('input', renderMessages);
    statusFilter.addEventListener('change', renderMessages);

    document.getElementById('admin-messages-clear').addEventListener(
        'click',
        () => {
            if (!confirm('Obrisati sve lokalne demo poruke?')) return;

            localStorage.removeItem(STORAGE_KEY);
            renderMessages();
        }
    );

    window.addEventListener('storage', renderMessages);

    renderMessages();
})();
