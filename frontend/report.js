async function loadReports() {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const tbody = document.getElementById("reportBody");

  tbody.innerHTML = "";

  if (startDate && endDate && startDate > endDate) {
    alert("Start date cannot be after end date");
    return;
  }

  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const query = params.toString();
  const url = `http://localhost:5000/api/admin/reports${query ? `?${query}` : ""}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      alert("Failed to load reports");
      return;
    }

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5">No reports found</td></tr>`;
      return;
    }

    data.forEach(row => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${row.student_id}</td>
        <td>${row.full_name}</td>
        <td>${row.department}</td>
        <td>${row.meal_type}</td>
        <td>${new Date(row.scan_time).toLocaleString()}</td>
      `;

      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    alert("Server not reachable");
  }
}

function downloadReportPdf() {
  const rows = Array.from(document.querySelectorAll("#reportBody tr"));
  if (rows.length === 0 || rows[0].children.length === 1) {
    alert("No report data to download");
    return;
  }

  const tableData = rows.map((row) =>
    Array.from(row.children).map((cell) => cell.textContent.trim())
  );

  const startDate = document.getElementById("startDate").value || "All";
  const endDate = document.getElementById("endDate").value || "All";
  const title = "Meal Scan Reports";
  const subtitle = `Date Range: ${startDate} to ${endDate}`;

  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    alert("PDF library not loaded");
    return;
  }

  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(11);
  doc.text(subtitle, 14, 26);

  const headers = [["Student ID", "Name", "Department", "Meal Type", "Scan Time"]];
  if (typeof doc.autoTable === "function") {
    doc.autoTable({
      startY: 32,
      head: headers,
      body: tableData
    });
  } else {
    // Fallback: simple text table if autoTable isn't available
    let y = 34;
    doc.setFontSize(10);
    doc.text(headers[0].join(" | "), 14, y);
    y += 6;
    tableData.forEach((row) => {
      doc.text(row.join(" | "), 14, y);
      y += 6;
    });
  }

  doc.save("meal-reports.pdf");
}

// Load automatically when page opens
window.onload = loadReports;
