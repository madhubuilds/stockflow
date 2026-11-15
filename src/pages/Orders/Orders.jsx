
import { useMemo, useState } from "react";
import {
  ShoppingBag,
  Clock3,
  PackageCheck,
  Truck,
  Plus,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useStockFlowStore } from "../../store/useStockFlowStore";

const orderFilters = [
  "All",
  "Pending",
  "Approved",
  "Processing",
  "Dispatched",
];

export default function Orders() {
  const navigate = useNavigate();

  const orders = useStockFlowStore((state) => state.orders);

  const [activeFilter, setActiveFilter] = useState("All");

  const filteredOrders = useMemo(() => {
    if (activeFilter === "All") {
      return orders;
    }

    return orders.filter(
      (order) => order.status === activeFilter
    );
  }, [orders, activeFilter]);

  const orderStats = [
    {
      title: "Total Orders",
      value: orders.length,
      description: "All received orders",
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Pending Approval",
      value: orders.filter(
        (order) => order.status === "Pending"
      ).length,
      description: "Awaiting review",
      icon: Clock3,
      color: "bg-orange-50 text-orange-600",
    },
    {
      title: "Processing",
      value: orders.filter(
        (order) => order.status === "Processing"
      ).length,
      description: "Being prepared",
      icon: PackageCheck,
      color: "bg-violet-50 text-violet-600",
    },
    {
      title: "Dispatched",
      value: orders.filter(
        (order) => order.status === "Dispatched"
      ).length,
      description: "Sent to stores",
      icon: Truck,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <ShoppingBag size={16} />
            <span>Workspace / Orders</span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Orders
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage and process orders received from retail stores.
          </p>
        </div>

        <button
          type="button"
          disabled
          title="Order creation is not implemented yet"
          className="flex cursor-not-allowed items-center gap-2 rounded-xl bg-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm"
        >
          <Plus size={18} />
          Create Order
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {orderFilters.map((filter) => (
          <button
            key={filter}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeFilter === filter
                ? "bg-slate-900 text-white"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Orders table */}
      <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-5">
          <h2 className="font-bold text-slate-900">
            Order List
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            {filteredOrders.length} orders found
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-slate-50">
              <tr className="text-xs text-slate-400">
                <th className="px-5 py-4">Order ID</th>
                <th className="px-5 py-4">Store</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Items</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="cursor-pointer transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                    {order.id}
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-slate-800">
                      {order.store}
                    </p>
                    <p className="text-xs text-slate-400">
                      {order.location}
                    </p>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                    {order.date}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {order.items}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-800">
                    ₹{Number(order.amount).toLocaleString("en-IN")}
                  </td>

                  <td className="px-5 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                </tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-10 text-center text-sm text-slate-400"
                  >
                    No orders found for this status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic order statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {orderStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <div className={`rounded-xl p-3 ${stat.color}`}>
                  <Icon size={21} />
                </div>
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                {stat.title}
              </p>

              <h2 className="mt-1 text-3xl font-bold text-slate-900">
                {stat.value}
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderStatusBadge({ status }) {
  const styles = {
    Pending: "bg-orange-50 text-orange-600",
    Approved: "bg-blue-50 text-blue-600",
    Processing: "bg-violet-50 text-violet-600",
    Dispatched: "bg-emerald-50 text-emerald-600",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}
