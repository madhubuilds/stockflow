// FRONTEND DEMO ONLY.
// These credentials are visible in the browser bundle and are NOT secure.
// Replace this file with a backend authentication API before production.

export const demoUsers = [
  {
    id: "USR-001",
    name: "StockFlow Admin",
    email: "admin@stockflow.demo",
    password: "Admin@123",
    role: "Admin",
    status: "Active",
  },
  {
    id: "USR-002",
    name: "Warehouse Manager",
    email: "manager@stockflow.demo",
    password: "Manager@123",
    role: "Manager",
    status: "Active",
  },
  {
    id: "USR-003",
    name: "Warehouse Staff",
    email: "staff@stockflow.demo",
    password: "Staff@123",
    role: "Warehouse Staff",
    status: "Active",
  },
  {
    id: "USR-004",
    name: "StockFlow Viewer",
    email: "viewer@stockflow.demo",
    password: "Viewer@123",
    role: "Viewer",
    status: "Active",
  },
];

export const demoCredentials = demoUsers.map(({ email, password, role }) => ({
  email,
  password,
  role,
}));
