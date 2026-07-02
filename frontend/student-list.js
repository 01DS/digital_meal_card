const API_BASE = "http://127.0.0.1:5000/api/students";
const tableBody = document.querySelector("#student-table tbody");
const error = document.getElementById("error");
const modal = document.getElementById("edit-modal");
const searchInput = document.getElementById("searchInput");
let studentsCache = [];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showModal() {
  modal.classList.remove("hidden");
}

function hideModal() {
  modal.classList.add("hidden");
}

function setFormData(student) {
  document.getElementById("edit-id").value = student.id;
  document.getElementById("edit-student-id").value = student.student_id || "";
  document.getElementById("edit-full-name").value = student.full_name || "";
  document.getElementById("edit-department").value = student.department || "";
  document.getElementById("edit-program").value = student.program || "";
  document.getElementById("edit-status").value = student.cafeteria_status || "cafeteria";
  document.getElementById("edit-year").value = student.year || "";
  document.getElementById("edit-gender").value = student.gender || "";
  document.getElementById("edit-phone").value = student.phone || "";
  document.getElementById("edit-email").value = student.email || "";
}

function getFormData() {
  return {
    id: document.getElementById("edit-id").value,
    student_id: document.getElementById("edit-student-id").value.trim().toUpperCase(),
    full_name: document.getElementById("edit-full-name").value.trim(),
    department: document.getElementById("edit-department").value.trim(),
    program: document.getElementById("edit-program").value.trim(),
    cafeteria_status: document.getElementById("edit-status").value,
    year: document.getElementById("edit-year").value.trim(),
    gender: document.getElementById("edit-gender").value,
    phone: document.getElementById("edit-phone").value.trim().replace(/\D/g, ""),
    email: document.getElementById("edit-email").value.trim()
  };
}

async function loadStudents() {
  error.style.color = "#FF5C5C";
  error.textContent = "";

  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error("Failed to fetch students");

    const data = await res.json();
    studentsCache = data.students || [];
    renderStudents(studentsCache);
  } catch (err) {
    console.error(err);
    error.textContent = "Unable to load students";
  }
}

function renderStudents(list) {
  tableBody.innerHTML = "";

  if (!Array.isArray(list) || list.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="11">No students found</td></tr>`;
    return;
  }

  list.forEach((student) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(student.id)}</td>
      <td>${escapeHtml(student.student_id)}</td>
      <td>${escapeHtml(student.full_name)}</td>
      <td>${escapeHtml(student.department)}</td>
      <td>${escapeHtml(student.program)}</td>
      <td>${escapeHtml(student.cafeteria_status)}</td>
      <td>${escapeHtml(student.year)}</td>
      <td>${escapeHtml(student.gender)}</td>
      <td>${escapeHtml(student.phone)}</td>
      <td>${escapeHtml(student.email)}</td>
      <td class="actions-cell">
        <button class="edit-btn" type="button" data-id="${escapeHtml(student.id)}">Edit</button>
        <button class="qr-btn" type="button" data-id="${escapeHtml(student.id)}">Regenerate QR</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function applySearchFilter() {
  const query = (searchInput?.value || "").trim().toLowerCase();
  if (!query) {
    renderStudents(studentsCache);
    return;
  }

  const filtered = studentsCache.filter((student) => {
    const id = String(student.student_id || "").toLowerCase();
    const name = String(student.full_name || "").toLowerCase();
    return id.includes(query) || name.includes(query);
  });

  renderStudents(filtered);
}

async function openEditModal(studentId) {
  error.style.color = "#FF5C5C";
  error.textContent = "";
  const student = studentsCache.find((item) => String(item.id) === String(studentId));

  if (!student) {
    error.textContent = "Student not found";
    return;
  }

  setFormData(student);
  showModal();
}

async function saveStudentUpdate() {
  error.textContent = "";
  const payload = getFormData();

  if (!payload.student_id || !payload.full_name || !payload.department || !payload.program || !payload.year) {
    error.textContent = "Please fill in all required fields";
    return;
  }

  if (!/^EU\d{4}$/.test(payload.student_id)) {
    error.textContent = "Student ID must be in the format EU1234";
    return;
  }

  if (payload.phone && payload.phone.length !== 10) {
    error.textContent = "Phone number must be exactly 10 digits";
    return;
  }

  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    error.textContent = "Please enter a valid email address";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/${payload.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      error.textContent = data.message || "Failed to update student";
      return;
    }

    hideModal();
    await loadStudents();
    error.style.color = "#1EFFA0";
    error.textContent = "Student updated successfully";
  } catch (err) {
    console.error(err);
    error.style.color = "#FF5C5C";
    error.textContent = "Unable to update student";
  }
}

async function regenerateQr(studentId) {
  error.textContent = "";
  error.style.color = "#FF5C5C";

  try {
    const res = await fetch(`${API_BASE}/${studentId}/regenerate`, {
      method: "POST"
    });
    const raw = await res.text();
    let data = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = {};
    }

    if (!res.ok) {
      error.textContent = data.message || raw || "Failed to regenerate QR code";
      return;
    }

    error.style.color = "#1EFFA0";
    error.textContent = data.message || "QR code regenerated successfully";

    if (data.mealCard?.qrImage) {
      const popup = window.open("", "_blank", "width=420,height=520");
      if (popup) {
        popup.document.write(`
          <html>
            <head><title>QR Code</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
              <h3>New QR Code</h3>
              <p>${data.student?.full_name || ""}</p>
              <img src="${data.mealCard.qrImage}" alt="QR Code" style="width:220px;height:220px;" />
              <div style="margin-top: 16px;">
                <button onclick="window.print()">Print</button>
              </div>
            </body>
          </html>
        `);
        popup.document.close();
      }
    }
  } catch (err) {
    console.error(err);
    error.textContent = err?.message || "Unable to regenerate QR code";
  }
}

tableBody.addEventListener("click", (event) => {
  const target = event.target;
  if (target.classList.contains("edit-btn")) {
    openEditModal(target.dataset.id);
  }
  if (target.classList.contains("qr-btn")) {
    regenerateQr(target.dataset.id);
  }
});

document.getElementById("save-btn").addEventListener("click", saveStudentUpdate);
document.getElementById("cancel-btn").addEventListener("click", hideModal);
if (searchInput) {
  searchInput.addEventListener("input", applySearchFilter);
}

window.addEventListener("DOMContentLoaded", loadStudents);
