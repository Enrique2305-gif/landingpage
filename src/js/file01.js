"use strict";
import { fetchProducts, fetchCategories } from "./functions.js";
import { saveVote, getVotes } from "./firebase.js";

const showToast = () => {
  const toast = document.getElementById("toast-interactive");
  if (toast) {
    toast.classList.add("md:block");
  }
};

const showVideo = () => {
  const demo = document.getElementById("demo");
  if (demo) {
    demo.addEventListener("click", () => {
      window.open("https://www.youtube.com/watch?v=tl6u2NASUzU", "_blank");
    });
  }
};

const renderProducts = () => {
  fetchProducts("https://data-dawm.github.io/datum/reseller/products.json")
    .then(result => {
      if (result.success === true) {
        // a) Referencia al contenedor
        const container = document.getElementById("products-container");
        container.innerHTML = "";

        // b) Obtener productos y limitar a 6
        const products = result.body.slice(0, 6);

        // c) Recorrer el arreglo de productos
        products.forEach(product => {
          let productHTML = `
            <div class="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
              <img
                class="w-full h-40 bg-gray-300 dark:bg-gray-700 rounded-lg object-cover transition-transform duration-300 hover:scale-[1.03]"
                src="[PRODUCT.IMGURL]" alt="[PRODUCT.TITLE]">
              <h3
                class="h-6 text-xl font-semibold tracking-tight text-gray-900 dark:text-white hover:text-black-600 dark:hover:text-white-400">
                $[PRODUCT.PRICE]
              </h3>
              <div class="h-5 rounded w-full">[PRODUCT.TITLE]</div>
              <div class="space-y-2">
                <a href="[PRODUCT.PRODUCTURL]" target="_blank" rel="noopener noreferrer"
                  class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 w-full inline-block">
                  Ver en Amazon
                </a>
                <div class="hidden"><span class="1">[PRODUCT.CATEGORY_ID]</span></div>
              </div>
            </div>`;

          // d) Reemplazar los marcadores
          productHTML = productHTML.replaceAll("[PRODUCT.IMGURL]", product.imgUrl);
          productHTML = productHTML.replaceAll(
            "[PRODUCT.TITLE]",
            product.title.length > 20 ? product.title.substring(0, 20) + "..." : product.title
          );
          productHTML = productHTML.replaceAll("[PRODUCT.PRICE]", product.price);
          productHTML = productHTML.replaceAll("[PRODUCT.PRODUCTURL]", product.productURL);
          productHTML = productHTML.replaceAll("[PRODUCT.CATEGORY_ID]", product.category_id);

          // e) Agregar al contenedor
          container.innerHTML += productHTML;
        });
      } else {
        // f) Si success es false, mostrar alerta
        alert(result.error);
      }
    })
    .catch(error => {
      console.error("Error al obtener los productos:", error);
    });
};

const renderCategories = async () => {
  try {
    const result = await fetchCategories(
      "https://data-dawm.github.io/datum/reseller/categories.xml"
    );

    if (result.success === true) {
      // a) Referencia al contenedor
      const container = document.getElementById("categories");
      container.innerHTML = `<option selected disabled>Seleccione una categoría</option>`;

      // b) Obtener contenido XML
      const categoriesXML = result.body;

      // c) Obtener todos los elementos <category>
      const categories = categoriesXML.getElementsByTagName("category");

      // d) Recorrer cada categoría
      for (let category of categories) {
        let categoryHTML = `<option value="[ID]">[NAME]</option>`;

        const id = category.getElementsByTagName("id")[0].textContent;
        const name = category.getElementsByTagName("name")[0].textContent;

        categoryHTML = categoryHTML.replaceAll("[ID]", id);
        categoryHTML = categoryHTML.replaceAll("[NAME]", name);

        // e) Agregar la opción al select
        container.innerHTML += categoryHTML;
      }
    } else {
      alert(result.error);
    }
  } catch (error) {
    alert("Error al cargar las categorías: " + error);
  }
};

const enableForm = () => {
  // Obtener referencia al formulario
  const form = document.getElementById('form_voting');

  // Asegurarse de que el formulario exista en el DOM
  if (!form) {
    console.error('No se encontró el formulario con id "form_voting".');
    return;
  }

  // Agregar listener al evento 'submit'
  form.addEventListener('submit', async (event) => {
    // Evitar comportamiento por defecto del formulario
    event.preventDefault();

    // Obtener valor del elemento select_product
    const selectProduct = document.getElementById('select_product');
    const value = selectProduct?.value;

    if (!value) {
      alert('Por favor seleccione un producto antes de enviar el voto.');
      return;
    }

    try {
      const result = await saveVote(value);

      if (result.status === "success") {
        alert(result.message); // muestra el mensaje correcto
        await displayVotes(); // actualizar la tabla automáticamente
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      alert(`Error al guardar el voto: ${error.message}`);
    }
  });
};

// Función para mostrar los votos en una tabla
const displayVotes = async () => {
  const resultsContainer = document.getElementById('results');
  if (!resultsContainer) return;

  try {
    const result = await getVotes();

    if (!result.success) {
      resultsContainer.innerHTML = `<p>${result.message}</p>`;
      return;
    }

    const votesData = result.data;

    // Contar votos por producto
    const votesCount = {};
    for (const key in votesData) {
      const vote = votesData[key];
      if (votesCount[vote.productID]) {
        votesCount[vote.productID]++;
      } else {
        votesCount[vote.productID] = 1;
      }
    }

    // Crear tabla HTML
    let tableHTML = `
<table border="1" cellpadding="5" cellspacing="0">
<thead>
<tr>
<th>Producto</th>
<th>Total de votos</th>
</tr>
</thead>
<tbody>
`;

    for (const productID in votesCount) {
      tableHTML += `
<tr>
<td>${productID}</td>
<td>${votesCount[productID]}</td>
</tr>
`;
    }

    tableHTML += `</tbody></table>`;

    resultsContainer.innerHTML = tableHTML;

  } catch (error) {
    resultsContainer.innerHTML = `<p>Error al obtener los votos: ${error.message}</p>`;
  }
};

(async () => {
  enableForm();
  await displayVotes();
})();

(() => {
  showToast();
  showVideo();
  renderProducts();
  renderCategories();
})();