import { useMemo, useState } from "react";
import {
  Package,
  Boxes,
  AlertTriangle,
  XCircle,
  Search,
  SlidersHorizontal,
  History,
} from "lucide-react";

import { useStockFlowStore } from "../../store/useStockFlowStore";
import StockAdjustmentModal from "../../components/inventory/StockAdjustmentModal";

export default function Inventory() {
  const inventory = useStockFlowStore((state) => state.inventory);
  const history = useStockFlowStore((state) => state.adjustmentHistory);
  const adjustStock = useStockFlowStore((state) => state.adjustStock);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const [sortOrder, setSortOrder] = useState("name");

  const totalVariants = inventory.length;

  const totalUnits = inventory.reduce((total, item) => total + item.stock, 0);

  const lowStockCount = inventory.filter(
    (item) => item.stock > 0 && item.stock <= item.threshold,
  ).length;

  const outOfStockCount = inventory.filter((item) => item.stock === 0).length;

  const filteredInventory = useMemo(() => {
    const result = inventory.filter((item) => {
      const searchText = search.toLowerCase();

      const matchesSearch = [
        item.name,
        item.sku,
        item.color,
        item.size,
        item.category,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(searchText),
      );

      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "Low Stock" &&
          item.stock > 0 &&
          item.stock <= item.threshold) ||
        (activeFilter === "Out of Stock" && item.stock === 0) ||
        (activeFilter === "In Stock" && item.stock > item.threshold);

      return matchesSearch && matchesFilter;
    });

    if (sortOrder === "name") {
      result.sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || "")),
      );
    }

    if (sortOrder === "stock-low") {
      result.sort((a, b) => a.stock - b.stock);
    }

    if (sortOrder === "stock-high") {
      result.sort((a, b) => b.stock - a.stock);
    }

    return result;
  }, [inventory, search, activeFilter, sortOrder]);

  const handleStockAdjustment = (itemId, newStock, reason) => {
    const result = adjustStock(itemId, newStock, reason);

    if (result.success) {
      setSelectedItem(null);
    } else {
      window.alert(result.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-400">Workspace / Inventory</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Inventory Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor product variants and manage warehouse stock.
          </p>
        </div>

        <button
          onClick={() => setActiveFilter("Low Stock")}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <AlertTriangle size={17} />
          View Low Stock
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Variants"
          value={totalVariants}
          icon={<Package size={21} />}
          color="text-blue-600"
          background="bg-blue-50"
        />
        <StatCard
          title="Total Units"
          value={totalUnits.toLocaleString("en-IN")}
          icon={<Boxes size={21} />}
          color="text-violet-600"
          background="bg-violet-50"
        />
        <StatCard
          title="Low Stock"
          value={lowStockCount}
          icon={<AlertTriangle size={21} />}
          color="text-orange-600"
          background="bg-orange-50"
        />
        <StatCard
          title="Out of Stock"
          value={outOfStockCount}
          icon={<XCircle size={21} />}
          color="text-red-600"
          background="bg-red-50"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-bold text-slate-900">
            Product Inventory
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage stock by SKU, size and colour.
          </p>
        </div>

        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search product, SKU, colour..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={17} className="text-slate-400" />
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none sm:w-auto"
              >
                <option>All</option>
                <option>In Stock</option>
                <option>Low Stock</option>
                <option>Out of Stock</option>
              </select>
            </div>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none"
            >
              <option value="name">Sort by Name</option>
              <option value="stock-low">Stock: Low to High</option>
              <option value="stock-high">Stock: High to Low</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">SKU</th>
                <th className="px-5 py-4">Variant</th>
                <th className="px-5 py-4">Available Stock</th>
                <th className="px-5 py-4">Threshold</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredInventory.map((item) => {
                const status =
                  item.stock === 0
                    ? "Out of Stock"
                    : item.stock <= item.threshold
                      ? "Low Stock"
                      : "In Stock";

                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.category}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {item.sku}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.color} / {item.size}
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-900">
                        {item.stock}
                      </span>
                      <span className="ml-1 text-xs text-slate-400">units</span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.threshold}
                    </td>

                    <td className="px-5 py-4">
                      <StockBadge status={status} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredInventory.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No inventory items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-4">
          <p className="text-sm text-slate-500">
            Showing {filteredInventory.length} of {inventory.length} variants
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-200 p-5">
          <History size={20} className="text-slate-500" />
          <div>
            <h2 className="font-bold text-slate-900">
              Recent Stock Adjustments
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Latest changes made in the inventory.
            </p>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center">
            <History size={25} className="mx-auto text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-700">
              No stock adjustments yet
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Your stock changes will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {history.slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">{entry.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {entry.sku} · {entry.reason}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(entry.date).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p
                    className={`font-bold ${
                      entry.difference > 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {entry.difference > 0 ? "+" : ""}
                    {entry.difference} units
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {entry.previousStock} → {entry.newStock}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedItem && (
        <StockAdjustmentModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onSave={handleStockAdjustment}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color, background }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>
        <div className={`rounded-xl p-3 ${background} ${color}`}>{icon}</div>
      </div>
      <h3 className="mt-4 text-2xl font-bold text-slate-900">{value}</h3>
    </div>
  );
}

function StockBadge({ status }) {
  const styles = {
    "In Stock": "bg-emerald-50 text-emerald-700",
    "Low Stock": "bg-orange-50 text-orange-700",
    "Out of Stock": "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}
