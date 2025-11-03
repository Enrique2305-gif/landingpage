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
  const form = document.getElementById("form_voting");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const select = document.getElementById("select_product");
    const productID = select.value;

    try {
      const result = await saveVote(productID);
      alert(result.message);
    } catch (error) {
      alert("Error al guardar el voto: " + error);
    }
  });
};

const displayVotes = async () => {
  const container = document.getElementById("results");
  container.innerHTML = "<p>Cargando votos...</p>";

  try {
    const result = await getVotes();

    if (result.status === true) {
      const votesData = result.data;

      // Contar votos por producto
      const voteCount = {};
      for (const key in votesData) {
        const productID = votesData[key].productID;
        if (!voteCount[productID]) {
          voteCount[productID] = 0;
        }
        voteCount[productID]++;
      }

      // Crear la tabla
      let tableHTML = `
        <table class="min-w-full border border-gray-300 bg-white dark:bg-gray-800 rounded-lg">
          <thead class="bg-gray-200 dark:bg-gray-700">
            <tr>
              <th class="py-2 px-4 text-left">Producto</th>
              <th class="py-2 px-4 text-left">Total de Votos</th>
            </tr>
          </thead>
          <tbody>
      `;

      for (const productID in voteCount) {
        tableHTML += `
          <tr class="border-t border-gray-300">
            <td class="py-2 px-4">${productID}</td>
            <td class="py-2 px-4">${voteCount[productID]}</td>
          </tr>
        `;
      }

      tableHTML += `
          </tbody>
        </table>
      `;

      // Insertar tabla en el contenedor
      container.innerHTML = tableHTML;
    } else {
      container.innerHTML = `<p>${result.message}</p>`;
    }
  } catch (error) {
    container.innerHTML = `<p>Error al mostrar los votos: ${error}</p>`;
  }
};

(() => {
    showToast();
    showVideo();
    renderProducts();
    renderCategories();
    enableForm();
    displayVotes();
})();