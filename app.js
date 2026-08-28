const menu = [
  { id: 1, category: "entrada", name: "Pao de fermentacao natural", description: "Manteiga tostada, missô de grao-de-bico e flor de sal.", price: 18, allergens: "gluten, leite", vegetarian: true },
  { id: 2, category: "entrada", name: "Tomate no carvao", description: "Tomates assados, coalhada seca, oleo de coentro e castanha-do-para.", price: 29, allergens: "leite, castanhas", vegetarian: true },
  { id: 3, category: "entrada", name: "Croquete de costela", description: "Costela cozida por 12 horas, mostarda de melaço e picles de maxixe.", price: 32, allergens: "gluten, ovos", vegetarian: false },
  { id: 4, category: "principal", name: "Peixe / coco / pimentao", description: "Peixe do dia, arroz de coco, pimentao tostado e caldo de moqueca.", price: 68, allergens: "peixe, coco", vegetarian: false },
  { id: 5, category: "principal", name: "Frango caipira na brasa", description: "Sobrecoxa desossada, quirera cremosa, quiabo e molho de assado.", price: 59, allergens: "leite", vegetarian: false },
  { id: 6, category: "principal", name: "Cupim / mandioca / cebola", description: "Cupim assado por 16 horas, pure de mandioca, cebola tostada e jus.", price: 72, allergens: "leite", vegetarian: false },
  { id: 7, category: "vegetal", name: "Abobora / feijao / couve", description: "Abobora cabotia na brasa, feijao manteiguinha, couve crocante e tucupi.", price: 52, allergens: "sem alergenos declarados", vegetarian: true },
  { id: 8, category: "vegetal", name: "Cogumelos com arroz vermelho", description: "Cogumelos tostados, arroz vermelho, creme de castanha e ervas frescas.", price: 56, allergens: "castanhas", vegetarian: true },
  { id: 9, category: "doce", name: "Cacau / cafe / cumaru", description: "Creme de chocolate 70%, bolo umido de cafe e sorvete de cumaru.", price: 28, allergens: "leite, ovos, gluten", vegetarian: true },
  { id: 10, category: "doce", name: "Caju em tres tempos", description: "Caju fresco, compota acida, castanha caramelizada e sorvete de limao.", price: 26, allergens: "castanhas", vegetarian: true },
  { id: 11, category: "bebida", name: "Mate da casa", description: "Cha-mate tostado, limao-cravo e pouco acucar. Garrafa de 500 ml.", price: 14, allergens: "sem alergenos declarados", vegetarian: true }
];

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const state = {
  category: "todos",
  search: "",
  vegetarian: false,
  cart: JSON.parse(localStorage.getItem("teagar-cart") || "{}")
};

const elements = {
  grid: document.querySelector("#menuGrid"),
  count: document.querySelector("#resultCount"),
  empty: document.querySelector("#emptyResults"),
  search: document.querySelector("#menuSearch"),
  vegetarian: document.querySelector("#vegetarianOnly"),
  cart: document.querySelector("#cart"),
  backdrop: document.querySelector("#cartBackdrop"),
  cartItems: document.querySelector("#cartItems"),
  cartEmpty: document.querySelector("#cartEmpty"),
  cartCount: document.querySelector("#cartCount"),
  cartTotal: document.querySelector("#cartTotal"),
  checkout: document.querySelector("#checkoutButton"),
  toast: document.querySelector("#toast")
};

function normalize(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function visibleItems() {
  const query = normalize(state.search);
  return menu.filter((item) => {
    const categoryMatches = state.category === "todos" || item.category === state.category;
    const searchMatches = !query || normalize(`${item.name} ${item.description} ${item.allergens}`).includes(query);
    return categoryMatches && searchMatches && (!state.vegetarian || item.vegetarian);
  });
}

function renderMenu() {
  const items = visibleItems();
  elements.grid.innerHTML = items.map((item) => `
    <article class="menu-item">
      <span class="menu-number">${String(item.id).padStart(2, "0")}</span>
      <div class="menu-copy">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <div class="menu-meta">
          <span>Contem: ${item.allergens}</span>
          ${item.vegetarian ? '<span class="veg">Vegetariano</span>' : ""}
        </div>
      </div>
      <div class="menu-action">
        <strong class="menu-price">${money.format(item.price)}</strong>
        <button class="add-button" type="button" data-add="${item.id}" aria-label="Adicionar ${item.name} ao pedido">+</button>
      </div>
    </article>
  `).join("");
  elements.count.textContent = `${items.length} ${items.length === 1 ? "preparo" : "preparos"}`;
  elements.empty.hidden = items.length > 0;
}

function saveCart() {
  localStorage.setItem("teagar-cart", JSON.stringify(state.cart));
}

function cartEntries() {
  return Object.entries(state.cart)
    .map(([id, quantity]) => ({ item: menu.find((entry) => entry.id === Number(id)), quantity }))
    .filter((entry) => entry.item && entry.quantity > 0);
}

function renderCart() {
  const entries = cartEntries();
  const quantity = entries.reduce((sum, entry) => sum + entry.quantity, 0);
  const total = entries.reduce((sum, entry) => sum + entry.item.price * entry.quantity, 0);
  elements.cartItems.innerHTML = entries.map(({ item, quantity: itemQuantity }) => `
    <div class="cart-row">
      <div><h3>${item.name}</h3><p>${money.format(item.price * itemQuantity)}</p></div>
      <div class="quantity" aria-label="Quantidade de ${item.name}">
        <button type="button" data-change="-1" data-id="${item.id}" aria-label="Remover uma unidade">−</button>
        <span>${itemQuantity}</span>
        <button type="button" data-change="1" data-id="${item.id}" aria-label="Adicionar uma unidade">+</button>
      </div>
    </div>
  `).join("");
  elements.cartEmpty.hidden = entries.length > 0;
  elements.cartCount.textContent = quantity;
  elements.cartTotal.textContent = money.format(total);
  elements.checkout.disabled = entries.length === 0;
  saveCart();
}

let toastTimer;
function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 2600);
}

function changeQuantity(id, amount) {
  state.cart[id] = (state.cart[id] || 0) + amount;
  if (state.cart[id] <= 0) delete state.cart[id];
  renderCart();
}

function openCart() {
  elements.backdrop.hidden = false;
  elements.cart.setAttribute("aria-hidden", "false");
  document.querySelector("#openCart").setAttribute("aria-expanded", "true");
  document.body.classList.add("cart-open");
  requestAnimationFrame(() => {
    elements.cart.classList.add("open");
    document.querySelector("#closeCart").focus();
  });
}

function closeCart() {
  elements.cart.classList.remove("open");
  elements.cart.setAttribute("aria-hidden", "true");
  document.querySelector("#openCart").setAttribute("aria-expanded", "false");
  document.body.classList.remove("cart-open");
  setTimeout(() => { elements.backdrop.hidden = true; }, 250);
  document.querySelector("#openCart").focus();
}

document.querySelectorAll(".category").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".category").forEach((entry) => {
      const active = entry === button;
      entry.classList.toggle("active", active);
      entry.setAttribute("aria-pressed", String(active));
    });
    state.category = button.dataset.category;
    renderMenu();
  });
});

elements.search.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderMenu();
});

elements.vegetarian.addEventListener("change", (event) => {
  state.vegetarian = event.target.checked;
  renderMenu();
});

elements.grid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  const item = menu.find((entry) => entry.id === Number(button.dataset.add));
  changeQuantity(item.id, 1);
  showToast(`${item.name} adicionado ao pedido.`);
});

elements.cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("[data-change]");
  if (button) changeQuantity(button.dataset.id, Number(button.dataset.change));
});

document.querySelector("#openCart").addEventListener("click", openCart);
document.querySelector("#closeCart").addEventListener("click", closeCart);
elements.backdrop.addEventListener("click", closeCart);
elements.checkout.addEventListener("click", () => showToast("Pedido revisado. A integracao de pagamento entra na proxima etapa."));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && elements.cart.classList.contains("open")) closeCart();
});

window.addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  document.querySelector("#progressBar").style.width = `${max ? (window.scrollY / max) * 100 : 0}%`;
}, { passive: true });

renderMenu();
renderCart();
