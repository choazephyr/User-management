function getUserMe() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "login.html";
    return null;
  }
  return user;
}

/** Optional: block wrong role from viewing the current page */
function requireRole(allowedRoles = []) {
  const user = getUserMe();
  if (!user) return null;

  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    // send them to their correct home page
    window.location.href = user.role === "admin" ? "./admin.html" : "../index.html";
    return null;
  }
  return user;
}

function getActiveKey(role) {
  const file = (location.pathname.split("/").pop() || "").toLowerCase();

  // per-role page -> active key mapping
  const mapByRole = {
    admin: {
      "admin.html": "dashboard",
      "admin_user.html": "users",
      "profile.html": "profile",
    },
    user: {
      "index.html": "dashboard",
      "profile.html": "profile",
    },
  };

  const map = mapByRole[role] || mapByRole.user;
  return map[file] || "";
}

function renderSidebar() {
  const userMe = getUserMe();
  if (!userMe) return;

  const role = (userMe.role || "user").toLowerCase();
  const active = getActiveKey(role);

  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;

  // Role-based menus
  const menus = {
    admin: [
      { key: "dashboard", href: "./admin.html", label: "Admin Dashboard", icon: "🛡️" },
      { key: "users", href: "./admin_user.html", label: "Manage Users", icon: "👥" },
      { key: "profile", href: "./profile.html", label: "Profile", icon: "🙋" },
    ],
    user: [
      { key: "profile", href: "./profile.html", label: "Profile", icon: "🙋" },
    ],
  };

  const menu = menus[role] || menus.user;

  sidebar.innerHTML = `
    <div class="sb">
      <div class="sb-top">
        <button class="sb-toggle" id="sbToggle" type="button" aria-label="Toggle sidebar">☰</button>
        <div class="sb-brand">My App</div>
      </div>

      <nav class="sb-nav">
        ${menu
          .map(
            (item) => `
          <a class="sb-link ${active === item.key ? "active" : ""}" href="${item.href}">
            ${item.icon} <span>${item.label}</span>
          </a>`
          )
          .join("")}
      </nav>

      <a class="sb-link sb-logout" id="logoutBtn" type="button" aria-label="Logout"> ➜]
          <span >Logout</span>
      </a>
    </div>
  `;

  // restore collapsed state
  const collapsed = localStorage.getItem("sidebarCollapsed") === "true";
  if (collapsed) document.body.classList.add("sb-collapsed");

  document.getElementById("sbToggle").addEventListener("click", () => {
      document.body.classList.toggle("sb-collapsed");
      localStorage.setItem("sidebarCollapsed", document.body.classList.contains("sb-collapsed"));
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem("user");
      window.location.href = "login.html";
  });
}

window.addEventListener("DOMContentLoaded", renderSidebar);
