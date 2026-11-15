
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { useStockFlowStore } from "../../store/useStockFlowStore";

const statusStyles = {
  Pending: "bg-orange-50 text-orange-600",
  Approved: "bg-blue-50 text-blue-600",
  Processing: "bg-violet-50 text-violet-600",
  Dispatched: "bg-emerald-50 text-emerald-600",
};

function formatDate(date) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export default function RecentOrders() {
  const navigate = useNavigate();
  const orders = useStockFlowStore((state) => state.orders);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Recent Orders
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Latest orders received from retail stores
          </p>
        </div>

        <button
          onClick={() => navigate("/orders")}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
        >
          View all
          <ArrowUpRight size={15} />
        </button>
      </div>

      {/* Mobile cards */}
      <div className="divide-y divide-slate-100 md:hidden">
        {recentOrders.map((order) => (
          <div
            key={order.id}
            className="cursor-pointer space-y-3 p-5"
            onClick={() => navigate(`/orders/${order.id}`)}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-slate-900">
                {order.id}
              </p>

              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                  statusStyles[order.status] || "bg-slate-100 text-slate-600"
                }`}
              >
                {order.status}
              </span>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">
                {order.store}
              </p>

              <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                <MapPin size={12} />
                {order.location}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">
                {formatDate(order.date)} · {order.items} items
              </span>

              <span className="font-bold text-slate-900">
                {formatCurrency(order.amount)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left">
          <thead className="bg-slate-50/80">
            <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="px-5 py-4">Order ID</th>
              <th className="px-5 py-4">Store</th>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Items</th>
              <th className="px-5 py-4">Amount</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {recentOrders.map((order) => (
              <tr
                key={order.id}
                className="cursor-pointer transition hover:bg-slate-50/70"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                <td className="px-5 py-4 text-xs font-bold text-slate-700">
                  {order.id}
                </td>

                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-slate-800">
                    {order.store}
                  </p>

                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                    <MapPin size={12} />
                    {order.location}
                  </p>
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                  {formatDate(order.date)}
                </td>

                <td className="px-5 py-4 text-sm text-slate-600">
                  {order.items}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-800">
                  {formatCurrency(order.amount)}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      statusStyles[order.status] || "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>

                <td className="px-5 py-4 text-right">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(`/orders/${order.id}`);
                    }}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                    aria-label={`View ${order.id}`}
                  >
                    <ArrowRight size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {recentOrders.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-sm font-medium text-slate-600">
            No orders available yet.
          </p>
        </div>
      )}
    </section>
  );
}
