import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Store,
  MapPin,
  Phone,
  ShoppingBag,
  Pencil,
  Power,
  X,
} from "lucide-react";

import { useStockFlowStore } from "../../store/useStockFlowStore";
import StoreModal from "../../components/stores/StoreModal";

export default function Stores() {
  const stores = useStockFlowStore((state) => state.stores);
  const orders = useStockFlowStore((state) => state.orders);
  const saveStore = useStockFlowStore((state) => state.saveStore);
  const toggleStoreStatus = useStockFlowStore(
    (state) => state.toggleStoreStatus,
  );

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [viewStore, setViewStore] = useState(null);

  const storeStats = useMemo(() => {
    return {
      total: stores.length,
      active: stores.filter((store) => store.status === "Active").length,
      inactive: stores.filter((store) => store.status === "Inactive").length,
    };
  }, [stores]);

  const getStoreOrders = (store) =>
    orders.filter(
      (order) =>
        order.store?.trim().toLowerCase() === store.name?.trim().toLowerCase(),
    );

  const getStoreMetrics = (store) => {
    const storeOrders = getStoreOrders(store);

    return {
      orders: storeOrders.length,
      purchaseValue: storeOrders.reduce(
        (total, order) => total + Number(order.amount || 0),
        0,
      ),
    };
  };

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const searchText = search.toLowerCase();

      const matchesSearch = [
        store.name,
        store.contactPerson,
        store.phone,
        store.city,
        store.district,
        store.address,
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchText);

      const matchesFilter = filter === "All" || store.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [stores, search, filter]);

  const openCreateModal = () => {
    setSelectedStore(null);
    setIsModalOpen(true);
  };

  const openEditModal = (store) => {
    setSelectedStore(store);
    setIsModalOpen(true);
  };

  const handleSave = (form) => {
    const result = saveStore({
      ...form,
      id: selectedStore?.id,
    });

    if (!result?.success) {
      window.alert(result?.error || "Unable to save store.");
      return;
    }

    setIsModalOpen(false);
    setSelectedStore(null);
  };

  const handleToggleStatus = (store) => {
    const nextStatus = store.status === "Active" ? "Inactive" : "Active";

    const confirmed = window.confirm(
      `${nextStatus === "Inactive" ? "Deactivate" : "Activate"} ${store.name}?`,
    );

    if (!confirmed) return;

    toggleStoreStatus(store.id);
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stores</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage retail stores connected to your wholesale godown.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Plus size={18} />
          Add Store
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Stores"
          value={storeStats.total}
          icon={<Store size={20} />}
        />

        <StatCard
          title="Active Stores"
          value={storeStats.active}
          icon={<ShoppingBag size={20} />}
        />

        <StatCard
          title="Inactive Stores"
          value={storeStats.inactive}
          icon={<Power size={20} />}
        />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stores, phone, city..."
            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-2">
          {["All", "Active", "Inactive"].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                filter === item
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Store Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Store Directory</h2>
          <p className="mt-1 text-sm text-slate-500">
            {filteredStores.length} stores found
          </p>
        </div>

        {filteredStores.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Store size={32} className="mx-auto mb-3 text-slate-300" />
            <h3 className="font-semibold text-slate-800">No stores found</h3>
            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or add a new store.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Store</th>
                    <th className="px-5 py-4 font-semibold">Contact</th>
                    <th className="px-5 py-4 font-semibold">Location</th>
                    <th className="px-5 py-4 font-semibold">Orders</th>
                    <th className="px-5 py-4 font-semibold">Purchase Value</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredStores.map((store) => {
                    const metrics = getStoreMetrics(store);

                    return (
                      <tr key={store.id} className="hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setViewStore(store)}
                            className="text-left"
                          >
                            <p className="font-semibold text-slate-900 hover:text-indigo-600">
                              {store.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {store.id}
                            </p>
                          </button>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm text-slate-800">
                            {store.contactPerson || "Not added"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {store.phone || "No phone"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm text-slate-700">
                            {store.city || store.address || "Not added"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {store.district || ""}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-slate-800">
                          {metrics.orders}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                          {formatCurrency(metrics.purchaseValue)}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={store.status} />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <ActionButton
                              onClick={() => openEditModal(store)}
                              title="Edit store"
                            >
                              <Pencil size={16} />
                            </ActionButton>

                            <ActionButton
                              onClick={() => handleToggleStatus(store)}
                              title={
                                store.status === "Active"
                                  ? "Deactivate store"
                                  : "Activate store"
                              }
                            >
                              <Power size={16} />
                            </ActionButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-slate-100 md:hidden">
              {filteredStores.map((store) => {
                const metrics = getStoreMetrics(store);

                return (
                  <div key={store.id} className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <button
                          onClick={() => setViewStore(store)}
                          className="text-left font-semibold text-slate-900"
                        >
                          {store.name}
                        </button>
                        <p className="mt-1 text-xs text-slate-400">
                          {store.id}
                        </p>
                      </div>

                      <StatusBadge status={store.status} />
                    </div>

                    <div className="space-y-2 text-sm text-slate-500">
                      <p className="flex items-center gap-2">
                        <MapPin size={15} />
                        {store.city || store.address || "Location not added"}
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone size={15} />
                        {store.phone || "Phone not added"}
                      </p>
                    </div>

                    <div className="flex justify-between border-t border-slate-100 pt-3 text-sm">
                      <span className="text-slate-500">
                        {metrics.orders} orders
                      </span>
                      <span className="font-semibold text-slate-800">
                        {formatCurrency(metrics.purchaseValue)}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewStore(store)}
                        className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700"
                      >
                        View
                      </button>

                      <button
                        onClick={() => openEditModal(store)}
                        className="rounded-lg bg-slate-100 p-2 text-slate-700"
                        title="Edit"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        onClick={() => handleToggleStatus(store)}
                        className="rounded-lg bg-slate-100 p-2 text-slate-700"
                        title="Change status"
                      >
                        <Power size={17} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <StoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        store={selectedStore}
      />

      {viewStore && (
        <StoreDetailsModal
          store={viewStore}
          orders={getStoreOrders(viewStore)}
          onClose={() => setViewStore(null)}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>
        <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
          {icon}
        </div>
      </div>
      <p className="mt-4 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const active = status === "Active";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {status}
    </span>
  );
}

function ActionButton({ children, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
    >
      {children}
    </button>
  );
}

function StoreDetailsModal({ store, orders, onClose, formatCurrency }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{store.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{store.id}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 p-6">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Total Orders</p>
            <p className="mt-2 text-xl font-bold text-slate-900">
              {orders.length}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Purchase Value</p>
            <p className="mt-2 text-xl font-bold text-slate-900">
              {formatCurrency(
                orders.reduce(
                  (sum, order) => sum + Number(order.amount || 0),
                  0,
                ),
              )}
            </p>
          </div>
        </div>

        <div className="space-y-2 px-6 pb-5 text-sm text-slate-600">
          <p>
            <strong>Contact:</strong> {store.contactPerson || "Not added"}
          </p>
          <p>
            <strong>Phone:</strong> {store.phone || "Not added"}
          </p>
          <p>
            <strong>Email:</strong> {store.email || "Not added"}
          </p>
          <p>
            <strong>Address:</strong> {store.address || "Not added"}
          </p>
          <p>
            <strong>City:</strong> {store.city || "Not added"}
          </p>
          <p>
            <strong>District:</strong> {store.district || "Not added"}
          </p>
        </div>

        <div className="border-t border-slate-100 p-6">
          <h3 className="mb-4 font-semibold text-slate-900">Order History</h3>

          {orders.length === 0 ? (
            <p className="text-sm text-slate-500">No matching orders found.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {order.id}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {order.date} · {order.status}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-slate-900">
                    {formatCurrency(order.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
