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
