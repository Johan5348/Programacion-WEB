// 🛒 Cart Open Close
let cartIcon = document.querySelector("#cart-icon");
let cart = document.querySelector(".cart");
let closeCart = document.querySelector("#close-cart");

// 👉 Abrir carrito al hacer clic en el ícono
cartIcon.onclick = () => {
  cart.classList.add("active");
};

// 👉 Cerrar carrito al hacer clic en el botón de cerrar
closeCart.onclick = () => {
  cart.classList.remove("active");
};

// ✅ Esperar a que el documento cargue antes de ejecutar funciones
if (document.readyState == "loading") {
  document.addEventListener("DOMContentLoaded", ready);
} else {
  ready();
}

// 🔁 Función principal que añade listeners a los botones
function ready() {
  // ❌ Eliminar producto del carrito
  let removeCartButtons = document.getElementsByClassName("cart-remove");
  for (let i = 0; i < removeCartButtons.length; i++) {
    let button = removeCartButtons[i];
    button.addEventListener("click", removeCartItem);
  }

  // 🔢 Cambiar cantidad de un producto
  let quantityInputs = document.getElementsByClassName("cart-quantity");
  for (let i = 0; i < quantityInputs.length; i++) {
    let input = quantityInputs[i];
    input.addEventListener("change", quantityChanged);
  }

  // ➕ Agregar producto al carrito
  let addCart = document.getElementsByClassName("add-cart");
  for (let i = 0; i < addCart.length; i++) {
    let button = addCart[i];
    button.addEventListener("click", addCartClicked);
  }

  // 🔄 Cargar productos almacenados en localStorage
  loadCartItems();

  // 🔥 Añadir listener para el botón de pago
  const payBtn = document.querySelector(".btn-buy");
  if (payBtn) {
    payBtn.addEventListener("click", () => {
      // Crear array con productos actuales en carrito
      let cartContent = document.getElementsByClassName("cart-content")[0];
      let cartBoxes = cartContent.getElementsByClassName("cart-box");
      let items = [];

      for (let i = 0; i < cartBoxes.length; i++) {
        let cartBox = cartBoxes[i];
        let title = cartBox.getElementsByClassName("cart-product-title")[0].innerText;
        let price = cartBox.getElementsByClassName("cart-price")[0].innerText;
        let productImg = cartBox.getElementsByClassName("cart-img")[0].src;
        let quantity = parseInt(cartBox.getElementsByClassName("cart-quantity")[0].value);

        items.push({ title, price, productImg, quantity });
      }

      // Guardar carrito en localStorage (opcional)
      localStorage.setItem("cartItems", JSON.stringify(items));

      // Enviar datos al backend para Stripe Checkout
      fetch("/stripe-checkout", {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ items }),
      })
        .then((res) => res.json())
        .then((data) => {
          location.href = data.url; // redirige a Stripe Checkout
        })
        .catch((err) => console.log(err));
    });
  }
}

// ❌ Eliminar producto al hacer clic en el ícono de basura
function removeCartItem(event) {
  let buttonClicked = event.target;
  buttonClicked.parentElement.remove();
  updatetotal();
  saveCartItems();
}

// 🔢 Validar y actualizar cantidad de productos
function quantityChanged(event) {
  let input = event.target;
  if (isNaN(input.value) || input.value <= 0) {
    input.value = 1;
  }
  updatetotal();
  saveCartItems();
}

// ➕ Obtener datos del producto y agregarlo al carrito
function addCartClicked(event) {
  let button = event.target;
  let shopProducts = button.parentElement;
  let title = shopProducts.getElementsByClassName("product-title")[0].innerText;
  let price = shopProducts.getElementsByClassName("price")[0].innerText;
  let productImg = shopProducts.getElementsByClassName("product-img")[0].src;
  addProductToCart(title, price, productImg);
  updatetotal();
  saveCartItems();
}

// 📦 Crear y añadir el HTML del producto en el carrito
function addProductToCart(title, price, productImg) {
  let cartShopBox = document.createElement("div");
  cartShopBox.classList.add("cart-box");
  let cartItems = document.getElementsByClassName("cart-content")[0];
  let cartItemsNames = cartItems.getElementsByClassName("cart-product-title");

  // 🚫 Verificar si el producto ya fue añadido
  for (let i = 0; i < cartItemsNames.length; i++) {
    if (cartItemsNames[i].innerText == title) {
      alert("You have already added this item to cart.");
      return;
    }
  }

  // 🧱 Estructura HTML del producto en el carrito
  let cartBoxContent = `
    <img src="${productImg}" alt="" class="cart-img" />
    <div class="detail-box">
      <div class="cart-product-title">${title}</div>
      <div class="cart-price">${price}</div>
      <input type="number" value="1" class="cart-quantity" />
    </div>
    <i class="bx bx-trash-alt cart-remove"></i>`;

  cartShopBox.innerHTML = cartBoxContent;
  cartItems.append(cartShopBox);

  // 🎯 Añadir eventos al nuevo producto
  cartShopBox.getElementsByClassName("cart-remove")[0].addEventListener("click", removeCartItem);
  cartShopBox.getElementsByClassName("cart-quantity")[0].addEventListener("change", quantityChanged);
  saveCartItems();
}

// 💰 Calcular y actualizar el precio total del carrito
function updatetotal() {
  let cartContent = document.getElementsByClassName("cart-content")[0];
  let cartBoxes = cartContent.getElementsByClassName("cart-box");
  let total = 0;
  for (let i = 0; i < cartBoxes.length; i++) {
    let cartBox = cartBoxes[i];
    let priceElement = cartBox.getElementsByClassName("cart-price")[0];
    let quantityElement = cartBox.getElementsByClassName("cart-quantity")[0];
    let price = parseFloat(priceElement.innerText.replace("$", ""));
    let quantity = quantityElement.value;
    total += price * quantity;
  }
  total = Math.round(total * 100) / 100;

  // 💾 Mostrar el total y guardarlo en localStorage
  document.getElementsByClassName("total-price")[0].innerText = "$" + total;
  localStorage.setItem("cartTotal", total);
}

// 💾 Guardar los productos actuales del carrito en localStorage
function saveCartItems() {
  let cartContent = document.getElementsByClassName("cart-content")[0];
  let cartBoxes = cartContent.getElementsByClassName("cart-box");
  let cartItems = [];

  for (let i = 0; i < cartBoxes.length; i++) {
    let cartBox = cartBoxes[i];
    let titleElement = cartBox.getElementsByClassName("cart-product-title")[0];
    let priceElement = cartBox.getElementsByClassName("cart-price")[0];
    let quantityElement = cartBox.getElementsByClassName("cart-quantity")[0];
    let productImg = cartBox.getElementsByClassName("cart-img")[0].src;

    var item = {
      title: titleElement.innerText,
      price: priceElement.innerText,
      quantity: quantityElement.value,
      productImg: productImg,
    };
    cartItems.push(item);
  }

  // 🧠 Guardar en localStorage
  localStorage.setItem("cartItems", JSON.stringify(cartItems));
}

// 🔄 Cargar productos guardados desde localStorage al recargar la página
function loadCartItems() {
  let cartItems = localStorage.getItem("cartItems");
  if (cartItems) {
    cartItems = JSON.parse(cartItems);
    for (let i = 0; i < cartItems.length; i++) {
      let item = cartItems[i];
      addProductToCart(item.title, item.price, item.productImg);

      // 🔢 Asignar la cantidad guardada
      let cartBoxes = document.getElementsByClassName("cart-box");
      let cartBox = cartBoxes[cartBoxes.length - 1];
      let quantityElement = cartBox.getElementsByClassName("cart-quantity")[0];
      quantityElement.value = item.quantity;
    }
    // Actualizar total y guardar después de cargar todos los items y cantidades
    updatetotal();
    saveCartItems();
  }

  // 💰 Cargar total guardado
  let cartTotal = localStorage.getItem("cartTotal");
  if (cartTotal) {
    document.getElementsByClassName("total-price")[0].innerText = "$" + cartTotal;
  }
}