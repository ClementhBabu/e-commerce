function showToast(message, type) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';

    toast.className = `toast ${bgColor} text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-medium`;
    toast.innerHTML = `<i class="fas ${icon} text-lg"></i><span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

async function addToCart(productId, quantity) {
    quantity = quantity || 1;

    try {
        const res = await fetch('/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId, quantity: quantity })
        });

        const data = await res.json();

        if (res.ok) {
            updateCartCount(data.cart_count);
            showToast('Added to cart!', 'success');
        } else if (res.status === 401) {
            window.location.href = '/login';
        } else {
            showToast(data.detail || 'Failed to add to cart', 'error');
        }
    } catch (err) {
        showToast('Network error. Please try again.', 'error');
    }
}

async function updateCartCount(count) {
    const countEl = document.getElementById('cartCount');
    if (countEl) {
        if (count !== undefined) {
            countEl.textContent = count;
        } else {
            try {
                const res = await fetch('/api/cart');
                if (res.ok) {
                    const data = await res.json();
                    countEl.textContent = data.count;
                }
            } catch (e) {
                // silently fail
            }
        }
    }
}

function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('order') === 'success') {
        showToast('Order placed successfully! Thank you for your purchase.', 'success');
        window.history.replaceState({}, document.title, '/');
    }
});

document.addEventListener('submit', function(e) {
    const form = e.target;
    if (form.id === 'loginForm' || form.id === 'registerForm') {
        // handled by inline scripts in templates
        return;
    }
});

document.addEventListener('DOMContentLoaded', function() {

(function() {
    var toggleBtn = document.getElementById('chatToggle');
    var toggleIcon = document.getElementById('chatToggleIcon');
    var toggleClose = document.getElementById('chatToggleClose');
    var chatPanel = document.getElementById('chatPanel');
    var closeBtn = document.getElementById('chatClose');
    var messagesEl = document.getElementById('chatMessages');
    var inputEl = document.getElementById('chatInput');
    var sendBtn = document.getElementById('chatSend');

    if (!toggleBtn || !chatPanel) return;

    var isOpen = false;
    var isWaiting = false;

    function openChat() {
        isOpen = true;
        chatPanel.classList.remove('hidden');
        chatPanel.classList.add('flex');
        toggleIcon.classList.add('hidden');
        toggleClose.classList.remove('hidden');
        toggleBtn.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
        toggleBtn.classList.add('bg-gray-600', 'hover:bg-gray-700');
        inputEl.focus();
        scrollToBottom();
    }

    function closeChat() {
        isOpen = false;
        chatPanel.classList.add('hidden');
        chatPanel.classList.remove('flex');
        toggleIcon.classList.remove('hidden');
        toggleClose.classList.add('hidden');
        toggleBtn.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
        toggleBtn.classList.remove('bg-gray-600', 'hover:bg-gray-700');
    }

    toggleBtn.addEventListener('click', function() {
        if (isOpen) closeChat();
        else openChat();
    });

    closeBtn.addEventListener('click', closeChat);

    function scrollToBottom() {
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function addMessage(text, isBot) {
        var div = document.createElement('div');
        div.className = 'flex gap-2';
        if (!isBot) div.classList.add('justify-end');

        if (isBot) {
            div.innerHTML = '<div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0"><i class="fas fa-robot text-indigo-600 text-sm"></i></div>' +
                '<div class="bg-white border border-gray-200 text-gray-700 text-sm rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm">' + escapeHtml(text) + '</div>';
        } else {
            div.innerHTML = '<div class="bg-indigo-600 text-white text-sm rounded-2xl rounded-tr-none px-4 py-2.5 shadow-sm max-w-[80%]">' + escapeHtml(text) + '</div>' +
                '<div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0"><i class="fas fa-user text-gray-500 text-sm"></i></div>';
        }

        messagesEl.appendChild(div);
        scrollToBottom();
    }

    function showTyping() {
        var div = document.createElement('div');
        div.id = 'typingIndicator';
        div.className = 'flex gap-2';
        div.innerHTML = '<div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0"><i class="fas fa-robot text-indigo-600 text-sm"></i></div>' +
            '<div class="bg-white border border-gray-200 text-gray-400 text-sm rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex gap-1.5"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>';
        messagesEl.appendChild(div);
        scrollToBottom();
    }

    function removeTyping() {
        var el = document.getElementById('typingIndicator');
        if (el) el.remove();
    }

    function escapeHtml(text) {
        var d = document.createElement('div');
        d.textContent = text;
        return d.innerHTML;
    }

    async function sendMessage() {
        if (isWaiting) return;
        var text = inputEl.value.trim();
        if (!text) return;

        inputEl.value = '';
        isWaiting = true;
        sendBtn.disabled = true;
        sendBtn.classList.add('opacity-50');

        addMessage(text, false);
        showTyping();

        try {
            var res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            if (res.status === 401) {
                removeTyping();
                addMessage("Please log in to chat with me.", true);
                return;
            }

            var data = await res.json();
            removeTyping();
            addMessage(data.response || "Sorry, I didn't catch that.", true);
        } catch (e) {
            removeTyping();
            addMessage("Sorry, I'm having trouble connecting. Please try again later.", true);
        } finally {
            isWaiting = false;
            sendBtn.disabled = false;
            sendBtn.classList.remove('opacity-50');
        }
    }

    sendBtn.addEventListener('click', sendMessage);

    inputEl.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });
})();

});
