/* ============================================================
   DOCE PALADAR — app.js
   Cart, filters, modals, forms, navigation
   ============================================================ */

// ── Utilities ────────────────────────────────────────────────
function fmt(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ── Cart Store (localStorage) ─────────────────────────────────
const Cart = {
  KEY: 'doce-paladar-cart',
  get()    { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); },
  save(d)  { localStorage.setItem(this.KEY, JSON.stringify(d)); },

  add(product) {
    const items = this.get();
    const ex = items.find(i => i.id === product.id);
    if (ex) ex.quantity += 1;
    else items.push({ ...product, quantity: 1 });
    this.save(items);
  },

  remove(id) { this.save(this.get().filter(i => i.id !== id)); },

  setQty(id, qty) {
    if (qty <= 0) return this.remove(id);
    const items = this.get();
    const item = items.find(i => i.id === id);
    if (item) item.quantity = qty;
    this.save(items);
  },

  clear()  { this.save([]); },
  count()  { return this.get().reduce((s, i) => s + i.quantity, 0); },
  total()  { return this.get().reduce((s, i) => s + i.price * i.quantity, 0); }
};

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('dp-toast');
  document.getElementById('dp-toast-msg').textContent = msg;
  t.classList.remove('opacity-0', 'translate-y-8');
  t.classList.add('opacity-100', 'translate-y-0');
  clearTimeout(t._tid);
  t._tid = setTimeout(() => {
    t.classList.add('opacity-0', 'translate-y-8');
    t.classList.remove('opacity-100', 'translate-y-0');
  }, 2600);
}

// ── Badge ─────────────────────────────────────────────────────
function updateBadge() {
  const n = Cart.count();
  document.querySelectorAll('.dp-cart-badge').forEach(el => {
    el.textContent = n;
    el.style.display = n > 0 ? 'flex' : 'none';
  });
}

// ── Cart Drawer ───────────────────────────────────────────────
function renderCart() {
  const items  = Cart.get();
  const wrap   = document.getElementById('dp-cart-items');
  const footer = document.getElementById('dp-cart-footer');
  const empty  = document.getElementById('dp-cart-empty');
  const sub    = document.getElementById('dp-cart-subtotal');
  if (!wrap) return;

  if (!items.length) {
    wrap.classList.add('hidden');
    footer.classList.add('hidden');
    empty.classList.remove('hidden');
  } else {
    wrap.classList.remove('hidden');
    footer.classList.remove('hidden');
    empty.classList.add('hidden');

    wrap.innerHTML = items.map(it => `
      <div class="flex gap-3 bg-white rounded-xl p-3 shadow-sm">
        <img src="${it.image}" alt="${it.name}"
             class="w-20 h-20 rounded-xl object-cover flex-shrink-0 bg-[#F2E9D8]"
             onerror="this.style.display='none'"/>
        <div class="flex-1 min-w-0">
          <p class="font-serif text-[#6B3048] font-bold text-sm leading-snug">${it.name}</p>
          <p class="text-[#322705] font-bold text-sm mt-0.5">${fmt(it.price)}</p>
          <div class="flex items-center justify-between mt-2">
            <div class="flex items-center gap-2">
              <button class="dp-qty w-7 h-7 rounded-full border border-[#D4C3B0] flex items-center justify-center hover:bg-[#F2E9D8] transition-colors" data-act="dec" data-id="${it.id}">
                <span class="material-symbols-outlined" style="font-size:16px">remove</span>
              </button>
              <span class="font-bold text-[#6B3048] w-5 text-center text-sm">${it.quantity}</span>
              <button class="dp-qty w-7 h-7 rounded-full border border-[#D4C3B0] flex items-center justify-center hover:bg-[#F2E9D8] transition-colors" data-act="inc" data-id="${it.id}">
                <span class="material-symbols-outlined" style="font-size:16px">add</span>
              </button>
            </div>
            <button class="dp-remove text-[#C78B9F] hover:text-[#6B3048] transition-colors" data-id="${it.id}">
              <span class="material-symbols-outlined" style="font-size:20px">delete</span>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    sub.textContent = fmt(Cart.total());
  }
  updateBadge();
}

function openCart() {
  renderCart();
  const ov = document.getElementById('dp-overlay');
  ov.classList.replace('hidden', 'flex');
  requestAnimationFrame(() => {
    document.getElementById('dp-drawer').classList.remove('translate-x-full');
    ov.style.opacity = '1';
  });
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('dp-drawer').classList.add('translate-x-full');
  const ov = document.getElementById('dp-overlay');
  ov.style.opacity = '0';
  setTimeout(() => ov.classList.replace('flex', 'hidden'), 300);
  document.body.style.overflow = '';
}

// ── Product Detail Modal ──────────────────────────────────────
function openProductModal(card) {
  const name  = card.dataset.productName;
  const price = parseFloat(card.dataset.productPrice);
  const desc  = card.dataset.productDesc   || '';
  const badge = card.dataset.productBadge  || '';
  const weight= card.dataset.productWeight || '';
  const img   = card.querySelector('img')?.src || '';
  const id    = parseInt(card.dataset.productId);

  document.getElementById('pm-img').src          = img;
  document.getElementById('pm-img').alt          = name;
  document.getElementById('pm-name').textContent  = name;
  document.getElementById('pm-price').textContent = fmt(price);
  document.getElementById('pm-desc').textContent  = desc;
  document.getElementById('pm-weight').textContent = weight;
  const badgeEl = document.getElementById('pm-badge');
  badgeEl.textContent    = badge;
  badgeEl.style.display  = badge ? 'inline-block' : 'none';

  const addBtn = document.getElementById('pm-add');
  addBtn.dataset.productId    = id;
  addBtn.dataset.productName  = name;
  addBtn.dataset.productPrice = price;
  addBtn.dataset.productImage = img;

  document.getElementById('dp-product-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  document.getElementById('dp-product-modal').classList.add('hidden');
  document.body.style.overflow = '';
}

// ── Checkout Modal ────────────────────────────────────────────
function showCheckout() {
  document.getElementById('dp-checkout-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

// ── Catalog: Filters, Search, Sort ───────────────────────────
function initCatalog() {
  const filterBtns = document.querySelectorAll('[data-filter]');
  const cards      = document.querySelectorAll('[data-category]');
  const countEl    = document.getElementById('product-count');

  if (!filterBtns.length) return;

  function setCount() {
    let n = 0;
    cards.forEach(c => { if (c.style.display !== 'none') n++; });
    if (countEl) countEl.textContent = `Exibindo ${n} produto${n !== 1 ? 's' : ''} artesanal${n !== 1 ? 'is' : ''}`;
  }

  function applyFilter(filter, skipCount) {
    cards.forEach(c => {
      c.style.display = (filter === 'all' || c.dataset.category === filter) ? '' : 'none';
    });
    if (!skipCount) setCount();

    // Active state on filter buttons
    filterBtns.forEach(b => {
      const isActive = b.dataset.filter === filter;
      b.classList.toggle('bg-[#6B3048]',  isActive);
      b.classList.toggle('text-white',    isActive);
      b.classList.toggle('font-bold',     isActive);
      b.classList.toggle('bg-surface-container-highest', !isActive && b.classList.contains('sidebar-btn'));
      b.classList.toggle('text-[#6B3048]', !isActive && b.classList.contains('sidebar-btn'));
      b.classList.toggle('bg-[#F2E9D8]',   !isActive && !b.classList.contains('sidebar-btn'));
      b.classList.toggle('text-on-surface-variant', !isActive && !b.classList.contains('sidebar-btn'));
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
  });

  // Search
  const searchInput = document.getElementById('catalog-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      cards.forEach(c => {
        const name = (c.dataset.productName || '').toLowerCase();
        c.style.display = (!q || name.includes(q)) ? '' : 'none';
      });
      setCount();
    });
  }

  // Sort
  const sortSel = document.getElementById('sort-select');
  if (sortSel) {
    sortSel.addEventListener('change', () => {
      const grid = document.getElementById('product-grid');
      if (!grid) return;
      const list = Array.from(grid.querySelectorAll('[data-product-price]'));
      list.sort((a, b) => {
        const pa = parseFloat(a.dataset.productPrice);
        const pb = parseFloat(b.dataset.productPrice);
        if (sortSel.value === 'price-asc')  return pa - pb;
        if (sortSel.value === 'price-desc') return pb - pa;
        return (parseInt(a.dataset.productOrder) || 0) - (parseInt(b.dataset.productOrder) || 0);
      });
      list.forEach(c => grid.appendChild(c));
    });
  }

  // URL param: catalog.html?category=paes
  const cat = new URLSearchParams(location.search).get('category');
  if (cat) {
    applyFilter(cat);
  } else {
    setCount();
  }
}

// ── Menu Tabs ─────────────────────────────────────────────────
function initMenuTabs() {
  const tabs = document.querySelectorAll('[data-menu-tab]');
  const secs = document.querySelectorAll('[data-menu-section]');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('bg-primary', 'text-on-primary', 'bg-[#6B3048]', 'text-white');
        t.classList.add('bg-[#F2E9D8]', 'text-[#504439]');
      });
      tab.classList.add('bg-[#6B3048]', 'text-white');
      tab.classList.remove('bg-[#F2E9D8]', 'text-[#504439]');

      const f = tab.dataset.menuTab;
      secs.forEach(s => {
        s.style.display = (f === 'all' || s.dataset.menuSection === f) ? '' : 'none';
      });
    });
  });
}

// ── Subscription Form ─────────────────────────────────────────
function initForms() {
  document.querySelectorAll('[data-subscribe]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const inp = document.getElementById('subscribe-email');
      if (inp && !inp.value.trim()) { inp.focus(); return; }
      showToast('Assinatura confirmada! Bem-vindo ao Clube do Pão!');
      if (inp) inp.value = '';
    });
  });

  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const orig = btn.textContent;
      btn.textContent = 'Enviando...';
      btn.disabled = true;
      setTimeout(() => {
        form.innerHTML = `
          <div class="text-center py-10 space-y-4">
            <div class="w-16 h-16 rounded-full bg-[#F8BBD0] mx-auto flex items-center justify-center">
              <span class="material-symbols-outlined text-3xl text-[#6B3048]" style="font-variation-settings:'FILL' 1">check_circle</span>
            </div>
            <h3 class="font-serif text-2xl text-[#6B3048]">Mensagem Enviada!</h3>
            <p class="text-[#504439]">Obrigado pelo contato! Responderemos em até 24 horas.</p>
          </div>`;
      }, 900);
    });
  }
}

// ── Inject Persistent UI (drawer, modals, toast) ──────────────
function injectUI() {
  document.body.insertAdjacentHTML('beforeend', `
    <!-- Cart Overlay -->
    <div id="dp-overlay" class="hidden fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300 cursor-pointer" style="opacity:0"></div>

    <!-- Cart Drawer -->
    <aside id="dp-drawer" class="fixed top-0 right-0 h-full w-full max-w-[420px] bg-[#FDF5E6] z-[70] flex flex-col translate-x-full transition-transform duration-300 shadow-2xl">
      <div class="flex items-center justify-between px-6 py-5 border-b border-[#D4C3B0]/30 flex-shrink-0">
        <h2 class="font-serif text-xl text-[#6B3048] font-bold flex items-center gap-2">
          <span class="material-symbols-outlined">shopping_basket</span> Meu Carrinho
        </h2>
        <button id="dp-cart-close" class="w-9 h-9 rounded-full hover:bg-[#F2E9D8] flex items-center justify-center transition-colors">
          <span class="material-symbols-outlined text-[#6B3048]">close</span>
        </button>
      </div>
      <div id="dp-cart-items" class="flex-1 overflow-y-auto px-6 py-4 space-y-3 hidden"></div>
      <div id="dp-cart-empty" class="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
        <div class="w-20 h-20 rounded-full bg-[#F8BBD0]/40 flex items-center justify-center">
          <span class="material-symbols-outlined text-4xl text-[#C78B9F]">shopping_basket</span>
        </div>
        <p class="font-serif text-xl text-[#6B3048]">Carrinho vazio</p>
        <p class="text-sm text-[#504439]">Adicione produtos para começar seu pedido.</p>
        <a href="catalog.html" class="px-6 py-3 rounded-full bg-[#6B3048] text-white font-bold text-sm hover:bg-[#8B4060] transition-colors">Ver Catálogo</a>
      </div>
      <div id="dp-cart-footer" class="px-6 py-5 border-t border-[#D4C3B0]/30 space-y-3 hidden flex-shrink-0">
        <div class="flex justify-between items-center">
          <span class="text-[#504439] font-medium">Total do pedido</span>
          <span id="dp-cart-subtotal" class="font-bold text-[#6B3048] text-xl"></span>
        </div>
        <button id="dp-checkout-btn" class="w-full py-4 rounded-full bg-[#6B3048] text-white font-bold text-base hover:bg-[#8B4060] transition-colors shadow-md">
          Finalizar Pedido
        </button>
        <button id="dp-clear-btn" class="w-full py-2 text-xs text-[#504439]/60 hover:text-[#6B3048] transition-colors">
          Limpar carrinho
        </button>
      </div>
    </aside>

    <!-- Product Detail Modal -->
    <div id="dp-product-modal" class="hidden fixed inset-0 bg-black/50 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div class="bg-[#FDF5E6] rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg overflow-hidden shadow-2xl">
        <div class="relative h-64 bg-[#F2E9D8]">
          <img id="pm-img" src="" alt="" class="w-full h-full object-cover"/>
          <button id="pm-close" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
          <span id="pm-badge" class="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 text-[#3D1121] text-[10px] font-bold uppercase tracking-wider" style="display:none"></span>
        </div>
        <div class="p-6 space-y-3">
          <div class="flex justify-between items-start gap-4">
            <h3 id="pm-name" class="font-serif text-2xl text-[#6B3048] font-bold leading-tight"></h3>
            <span id="pm-price" class="font-bold text-[#322705] text-xl shrink-0"></span>
          </div>
          <p id="pm-weight" class="text-xs text-[#504439]/60 font-medium"></p>
          <p id="pm-desc" class="text-[#504439] leading-relaxed text-sm"></p>
          <button id="pm-add" data-add-cart
            data-product-id="" data-product-name="" data-product-price="" data-product-image=""
            class="w-full py-4 rounded-full bg-[#6B3048] text-white font-bold text-base hover:bg-[#8B4060] transition-colors shadow-md flex items-center justify-center gap-2 mt-2">
            <span class="material-symbols-outlined text-base">shopping_cart</span> Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </div>

    <!-- Checkout Success Modal -->
    <div id="dp-checkout-modal" class="hidden fixed inset-0 bg-black/50 z-[90] flex items-center justify-center p-6">
      <div class="bg-[#FDF5E6] rounded-2xl p-8 max-w-sm w-full text-center space-y-5 shadow-2xl">
        <div class="w-20 h-20 rounded-full bg-[#F8BBD0] mx-auto flex items-center justify-center">
          <span class="material-symbols-outlined text-4xl text-[#6B3048]" style="font-variation-settings:'FILL' 1">check_circle</span>
        </div>
        <h3 class="font-serif text-2xl text-[#6B3048]">Pedido Enviado!</h3>
        <p class="text-[#504439] text-sm leading-relaxed">Obrigado por escolher a Doce Paladar! Em breve entraremos em contato para confirmar seu pedido.</p>
        <button id="dp-checkout-ok" class="w-full py-4 rounded-full bg-[#6B3048] text-white font-bold hover:bg-[#8B4060] transition-colors">
          Continuar Comprando
        </button>
      </div>
    </div>

    <!-- Toast Notification -->
    <div id="dp-toast" class="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 bg-[#6B3048] text-white px-5 py-3 rounded-full shadow-xl font-medium text-sm transition-all duration-300 opacity-0 translate-y-8 pointer-events-none whitespace-nowrap">
      <span class="material-symbols-outlined text-base" style="font-variation-settings:'FILL' 1">check_circle</span>
      <span id="dp-toast-msg"></span>
    </div>
  `);
}

// ── Event Delegation ──────────────────────────────────────────
function initEvents() {
  document.addEventListener('click', e => {

    // Open cart
    if (e.target.closest('[data-cart-open]')) { openCart(); return; }

    // Close cart
    if (e.target.closest('#dp-cart-close') || e.target.id === 'dp-overlay') { closeCart(); return; }

    // Cart qty buttons
    if (e.target.closest('.dp-qty')) {
      const btn  = e.target.closest('.dp-qty');
      const id   = parseInt(btn.dataset.id);
      const item = Cart.get().find(i => i.id === id);
      if (!item) return;
      Cart.setQty(id, item.quantity + (btn.dataset.act === 'inc' ? 1 : -1));
      renderCart();
      return;
    }

    // Remove from cart
    if (e.target.closest('.dp-remove')) {
      Cart.remove(parseInt(e.target.closest('.dp-remove').dataset.id));
      renderCart();
      return;
    }

    // Add to cart
    if (e.target.closest('[data-add-cart]')) {
      const btn  = e.target.closest('[data-add-cart]');
      const card = btn.closest('[data-product-id]');
      const id   = parseInt(btn.dataset.productId   || card?.dataset.productId);
      const name = btn.dataset.productName           || card?.dataset.productName  || '';
      const price= parseFloat(btn.dataset.productPrice || card?.dataset.productPrice || 0);
      const img  = btn.dataset.productImage          || card?.querySelector('img')?.src || '';
      if (!id || !name) return;
      Cart.add({ id, name, price, image: img });
      updateBadge();
      showToast(`${name} adicionado ao carrinho!`);
      closeProductModal();
      return;
    }

    // View details
    if (e.target.closest('[data-view-details]')) {
      const card = e.target.closest('[data-product-id]');
      if (card) openProductModal(card);
      return;
    }

    // Close product modal
    if (e.target.closest('#pm-close') || e.target.id === 'dp-product-modal') {
      closeProductModal(); return;
    }

    // Checkout button
    if (e.target.closest('#dp-checkout-btn')) {
      if (!Cart.count()) return;
      closeCart();
      setTimeout(showCheckout, 350);
      return;
    }

    // Checkout OK
    if (e.target.closest('#dp-checkout-ok')) {
      Cart.clear();
      updateBadge();
      document.getElementById('dp-checkout-modal').classList.add('hidden');
      document.body.style.overflow = '';
      return;
    }

    // Clear cart
    if (e.target.closest('#dp-clear-btn')) {
      if (confirm('Limpar todos os itens do carrinho?')) {
        Cart.clear(); renderCart();
      }
      return;
    }
  });

  // Close modals with Escape
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const modal = document.getElementById('dp-product-modal');
    if (!modal?.classList.contains('hidden')) { closeProductModal(); return; }
    const drawer = document.getElementById('dp-drawer');
    if (drawer && !drawer.classList.contains('translate-x-full')) { closeCart(); }
  });
}

// ── Bootstrap ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  injectUI();
  updateBadge();
  initEvents();
  initCatalog();
  initMenuTabs();
  initForms();
});
