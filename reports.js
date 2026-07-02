function generateReport() {
  const table = document.getElementById("reportTable");
  table.innerHTML = "";

  // Fake data (replace with backend later)
  const reports = [
    {
      student_id: "STU001",
      name: "Ali Ahmed",
      session: "Breakfast",
      date: "2025-01-12",
      time: "01:30",
      status: "Served"
    },
    {
      student_id: "STU002",
      name: "Sara Mohamed",
      session: "Lunch",
      date: "2025-01-12",
      time: "06:45",
      status: "Served"
    }
  ];

  reports.forEach(r => {
    const row = 
      <tr>
        <td>${r.student_id}</td>
        <td>${r.name}</td>
        <td>${r.session}</td>
        <td>${r.date}</td>
        <td>${r.time}</td>
        <td>${r.status}</td>
      </tr>
    ;
    table.innerHTML += row;
  });
}