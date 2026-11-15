// UI route permissions for the StockFlow frontend demo.
// This only controls what the React UI displays. It is not backend security.

export const ROLE_PERMISSIONS = {
  Admin: [
    "dashboard",
    "orders",
    "products",
    "inventory",
    "stores",
    "dispatch",
    "users",
    "settings",
  ],

  Manager: [
    "dashboard",
    "orders",
    "products",
    "inventory",
    "stores",
    "dispatch",
  ],

  "Warehouse Staff": [
    "dashboard",
    "orders",
    "inventory",
    "dispatch",
  ],

  Viewer: [
    "dashboard",
    "orders",
    "products",
    "inventory",
    "stores",
    "dispatch",
  ],
};

export const ROLE_DESCRIPTIONS = {
  Admin: "Full access to all StockFlow modules and settings.",
  Manager: "Manage orders, products, inventory, stores and dispatch.",
  "Warehouse Staff": "Work with orders, inventory and dispatch operations.",
  Viewer: "View business information without management access.",
};

export function canAccessModule(role, module) {
  return ROLE_PERMISSIONS[role]?.includes(module) ?? false;
}
