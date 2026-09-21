const STORAGE_KEY = "meine-startseite-links";

let links = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let editingId = null;

function saveLinks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

function createId() {
  return Date.now().toString() + Math.random().toString(16).slice(2);
}

function createElement(tag, className, text = "") {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text) {
    element.textContent = text;
  }

  return element;
}

/*
|--------------------------------------------------------------------------
| Startseite
|--------------------------------------------------------------------------
*/

function renderHomeLinks() {
  const container = document.getElementById("links-container");

  if (!container) {
    return;
  }

  const searchInput = document.getElementById("search-input");
  const searchTerm = searchInput
    ? searchInput.value.toLowerCase().trim()
    : "";

  const filteredLinks = links.filter(link => {
    return (
      link.title.toLowerCase().includes(searchTerm) ||
      link.description.toLowerCase().includes(searchTerm) ||
      link.url.toLowerCase().includes(searchTerm)
    );
  });

  container.replaceChildren();

  if (filteredLinks.length === 0) {
    const message = createElement(
      "div",
      "empty-message",
      searchTerm
        ? "Keine passenden Links gefunden."
        : "Noch keine Links vorhanden. Füge auf der Verwaltungsseite einen Link hinzu."
    );

    container.appendChild(message);
    return;
  }

  filteredLinks.forEach(link => {
    const card = createElement("article", "link-card");

    const title = createElement("h3", "", link.title);
    const description = createElement("p", "", link.description);
    const url = createElement("div", "url", link.url);

    const openButton = createElement("a", "open-button", "Webseite öffnen");
    openButton.href = link.url;
    openButton.target = "_blank";
    openButton.rel = "noopener noreferrer";

    card.append(title, description, url, openButton);
    container.appendChild(card);
  });
}

/*
|--------------------------------------------------------------------------
| Verwaltungsseite
|--------------------------------------------------------------------------
*/

function renderManagementLinks() {
  const container = document.getElementById("management-links");

  if (!container) {
    return;
  }

  container.replaceChildren();

  if (links.length === 0) {
    const message = createElement(
      "div",
      "empty-message",
      "Es wurden noch keine Links angelegt."
    );

    container.appendChild(message);
    return;
  }

  links.forEach(link => {
    const item = createElement("div", "management-item");

    const info = createElement("div", "management-info");
    const title = createElement("h3", "", link.title);
    const description = createElement("p", "", link.description);

    info.append(title, description);

    const actions = createElement("div", "management-actions");

    const editButton = createElement(
      "button",
      "edit-button",
      "Bearbeiten"
    );

    editButton.addEventListener("click", () => {
      editLink(link.id);
    });

    const deleteButton = createElement(
      "button",
      "delete-button",
      "Löschen"
    );

    deleteButton.addEventListener("click", () => {
      deleteLink(link.id);
    });

    actions.append(editButton, deleteButton);
    item.append(info, actions);
    container.appendChild(item);
  });
}

function setupManagementForm() {
  const form = document.getElementById("link-form");

  if (!form) {
    return;
  }

  const titleInput = document.getElementById("link-title");
  const urlInput = document.getElementById("link-url");
  const descriptionInput = document.getElementById("link-description");
  const submitButton = document.getElementById("submit-button");
  const cancelButton = document.getElementById("cancel-button");
  const formTitle = document.getElementById("form-title");

  form.addEventListener("submit", event => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const url = urlInput.value.trim();
    const description = descriptionInput.value.trim();

    if (!title || !url || !description) {
      return;
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      alert("Bitte gib eine gültige URL mit http:// oder https:// ein.");
      return;
    }

    if (editingId) {
      const existingLink = links.find(link => link.id === editingId);

      if (existingLink) {
        existingLink.title = title;
        existingLink.url = url;
        existingLink.description = description;
      }

      editingId = null;
      submitButton.textContent = "Link hinzufügen";
      formTitle.textContent = "Neuen Link hinzufügen";
      cancelButton.hidden = true;
    } else {
      links.push({
        id: createId(),
        title,
        url,
        description
      });
    }

    saveLinks();
    form.reset();
    renderManagementLinks();
  });

  cancelButton.addEventListener("click", () => {
    editingId = null;
    form.reset();

    submitButton.textContent = "Link hinzufügen";
    formTitle.textContent = "Neuen Link hinzufügen";
    cancelButton.hidden = true;
  });
}

function editLink(id) {
  const link = links.find(item => item.id === id);

  if (!link) {
    return;
  }

  const titleInput = document.getElementById("link-title");
  const urlInput = document.getElementById("link-url");
  const descriptionInput = document.getElementById("link-description");
  const submitButton = document.getElementById("submit-button");
  const cancelButton = document.getElementById("cancel-button");
  const formTitle = document.getElementById("form-title");

  editingId = id;

  titleInput.value = link.title;
  urlInput.value = link.url;
  descriptionInput.value = link.description;

  submitButton.textContent = "Änderungen speichern";
  formTitle.textContent = "Link bearbeiten";
  cancelButton.hidden = false;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function deleteLink(id) {
  const confirmed = confirm(
    "Möchtest du diesen Link wirklich löschen?"
  );

  if (!confirmed) {
    return;
  }

  links = links.filter(link => link.id !== id);
  saveLinks();
  renderManagementLinks();
}

/*
|--------------------------------------------------------------------------
| Initialisierung
|--------------------------------------------------------------------------
*/

document.addEventListener("DOMContentLoaded", () => {
  renderHomeLinks();
  setupManagementForm();
  renderManagementLinks();

  const searchInput = document.getElementById("search-input");

  if (searchInput) {
    searchInput.addEventListener("input", renderHomeLinks);
  }
});
