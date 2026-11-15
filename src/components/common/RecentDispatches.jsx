
import { useNavigate } from "react-router-dom";
import {
  Truck,
  ArrowUpRight,
  MapPin,
  Package,
} from "lucide-react";
import { useStockFlowStore } from "../../store/useStockFlowStore";

const statusStyles = {
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

export default function RecentDispatches() {
  const navigate = useNavigate();
  const orders = useStockFlowStore((state) => state.orders);

  const dispatchedOrders = [...orders]
    .filter((order) => order.status === "Dispatched")
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-5">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Recent Dispatches
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Recently dispatched store orders
          </p>
        </div>

        <button
          onClick={() => navigate("/dispatch")}
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
        >
          View all
          <ArrowUpRight size={15} />
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {dispatchedOrders.map((order) => (
          <div
            key={order.id}
            className="flex flex-col gap-3 p-5 transition hover:bg-slate-50/60 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Truck size={21} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800">
                  {order.store}
                </p>

                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                  <span>{order.id}</span>

                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {order.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Package size={15} className="text-slate-400" />
                {order.items} items
              </div>

              <div className="text-xs text-slate-400">
                {formatDate(order.date)}
              </div>

              <span
                className={`rounded-full px-3 py-1 text-[10px] font-semibold ${statusStyles.Dispatched}`}
              >
                Dispatched
              </span>

              <button
                onClick={() => navigate(`/orders/${order.id}`)}
                className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                View order
              </button>
            </div>
          </div>
        ))}

        {dispatchedOrders.length === 0 && (
          <div className="p-8 text-center">
            <Truck className="mx-auto mb-2 text-slate-300" size={28} />
            <p className="text-sm font-medium text-slate-600">
              No dispatched orders yet.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Dispatched orders will appear here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
