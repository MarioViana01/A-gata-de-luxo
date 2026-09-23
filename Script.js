// ==========================================================================
// 1. ÍCONES (SVG em linha com traço dourado/elegante)
// ==========================================================================
const icons = {
  anel: `<svg viewBox="0 0 100 100" fill="none" stroke="#D2A74E" stroke-width="2.2">
    <circle cx="50" cy="60" r="26"/>
    <polygon points="50,14 62,30 50,42 38,30"/>
  </svg>`,
  colar: `<svg viewBox="0 0 100 100" fill="none" stroke="#D2A74E" stroke-width="2.2">
    <path d="M20 25 Q50 65 80 25"/>
    <polygon points="50,60 58,74 50,86 42,74"/>
  </svg>`,
  brinco: `<svg viewBox="0 0 100 100" fill="none" stroke="#D2A74E" stroke-width="2.2">
    <circle cx="50" cy="30" r="12"/>
    <line x1="50" y1="42" x2="50" y2="60"/>
    <polygon points="50,60 60,76 50,90 40,76"/>
  </svg>`,
  pulseira: `<svg viewBox="0 0 100 100" fill="none" stroke="#D2A74E" stroke-width="2.2">
    <ellipse cx="50" cy="55" rx="34" ry="20"/>
    <circle cx="50" cy="35" r="3" fill="#D2A74E"/>
    <circle cx="20" cy="55" r="3" fill="#D2A74E"/>
    <circle cx="80" cy="55" r="3" fill="#D2A74E"/>
  </svg>`
};

// ==========================================================================
// 2. CATÁLOGO DE PRODUTOS (Com preços antigos para demonstração)
// ==========================================================================
const products = [
  { id: 1, name: "Anel Vértice", category: "aneis", icon: "anel", material: "Ouro 18k, safira azul", price: 3480, oldPrice: 3890 },
  { id: 2, name: "Anel Sereia", category: "aneis", icon: "anel", material: "Prata 950, madrepérola", price: 890, oldPrice: 990 },
  { id: 3, name: "Anel Solano", category: "aneis", icon: "anel", material: "Ouro 18k, diamante", price: 6200, oldPrice: null },
  { id: 4, name: "Colar Meridiano", category: "colares", icon: "colar", material: "Ouro 18k, ponto de luz", price: 2750, oldPrice: 3100 },
  { id: 5, name: "Colar Argila", category: "colares", icon: "colar", material: "Prata 950", price: 640, oldPrice: null },
  { id: 6, name: "Brinco Cipó", category: "brincos", icon: "brinco", material: "Ouro 18k", price: 1980, oldPrice: 2200 },
  { id: 7, name: "Brinco Orvalho", category: "brincos", icon: "brinco", material: "Prata 950, quartzo", price: 720, oldPrice: null },
  { id: 8, name: "Pulseira Riacho", category: "pulseiras", icon: "pulseira", material: "Ouro 18k", price: 3120, oldPrice: 3500 }
];

// ==========================================================================
// 3. ESTADO GLOBAL E SELEÇÃO DE ELEMENTOS DO DOM
// ==========================================================================
let currentFilter = "todos";
let cart = JSON.parse(localStorage.getItem("gata_de_luxo_cart") || "[]");

const grid = document.getElementById("productGrid");
const tabs = document.querySelectorAll(".tab");
const cartCountEl = document.getElementById("cartCount");
const cartItemsEl = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");

// Função Utilitária para Formatação Monetária
const formatPrice = (value) => 
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ==========================================================================
// 4. RENDERIZAÇÃO DOS PRODUTOS COM BLOCO PROMOCIONAL
// ==========================================================================
function renderProducts() {
  if (!grid) return;

  const list = currentFilter === "todos"
    ? products
    : products.filter(p => p.category === currentFilter);

  grid.innerHTML = list.map(p => {
    // Cálculos Dinâmicos
    const pixPrice = formatPrice(p.price * 0.95);             // 5% de desconto no Pix
    const installmentPrice = formatPrice(p.price / 10);        // 10x sem juros
    const currentPriceFormatted = formatPrice(p.price);
    const oldPriceFormatted = p.oldPrice ? formatPrice(p.oldPrice) : null;

    return `
      <div class="product-card">
        <div class="product-thumb">
          ${icons[p.icon] || ''}
        </div>
        
        <h3>${p.name}</h3>
        <p class="product-material">${p.material}</p>
        
        <div class="product-pricing">
          <div class="price-row">
            ${oldPriceFormatted ? `<span class="price-old">${oldPriceFormatted}</span><span class="price-divider">|</span>` : ''}
            <span class="price-current">${currentPriceFormatted}</span>
          </div>
          
          <div class="price-pix">
            <strong>${pixPrice}</strong> com Pix
          </div>
          
          <div class="price-installments">
            <strong>10x</strong> de <strong>${installmentPrice}</strong> sem juros
          </div>
        </div>

        <button class="btn-primary btn-block add-btn" data-id="${p.id}">Adicionar à sacola</button>
      </div>
    `;
  }).join("");

  // Event Listeners para botões de Adicionar ao Carrinho
  grid.querySelectorAll(".add-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const productId = Number(btn.dataset.id);
      addToCart(productId);
      
      btn.textContent = "Adicionado ✓";
      btn.style.backgroundColor = "var(--roxo-vivido)";
      btn.style.color = "#FFF";

      setTimeout(() => {
        btn.textContent = "Adicionar à sacola";
        btn.style.backgroundColor = "";
        btn.style.color = "";
      }, 1200);
    });
  });
}

// ==========================================================================
// 5. FILTROS DE CATEGORIA
// ==========================================================================
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentFilter = tab.dataset.filter;
    renderProducts();
  });
});

// ==========================================================================
// 6. GERENCIAMENTO DO CARRINHO (localStorage e Regras)
// ==========================================================================
function saveCart() {
  localStorage.setItem("gata_de_luxo_cart", JSON.stringify(cart));
}

function addToCart(id) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, qty: 1 });
  }
  saveCart();
  renderCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== id);
  }
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function renderCart() {
  if (!cartCountEl || !cartItemsEl || !cartTotalEl) return;

  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
  cartCountEl.textContent = totalItems;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<p class="cart-empty" style="text-align: center; color: var(--ink-muted); padding: 32px 0;">Sua sacola está vazia.</p>`;
    cartTotalEl.textContent = formatPrice(0);
    return;
  }

  let total = 0;
  cartItemsEl.innerHTML = cart.map(item => {
    const product = products.find(p => p.id === item.id);
    if (!product) return '';
    
    const subtotal = product.price * item.qty;
    total += subtotal;

    return `
      <div class="cart-item" style="display: flex; gap: 16px; margin-bottom: 20px; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 16px;">
        <div class="cart-item-icon" style="width: 48px; height: 48px; background: var(--bg-roxo-escuro); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          ${icons[product.icon] || ''}
        </div>
        <div class="cart-item-info" style="flex: 1;">
          <h4 style="font-family: var(--font-heading); font-size: 1rem;">${product.name}</h4>
          <p style="font-size: 0.9rem; color: var(--ink-muted); margin-bottom: 6px;">${formatPrice(product.price)}</p>
          
          <div class="cart-item-controls" style="display: flex; align-items: center; gap: 8px;">
            <button class="qty-btn" data-action="dec" data-id="${product.id}" style="border: 1px solid var(--border-light); width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold;">−</button>
            <span style="font-size: 0.9rem; font-weight: 600;">${item.qty}</span>
            <button class="qty-btn" data-action="inc" data-id="${product.id}" style="border: 1px solid var(--border-light); width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold;">+</button>
            <button class="remove-btn" data-action="remove" data-id="${product.id}" style="color: #D32F2F; font-size: 0.8rem; margin-left: auto;">remover</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  cartTotalEl.textContent = formatPrice(total);

  // Bind de eventos dos controles do carrinho
  cartItemsEl.querySelectorAll("[data-action]").forEach(btn => {
    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;
    btn.addEventListener("click", () => {
      if (action === "inc") changeQty(id, 1);
      if (action === "dec") changeQty(id, -1);
      if (action === "remove") removeFromCart(id);
    });
  });
}

// ==========================================================================
// 7. ABRIR E FECHAR A GAVETA DO CARRINHO
// ==========================================================================
function openCart() {
  if (cartDrawer && cartOverlay) {
    cartDrawer.classList.add("active");
    cartOverlay.classList.add("active");
  }
}

function closeCartFn() {
  if (cartDrawer && cartOverlay) {
    cartDrawer.classList.remove("active");
    cartOverlay.classList.remove("active");
  }
}

const cartBtn = document.getElementById("cartBtn");
const closeCartBtn = document.getElementById("closeCart");

if (cartBtn) cartBtn.addEventListener("click", openCart);
if (closeCartBtn) closeCartBtn.addEventListener("click", closeCartFn);
if (cartOverlay) cartOverlay.addEventListener("click", closeCartFn);

// Finalização de Compra (Checkout de Exemplo)
const checkoutBtn = document.getElementById("checkoutBtn");
if (checkoutBtn) {
  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) return;
    alert("Pedido recebido! Em breve entraremos em contato para combinar entrega e pagamento.");
    cart = [];
    saveCart();
    renderCart();
    closeCartFn();
  });
}

// ==========================================================================
// 8. MENU MOBILE
// ==========================================================================
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    if (mainNav.style.display === "flex") {
      mainNav.style.display = "none";
    } else {
      mainNav.style.display = "flex";
      mainNav.style.flexDirection = "column";
      mainNav.style.position = "absolute";
      mainNav.style.top = "100%";
      mainNav.style.left = "0";
      mainNav.style.width = "100%";
      mainNav.style.backgroundColor = "var(--bg-cream)";
      mainNav.style.padding = "16px 24px";
      mainNav.style.borderBottom = "1px solid var(--border-light)";
    }
  });
}

// ==========================================================================
// 9. FORMULÁRIO DE NEWSLETTER
// ==========================================================================
const newsletterForm = document.getElementById("newsletterForm");
if (newsletterForm) {
  newsletterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const emailInput = document.getElementById("newsletterEmail");
    const msg = document.getElementById("newsletterMsg");
    
    if (emailInput && msg) {
      msg.textContent = `Pronto! Vamos avisar ${emailInput.value} sobre os próximos lançamentos.`;
      msg.style.color = "var(--roxo-vivido)";
      msg.style.marginTop = "8px";
      msg.style.fontSize = "0.85rem";
      newsletterForm.reset();
    }
  });
}

// ==========================================================================
// 10. INICIALIZAÇÃO
// ==========================================================================
renderProducts();
renderCart();