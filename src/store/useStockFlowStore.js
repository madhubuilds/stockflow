import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { mockProducts } from "../data/mockProducts";
import { mockInventory } from "../data/mockInventory";
import { mockOrders } from "../data/mockOrders";
import { mockOrderItems } from "../data/mockOrderItems";
import { mockDispatches } from "../data/mockDispatches";
import { mockStores } from "../data/mockStores";
import { mockUsers } from "../data/mockUsers";
import { defaultSettings } from "../data/defaultSettings";
const createId = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const getToday = () => {
  return new Date().toISOString().slice(0, 10);
};

const getOrderItems = (orderId) => mockOrderItems[orderId] || [];

export const useStockFlowStore = create(
  persist(
    (set, get) => ({
      products: mockProducts,
      inventory: mockInventory,
      orders: mockOrders,
      adjustmentHistory: [],

      // orderId -> { sku -> reserved quantity }
      reservations: {},

      // orderId -> approval and warehouse workflow information
      orderWorkflows: {},

      // Existing demo dispatches plus newly created dispatches
      dispatches: mockDispatches,
      stores: mockStores,
      users: mockUsers,
      currentRole: "Admin",
      settings: defaultSettings,
      // Calculate stock available to an order.
      // excludeOrderId prevents an order from counting its own reservation
      // against itself when displaying its approved quantities.
      getAvailableStock: (sku, excludeOrderId = null) => {
        const state = get();

        const inventoryItem = state.inventory.find((item) => item.sku === sku);

        if (!inventoryItem) return 0;

        const reservedByOtherOrders = Object.entries(state.reservations).reduce(
          (total, [orderId, orderReservations]) => {
            if (orderId === excludeOrderId) return total;

            return total + (orderReservations[sku] || 0);
          },
          0,
        );

        return Math.max(0, inventoryItem.stock - reservedByOtherOrders);
      },
      saveStore: (storeData) => {
        const { stores } = get();

        const normalizedName = storeData.name.trim().toLowerCase();

        const duplicate = stores.find(
          (store) =>
            store.name.trim().toLowerCase() === normalizedName &&
            store.id !== storeData.id,
        );

        if (duplicate) {
          return {
            success: false,
            error: "A store with this name already exists.",
          };
        }

        if (storeData.id) {
          set((state) => ({
            stores: state.stores.map((store) =>
              store.id === storeData.id ? { ...store, ...storeData } : store,
            ),
          }));

          return { success: true };
        }

        const newStore = {
          ...storeData,
          id: `STORE-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          stores: [...state.stores, newStore],
        }));

        return { success: true };
      },

      toggleStoreStatus: (storeId) => {
        set((state) => ({
          stores: state.stores.map((store) =>
            store.id === storeId
              ? {
                  ...store,
                  status: store.status === "Active" ? "Inactive" : "Active",
                }
              : store,
          ),
        }));
      },
      isSkuAvailable: (sku, currentProductId = null) => {
        const normalizedSku = sku.trim().toLowerCase();

        return !get().products.some(
          (product) =>
            product.id !== currentProductId &&
            product.variants.some(
              (variant) => variant.sku.trim().toLowerCase() === normalizedSku,
            ),
        );
      },

      saveProduct: (productData) => {
        const { products, inventory } = get();

        const skus = productData.variants.map((variant) =>
          variant.sku.trim().toLowerCase(),
        );

        if (new Set(skus).size !== skus.length) {
          return {
            success: false,
            error: "A product cannot contain duplicate SKUs.",
          };
        }

        const duplicateSku = productData.variants.find((variant) =>
          products.some(
            (product) =>
              product.id !== productData.id &&
              product.variants.some(
                (existing) =>
                  existing.sku.trim().toLowerCase() ===
                  variant.sku.trim().toLowerCase(),
              ),
          ),
        );

        if (duplicateSku) {
          return {
            success: false,
            error: `SKU "${duplicateSku.sku}" is already used by another product.`,
          };
        }

        const savedProduct = {
          ...productData,
          id: productData.id || `PROD-${createId()}`,
        };

        const exists = products.some(
          (product) => product.id === savedProduct.id,
        );

        const updatedProducts = exists
          ? products.map((product) =>
              product.id === savedProduct.id ? savedProduct : product,
            )
          : [savedProduct, ...products];

        const updatedInventory = [...inventory];

        savedProduct.variants.forEach((variant) => {
          const existingIndex = updatedInventory.findIndex(
            (item) =>
              item.sku.trim().toLowerCase() ===
              variant.sku.trim().toLowerCase(),
          );

          const inventoryData = {
            name: savedProduct.name,
            category: savedProduct.category,
            sku: variant.sku,
            color: variant.color,
            size: variant.size,
          };

          if (existingIndex >= 0) {
            updatedInventory[existingIndex] = {
              ...updatedInventory[existingIndex],
              ...inventoryData,
            };
          } else {
            updatedInventory.push({
              id: `SKU-${createId()}`,
              ...inventoryData,
              stock: 0,
              threshold: 10,
            });
          }
        });

        set({
          products: updatedProducts,
          inventory: updatedInventory,
        });

        return { success: true };
      },

      deleteProduct: (productId) => {
        set((state) => ({
          products: state.products.filter(
            (product) => product.id !== productId,
          ),
        }));
      },

      adjustStock: (inventoryId, newStock, reason = "Manual adjustment") => {
        const state = get();

        const item = state.inventory.find((entry) => entry.id === inventoryId);

        if (!item) {
          return {
            success: false,
            error: "Inventory item not found.",
          };
        }

        const quantity = Number(newStock);

        if (!Number.isInteger(quantity) || quantity < 0) {
          return {
            success: false,
            error: "Stock must be a non-negative whole number.",
          };
        }

        const totalReserved = Object.values(state.reservations).reduce(
          (total, reservation) => total + (reservation[item.sku] || 0),
          0,
        );

        if (quantity < totalReserved) {
          return {
            success: false,
            error: `Cannot reduce stock below ${totalReserved} units because that quantity is reserved for orders.`,
          };
        }

        if (quantity === item.stock) {
          return { success: true, unchanged: true };
        }

        const historyEntry = {
          id: `ADJ-${createId()}`,
          inventoryId,
          name: item.name,
          sku: item.sku,
          previousStock: item.stock,
          newStock: quantity,
          difference: quantity - item.stock,
          reason,
          date: new Date().toISOString(),
        };

        set((current) => ({
          inventory: current.inventory.map((entry) =>
            entry.id === inventoryId ? { ...entry, stock: quantity } : entry,
          ),
          adjustmentHistory: [historyEntry, ...current.adjustmentHistory],
        }));

        return { success: true };
      },

      // APPROVAL: validate quantities and reserve stock.
      approveOrder: (orderId, approvedQuantities) => {
        const state = get();

        const order = state.orders.find((item) => item.id === orderId);

        if (!order) {
          return { success: false, error: "Order not found." };
        }

        if (order.status !== "Pending") {
          return {
            success: false,
            error: "Only pending orders can be approved.",
          };
        }

        if (state.orderWorkflows[orderId]?.approvedAt) {
          return {
            success: false,
            error: "This order has already been approved.",
          };
        }

        const items = getOrderItems(orderId);

        if (items.length === 0) {
          return {
            success: false,
            error: "No order items were found.",
          };
        }

        const reservations = {};
        let totalApproved = 0;

        for (const item of items) {
          const quantity = Number(approvedQuantities[item.id] || 0);

          if (
            !Number.isInteger(quantity) ||
            quantity < 0 ||
            quantity > item.requestedQty
          ) {
            return {
              success: false,
              error: `Invalid approved quantity for ${item.product}.`,
            };
          }

          if (quantity > 0) {
            reservations[item.sku] = (reservations[item.sku] || 0) + quantity;
          }

          totalApproved += quantity;
        }

        // Validate aggregated quantities per SKU. This prevents duplicate
        // order lines for the same SKU from reserving more stock than exists.
        for (const [sku, quantity] of Object.entries(reservations)) {
          const available = get().getAvailableStock(sku);
          if (quantity > available) {
            return {
              success: false,
              error: `Only ${available} units of ${sku} are available. Stock may have changed.`,
            };
          }
        }

        if (totalApproved === 0) {
          return {
            success: false,
            error: "Approve at least one unit.",
          };
        }

        const now = new Date().toISOString();

        set((current) => ({
          reservations: {
            ...current.reservations,
            [orderId]: reservations,
          },

          orderWorkflows: {
            ...current.orderWorkflows,
            [orderId]: {
              approvedQuantities: { ...approvedQuantities },
              approvedAt: now,
              processingStatus: "Not Started",
              dispatchStatus: "Not Dispatched",
              pickingStartedAt: null,
              packedAt: null,
              dispatchedAt: null,
              cancelledAt: null,
            },
          },

          orders: current.orders.map((item) =>
            item.id === orderId ? { ...item, status: "Approved" } : item,
          ),
        }));

        return {
          success: true,
          partial:
            totalApproved <
            items.reduce((sum, item) => sum + item.requestedQty, 0),
        };
      },

      // WAREHOUSE: start picking.
      startPicking: (orderId) => {
        const state = get();
        const workflow = state.orderWorkflows[orderId];

        if (!workflow?.approvedAt) {
          return {
            success: false,
            error: "Approve the order before starting picking.",
          };
        }

        if (workflow.processingStatus !== "Not Started") {
          return {
            success: false,
            error: "Picking has already started or been completed.",
          };
        }

        if (!state.reservations[orderId]) {
          return {
            success: false,
            error: "No stock reservation exists for this order.",
          };
        }

        const now = new Date().toISOString();

        set((current) => ({
          orderWorkflows: {
            ...current.orderWorkflows,
            [orderId]: {
              ...current.orderWorkflows[orderId],
              processingStatus: "Picking",
              pickingStartedAt: now,
            },
          },

          orders: current.orders.map((order) =>
            order.id === orderId ? { ...order, status: "Processing" } : order,
          ),
        }));

        return { success: true };
      },

      // WAREHOUSE: complete packing.
      completePacking: (orderId) => {
        const workflow = get().orderWorkflows[orderId];

        if (workflow?.processingStatus !== "Picking") {
          return {
            success: false,
            error: "Start picking before completing packing.",
          };
        }

        set((state) => ({
          orderWorkflows: {
            ...state.orderWorkflows,
            [orderId]: {
              ...state.orderWorkflows[orderId],
              processingStatus: "Packed",
              packedAt: new Date().toISOString(),
            },
          },
        }));

        return { success: true };
      },

      // DISPATCH: deduct reserved stock exactly once.
      dispatchOrder: (orderId) => {
        const state = get();
        const workflow = state.orderWorkflows[orderId];
        const order = state.orders.find((item) => item.id === orderId);

        if (!order || !workflow) {
          return {
            success: false,
            error: "Order workflow not found.",
          };
        }

        if (order.status === "Dispatched" || workflow.dispatchedAt) {
          return {
            success: false,
            error: "This order has already been dispatched.",
          };
        }

        if (workflow.processingStatus !== "Packed") {
          return {
            success: false,
            error: "Complete packing before dispatch.",
          };
        }

        const reservation = state.reservations[orderId];

        if (!reservation) {
          return {
            success: false,
            error: "No stock reservation exists for this order.",
          };
        }

        // Validate every SKU before changing any inventory.
        for (const [sku, quantity] of Object.entries(reservation)) {
          const inventoryItem = state.inventory.find(
            (item) => item.sku === sku,
          );

          if (!inventoryItem || inventoryItem.stock < quantity) {
            return {
              success: false,
              error: `Insufficient physical stock for ${sku}. Dispatch cancelled.`,
            };
          }
        }

        const now = new Date().toISOString();
        const dispatchId = `DSP-${createId()}`;

        const dispatchedUnits = Object.values(reservation).reduce(
          (total, quantity) => total + quantity,
          0,
        );

        const dispatchRecord = {
          id: dispatchId,
          orderId,
          store: order.store,
          location: order.location,
          date: getToday(),
          items: dispatchedUnits,
          status: "Dispatched",
        };

        set((current) => ({
          inventory: current.inventory.map((item) => {
            const quantity = reservation[item.sku] || 0;

            return quantity > 0
              ? { ...item, stock: item.stock - quantity }
              : item;
          }),

          reservations: Object.fromEntries(
            Object.entries(current.reservations).filter(
              ([id]) => id !== orderId,
            ),
          ),

          orderWorkflows: {
            ...current.orderWorkflows,
            [orderId]: {
              ...current.orderWorkflows[orderId],
              processingStatus: "Packed",
              dispatchStatus: "Dispatched",
              dispatchedAt: now,
              dispatchId,
            },
          },

          orders: current.orders.map((item) =>
            item.id === orderId ? { ...item, status: "Dispatched" } : item,
          ),

          dispatches: [dispatchRecord, ...current.dispatches],
        }));

        return {
          success: true,
          dispatch: dispatchRecord,
        };
      },

      // CANCEL: release reservations without deducting stock.
      cancelOrder: (orderId) => {
        const state = get();

        const order = state.orders.find((item) => item.id === orderId);

        if (!order) {
          return { success: false, error: "Order not found." };
        }

        if (!["Pending", "Approved"].includes(order.status)) {
          return {
            success: false,
            error: "Only pending or approved orders can be cancelled.",
          };
        }

        if (order.status === "Dispatched") {
          return {
            success: false,
            error: "A dispatched order cannot be cancelled.",
          };
        }

        const now = new Date().toISOString();

        set((current) => {
          const nextReservations = { ...current.reservations };
          delete nextReservations[orderId];

          return {
            reservations: nextReservations,

            orderWorkflows: {
              ...current.orderWorkflows,
              [orderId]: {
                ...current.orderWorkflows[orderId],
                processingStatus: "Cancelled",
                dispatchStatus: "Cancelled",
                cancelledAt: now,
              },
            },

            orders: current.orders.map((item) =>
              item.id === orderId ? { ...item, status: "Cancelled" } : item,
            ),
          };
        });

        return { success: true };
      },

      // Kept for compatibility with older components.
      // Prefer the dedicated workflow actions above.
      updateOrderStatus: (orderId, status) => {
        const allowedStatuses = [
          "Pending",
          "Approved",
          "Processing",
          "Dispatched",
          "Cancelled",
        ];

        if (!allowedStatuses.includes(status)) {
          return {
            success: false,
            error: "Invalid order status.",
          };
        }

        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, status } : order,
          ),
        }));

        return { success: true };
      },

      // USERS & ACCESS (demo only; not a security boundary)
      setCurrentRole: (role) => {
        const allowedRoles = ["Admin", "Manager", "Warehouse Staff", "Viewer"];
        if (!allowedRoles.includes(role)) {
          return { success: false, error: "Invalid role." };
        }
        set({ currentRole: role });
        return { success: true };
      },

      saveUser: (userData) => {
        const { users } = get();
        const email = String(userData.email || "").trim().toLowerCase();

        if (!userData.name?.trim()) {
          return { success: false, error: "Name is required." };
        }
        if (!email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
          return { success: false, error: "Enter a valid email address." };
        }
        if (!["Admin", "Manager", "Warehouse Staff", "Viewer"].includes(userData.role)) {
          return { success: false, error: "Select a valid role." };
        }

        const duplicate = users.find(
          (user) => user.email?.trim().toLowerCase() === email && user.id !== userData.id
        );
        if (duplicate) {
          return { success: false, error: "A user with this email already exists." };
        }

        if (userData.id) {
          set((state) => ({
            users: state.users.map((user) =>
              user.id === userData.id
                ? { ...user, ...userData, email }
                : user
            ),
          }));
        } else {
          set((state) => ({
            users: [
              {
                ...userData,
                id: `USR-${createId()}`,
                email,
                status: userData.status || "Active",
                createdAt: new Date().toISOString(),
              },
              ...state.users,
            ],
          }));
        }

        return { success: true };
      },

      toggleUserStatus: (userId) => {
        const user = get().users.find((item) => item.id === userId);
        if (!user) return { success: false, error: "User not found." };
        if (user.role === "Admin" && user.status === "Active") {
          const activeAdmins = get().users.filter(
            (item) => item.role === "Admin" && item.status === "Active"
          );
          if (activeAdmins.length <= 1) {
            return { success: false, error: "At least one active Admin must remain." };
          }
        }

        set((state) => ({
          users: state.users.map((item) =>
            item.id === userId
              ? { ...item, status: item.status === "Active" ? "Inactive" : "Active" }
              : item
          ),
        }));
        return { success: true };
      },

      updateSettings: (updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ...updates,
            business: { ...state.settings.business, ...(updates.business || {}) },
            inventory: { ...state.settings.inventory, ...(updates.inventory || {}) },
            orders: { ...state.settings.orders, ...(updates.orders || {}) },
            dispatch: { ...state.settings.dispatch, ...(updates.dispatch || {}) },
            preferences: { ...state.settings.preferences, ...(updates.preferences || {}) },
          },
        }));
        return { success: true };
      },

      resetDemoData: () => {
        set({
          products: mockProducts,
          inventory: mockInventory,
          orders: mockOrders,
          stores: mockStores,
          users: mockUsers,
          currentRole: "Admin",
          settings: defaultSettings,
          adjustmentHistory: [],
          reservations: {},
          orderWorkflows: {},
          dispatches: mockDispatches,
        });
      },
    }),
    {
      name: "stockflow-demo-store",
      storage: createJSONStorage(() => localStorage),
      version: 3,

      migrate: (persistedState) => ({
        ...persistedState,
        reservations: persistedState?.reservations || {},
        orderWorkflows: persistedState?.orderWorkflows || {},
        dispatches: persistedState?.dispatches || mockDispatches,
        adjustmentHistory: persistedState?.adjustmentHistory || [],
        stores: persistedState?.stores || mockStores,
        users: persistedState?.users || mockUsers,
        currentRole: persistedState?.currentRole || "Admin",
        settings: persistedState?.settings || defaultSettings,
      }),

      partialize: (state) => ({
        products: state.products,
        inventory: state.inventory,
        orders: state.orders,
        stores: state.stores || mockStores,
        users: state.users || mockUsers,
        currentRole: state.currentRole || "Admin",
        settings: state.settings || defaultSettings,
        adjustmentHistory: state.adjustmentHistory,
        reservations: state.reservations,
        orderWorkflows: state.orderWorkflows,
        dispatches: state.dispatches,
      }),
    },
  ),
);
