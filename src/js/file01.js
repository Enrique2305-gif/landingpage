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

const renderProducts = (selectedCategory = null) => {
  fetchProducts("src/ecoproducts.json")
    .then(result => {
      if (result.success === true) {
        const container = document.getElementById("products-container");
        container.innerHTML = "";

        let products = result.body;

        // ✅ Filtrar por categoría si se seleccionó una
        if (selectedCategory && selectedCategory !== "all") {
          products = products.filter(product => product.category_id === selectedCategory);
        }

        // Limitar a 6 productos (opcional)
        const limitedProducts = products.slice(0, 6);

        // Mostrar productos
        limitedProducts.forEach(product => {
          let productHTML = `
          <div class="flex flex-col justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl shadow hover:scale-[1.02] transition h-full">
            <div>
              <img class="w-full h-40 object-cover rounded-lg" src="${product.imgUrl}" alt="${product.title}">
              <h3 class="mt-3 text-lg font-bold text-green-700 dark:text-green-400 min-h-[3rem]">${product.title}</h3>
              <p class="text-gray-700 dark:text-gray-300">$${product.price}</p>
            </div>
            <a href="${product.productURL}" target="_blank" class="mt-4 block bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 text-center">
              Ver producto
            </a>
          </div>
        `;
          container.innerHTML += productHTML;
        });

        // Si no hay productos en la categoría
        if (limitedProducts.length === 0) {
          container.innerHTML = `<p class="text-center text-gray-500">No hay productos en esta categoría.</p>`;
        }

      } else {
        alert(result.error);
      }
    })
    .catch(error => {
      console.error("Error al obtener los productos:", error);
    });
};

document.addEventListener("DOMContentLoaded", () => {
  const categorySelect = document.getElementById("categories");
  if (categorySelect) {
    categorySelect.addEventListener("change", (event) => {
      const selectedValue = event.target.value;
      renderProducts(selectedValue); // filtra productos por categoría seleccionada
    });
  }
});

const renderCategories = async () => {
  try {
    const result = await fetchCategories(
      "src/ecocategories.xml"
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