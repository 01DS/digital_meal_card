const LOGIN_PAGE = "login.html";

function redirectToLogin() {
  window.location.href = LOGIN_PAGE;
}

function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
}

function logout() {
  clearAuth();
  redirectToLogin();
}

function requireAuth() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || !role) {
    clearAuth();
    redirectToLogin();
    return false;
  }

  return true;
}

function requireRole(expectedRole) {
  if (!requireAuth()) return false;

  const role = localStorage.getItem("role");
  if (role !== expectedRole) {
    clearAuth();
    redirectToLogin();
    return false;
  }

  return true;
}

window.logout = logout;
window.requireAuth = requireAuth;
window.requireRole = requireRole;
