const API_BASE = "http://127.0.0.1:5000/api/admin/users";
const tableBody = document.querySelector("#user-table tbody");
const message = document.getElementById("message");
const modal = document.getElementById("edit-modal");
const searchInput = document.getElementById("searchInput");

const newUsername = document.getElementById("new-username");
const newEmail = document.getElementById("new-email");
const newPassword = document.getElementById("new-password");
const newRole = document.getElementById("new-role");
const createBtn = document.getElementById("create-btn");

let usersCache = [];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showMessage(text, isSuccess = false) {
  message.style.color = isSuccess ? "#1EFFA0" : "#FF5C5C";
  message.textContent = text || "";
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

function showModal() {
  modal.classList.remove("hidden");
}

function hideModal() {
  modal.classList.add("hidden");
}

function resetCreateForm() {
  newUsername.value = "";
  newEmail.value = "";
  newPassword.value = "";
  newRole.value = "staff";
}

function setEditForm(user) {
  document.getElementById("edit-id").value = user.id;
  document.getElementById("edit-username").value = user.username || "";
  document.getElementById("edit-email").value = user.email || "";
  document.getElementById("edit-role").value = user.role || "staff";
  document.getElementById("edit-password").value = "";
}

function getEditFormData() {
  return {
    id: document.getElementById("edit-id").value,
    username: document.getElementById("edit-username").value.trim(),
    email: document.getElementById("edit-email").value.trim(),
    role: document.getElementById("edit-role").value,
    password: document.getElementById("edit-password").value
  };
}

async function loadUsers() {
  showMessage("");
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error("Failed to fetch users");
    const data = await res.json();
    usersCache = data.users || [];
    renderUsers(usersCache);
  } catch (err) {
    console.error(err);
    showMessage("Unable to load users");
  }
}

function renderUsers(list) {
  tableBody.innerHTML = "";
  if (!Array.isArray(list) || list.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6">No users found</td></tr>`;
    return;
  }

  list.forEach((user) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(user.id)}</td>
      <td>${escapeHtml(user.username)}</td>
      <td>${escapeHtml(user.email)}</td>
      <td>${escapeHtml(user.role)}</td>
      <td>${escapeHtml(formatDate(user.created_at))}</td>
      <td class="actions-cell">
        <button class="edit-btn" type="button" data-id="${escapeHtml(user.id)}">Edit</button>
        <button class="delete-btn" type="button" data-id="${escapeHtml(user.id)}">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function applySearchFilter() {
  const query = (searchInput?.value || "").trim().toLowerCase();
  if (!query) {
    renderUsers(usersCache);
    return;
  }

  const filtered = usersCache.filter((user) => {
    const username = String(user.username || "").toLowerCase();
    const email = String(user.email || "").toLowerCase();
    const role = String(user.role || "").toLowerCase();
    return username.includes(query) || email.includes(query) || role.includes(query);
  });

  renderUsers(filtered);
}

async function createUser() {
  showMessage("");
  const payload = {
    username: newUsername.value.trim(),
    email: newEmail.value.trim(),
    password: newPassword.value,
    role: newRole.value
  };

  if (!payload.username || !payload.email || !payload.password || !payload.role) {
    showMessage("Please fill in all fields");
    return;
  }

  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!res.ok) {
      showMessage(data.message || "Failed to create user");
      return;
    }

    resetCreateForm();
    await loadUsers();
    showMessage("User created successfully", true);
  } catch (err) {
    console.error(err);
    showMessage("Unable to create user");
  }
}

async function openEditModal(userId) {
  showMessage("");
  const user = usersCache.find((item) => String(item.id) === String(userId));
  if (!user) {
    showMessage("User not found");
    return;
  }
  setEditForm(user);
  showModal();
}

async function saveUserUpdate() {
  showMessage("");
  const payload = getEditFormData();

  if (!payload.username || !payload.email || !payload.role) {
    showMessage("Username, email, and role are required");
    return;
  }

  const body = {
    username: payload.username,
    email: payload.email,
    role: payload.role
  };

  if (payload.password && payload.password.trim()) {
    body.password = payload.password;
  }

  try {
    const res = await fetch(`${API_BASE}/${payload.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await res.json();

    if (!res.ok) {
      showMessage(data.message || "Failed to update user");
      return;
    }

    hideModal();
    await loadUsers();
    showMessage("User updated successfully", true);
  } catch (err) {
    console.error(err);
    showMessage("Unable to update user");
  }
}

async function deleteUser(userId) {
  showMessage("");
  const user = usersCache.find((item) => String(item.id) === String(userId));
  const label = user?.username ? ` ${user.username}` : "";
  if (!window.confirm(`Delete user${label}?`)) return;

  try {
    const res = await fetch(`${API_BASE}/${userId}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      showMessage(data.message || "Failed to delete user");
      return;
    }
    await loadUsers();
    showMessage("User deleted successfully", true);
  } catch (err) {
    console.error(err);
    showMessage("Unable to delete user");
  }
}

tableBody.addEventListener("click", (event) => {
  const target = event.target;
  if (target.classList.contains("edit-btn")) {
    openEditModal(target.dataset.id);
  }
  if (target.classList.contains("delete-btn")) {
    deleteUser(target.dataset.id);
  }
});

document.getElementById("save-btn").addEventListener("click", saveUserUpdate);
document.getElementById("cancel-btn").addEventListener("click", hideModal);
createBtn.addEventListener("click", createUser);

if (searchInput) {
  searchInput.addEventListener("input", applySearchFilter);
}

window.addEventListener("DOMContentLoaded", loadUsers);
