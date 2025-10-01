// cart.js
const whatsappNumber = '6283807602549'; // Nomor WhatsApp konsisten

// Mendapatkan data keranjang dari Local Storage
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('kampoeng_kelong_cart') || '[]');
  } catch (e) {
    console.error('Error parsing cart from localStorage:', e);
    return [];
  }
}

// Menyimpan data keranjang ke Local Storage
function saveCart(cart) {
  try {
    localStorage.setItem('kampoeng_kelong_cart', JSON.stringify(cart));
    updateCartBadge();
  } catch (e) {
    console.error('Error saving cart to localStorage:', e);
  }
}

// Memperbarui badge jumlah item di navigasi (header dan sidebar)
function updateCartBadge() {
  try {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const badges = document.querySelectorAll('.cart-count'); // Update semua .cart-count
    badges.forEach(badge => {
      if (badge) {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'inline-block' : 'none';
      }
    });
  } catch (e) {
    console.error('Error updating cart badge:', e);
  }
}

// Menampilkan notifikasi toast
function showToast(message) {
  const toast = document.getElementById('toast-notification');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  } else {
    console.warn('Toast element not found.');
  }
}

// Menambahkan item ke keranjang
function addToCart(item) {
  try {
    let cart = getCart();
    const existing = cart.find(i => i.nama === item.nama);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      cart.push({ ...item, quantity: 1 });
    }
    saveCart(cart);
    showToast(`${item.nama} ditambahkan ke keranjang!`);
  } catch (e) {
    console.error('Error adding to cart:', e);
    showToast('Gagal menambahkan ke keranjang.');
  }
}

// Menghapus item dari keranjang
function removeItem(nama) {
  try {
    let cart = getCart();
    cart = cart.filter(item => item.nama !== nama);
    saveCart(cart);
  } catch (e) {
    console.error('Error removing item from cart:', e);
  }
}

// Mengubah jumlah item
function updateQuantity(nama, change) {
  try {
    let cart = getCart();
    const item = cart.find(i => i.nama === nama);
    if (item) {
      item.quantity += change;
      if (item.quantity <= 0) {
        removeItem(nama);
      } else {
        saveCart(cart);
      }
    }
  } catch (e) {
    console.error('Error updating quantity:', e);
  }
}

// Menampilkan isi keranjang (untuk Cart.html)
function renderCart() {
  const cart = getCart();
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartSummaryContainer = document.getElementById('cart-summary-container');
  const cartTotalEl = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');

  if (!cartItemsContainer || !cartSummaryContainer || !cartTotalEl || !checkoutBtn) {
    console.error('Elemen keranjang tidak ditemukan di halaman.');
    return;
  }

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-cart-message">Keranjang Anda kosong.</p>';
    cartSummaryContainer.style.display = 'none';
    return;
  }

  cartSummaryContainer.style.display = 'block';

  let total = 0;
  const html = cart.map(item => {
    const qty = item.quantity || 1;
    const subtotal = Number(item.harga) * qty;
    total += subtotal;
    return `
      <div class="cart-item">
        <img src="${item.gambar}" alt="${item.nama}" class="cart-item-image">
        <div class="item-details">
          <h4>${item.nama}</h4>
          <span class="item-price">Rp ${Number(item.harga).toLocaleString('id-ID')}</span>
          <div class="item-quantity">
            <button class="qty-btn" data-name="${item.nama}" data-change="-1">-</button>
            <span>${qty}</span>
            <button class="qty-btn" data-name="${item.nama}" data-change="1">+</button>
          </div>
        </div>
        <button class="remove-btn" data-name="${item.nama}">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `;
  }).join('');

  cartItemsContainer.innerHTML = html;
  cartTotalEl.textContent = `Rp ${total.toLocaleString('id-ID')}`;

  // Event listener untuk tombol hapus
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      removeItem(btn.dataset.name);
      renderCart();
    });
  });

  // Event listener untuk tombol kuantitas
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      updateQuantity(btn.dataset.name, Number(btn.dataset.change));
      renderCart();
    });
  });

  // Event listener untuk tombol checkout
  checkoutBtn.addEventListener('click', () => {
    const customerName = document.getElementById('customer-name');
    if (!customerName || !customerName.value) {
      alert('Mohon masukkan nama Anda untuk proses checkout.');
      return;
    }

    let whatsappText = `Halo, saya *${customerName.value}*. Saya ingin memesan dari Kampoeng Kelong.\n\n`;
    whatsappText += `*Daftar Pesanan:*\n`;
    cart.forEach(item => {
      const qty = item.quantity || 1;
      const subtotal = Number(item.harga) * qty;
      whatsappText += `- ${item.nama} (${qty}x) - Rp ${subtotal.toLocaleString('id-ID')}\n`;
    });
    whatsappText += `\n*Total Belanja:* Rp ${total.toLocaleString('id-ID')}\n\nTerima kasih!`;

    const encodedText = encodeURIComponent(whatsappText);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedText}`, '_blank');
  });
}
