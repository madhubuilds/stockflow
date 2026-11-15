import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  Package,
  Search,
  MapPin,
  ArrowUpRight,
  ArrowRight,
  CalendarDays,
  Boxes,
  ClipboardList,
} from "lucide-react";

import { useStockFlowStore } from "../../store/useStockFlowStore";

const statusStyles = {
  Dispatched: "bg-emerald-50 text-emerald-700",
  Shipped: "bg-emerald-50 text-emerald-700",
  Ready: "bg-blue-50 text-blue-700",
  "In Transit": "bg-violet-50 text-violet-700",
};

function formatDate(date) {
  if (!date) return "—";

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) return date;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

function SummaryCard({ title, value, description, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">{value}</h3>
          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>

        <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

export default function Dispatch() {
  const navigate = useNavigate();

  const dispatches = useStockFlowStore((state) => state.dispatches);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const safeDispatches = Array.isArray(dispatches) ? dispatches : [];

  const filteredDispatches = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return [...safeDispatches]
      .filter((dispatch) => {
        const matchesSearch =
          !normalizedSearch ||
          [
            dispatch.id,
            dispatch.orderId,
            dispatch.store,
            dispatch.location,
          ].some((value) =>
            String(value || "")
              .toLowerCase()
              .includes(normalizedSearch),
          );

        const matchesStatus =
          statusFilter === "All" || dispatch.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();

        return dateB - dateA;
      });
  }, [safeDispatches, search, statusFilter]);

  const totalUnits = safeDispatches.reduce(
    (total, dispatch) => total + Number(dispatch.items ?? dispatch.boxes ?? 0),
    0,
  );

  const uniqueStores = new Set(
    safeDispatches.map((dispatch) => dispatch.store).filter(Boolean),
  ).size;

  const statuses = [
    "All",
    ...new Set(
      safeDispatches.map((dispatch) => dispatch.status).filter(Boolean),
    ),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-400">Workspace / Dispatch</p>

          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Dispatch Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View and manage orders dispatched from your warehouse.
          </p>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600">
          <Truck size={17} />
          Dispatch History
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Dispatches"
          value={safeDispatches.length}
          description="Recorded dispatches"
          icon={Truck}
        />

        <SummaryCard
          title="Total Units"
          value={totalUnits}
          description="Items recorded in dispatches"
          icon={Package}
        />

        <SummaryCard
          title="Stores Served"
          value={uniqueStores}
          description="Unique stores dispatched to"
          icon={ClipboardList}
        />

        <SummaryCard
          title="Dispatched"
          value={
            safeDispatches.filter(
              (dispatch) => dispatch.status === "Dispatched",
            ).length
          }
          description="Confirmed dispatches"
          icon={Boxes}
        />
      </div>

      {/* Dispatch table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Dispatch Records
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Search and review warehouse dispatch history.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search dispatch, order or store..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    statusFilter === status
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80">
              <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-4">Dispatch ID</th>
                <th className="px-5 py-4">Store</th>
                <th className="px-5 py-4">Order ID</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Quantity</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredDispatches.map((dispatch) => (
                <tr
                  key={dispatch.id}
                  className="transition hover:bg-slate-50/70"
                >
                  <td className="px-5 py-4">
                    <p className="text-xs font-bold text-slate-800">
                      {dispatch.id}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-slate-800">
                      {dispatch.store || "—"}
                    </p>

                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                      <MapPin size={12} />
                      {dispatch.location || "Location unavailable"}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-xs font-medium text-slate-600">
                    {dispatch.orderId || "—"}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="flex items-center gap-2 text-xs text-slate-500">
                      <CalendarDays size={14} />
                      {formatDate(dispatch.date)}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                    {dispatch.items ?? dispatch.boxes ?? "—"}
                    <span className="ml-1 text-xs font-normal text-slate-400">
                      {dispatch.items != null ? "items" : "boxes"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        statusStyles[dispatch.status] ||
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {dispatch.status || "Unknown"}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    {dispatch.orderId && (
                      <button
                        onClick={() => navigate(`/orders/${dispatch.orderId}`)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                        aria-label={`View order ${dispatch.orderId}`}
                      >
                        <ArrowRight size={17} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="divide-y divide-slate-100 md:hidden">
          {filteredDispatches.map((dispatch) => (
            <div key={dispatch.id} className="space-y-3 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {dispatch.id}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {dispatch.orderId || "No linked order"}
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    statusStyles[dispatch.status] ||
                    "bg-slate-100 text-slate-600"
                  }`}
                >
                  {dispatch.status || "Unknown"}
                </span>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {dispatch.store || "—"}
                </p>

                <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                  <MapPin size={12} />
                  {dispatch.location || "Location unavailable"}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  {dispatch.items ?? dispatch.boxes ?? "—"}{" "}
                  {dispatch.items != null ? "items" : "boxes"}
                </span>

                <span>{formatDate(dispatch.date)}</span>
              </div>

              {dispatch.orderId && (
                <button
                  onClick={() => navigate(`/orders/${dispatch.orderId}`)}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600"
                >
                  View order
                  <ArrowUpRight size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Empty states */}
        {filteredDispatches.length === 0 && (
          <div className="px-5 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Truck size={25} />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-800">
              {safeDispatches.length === 0
                ? "No dispatches yet"
                : "No matching dispatches"}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              {safeDispatches.length === 0
                ? "Dispatch records will appear here after orders are marked as dispatched."
                : "Try changing your search or status filter."}
            </p>

            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                }}
                className="mt-4 text-xs font-semibold text-blue-600"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        <div className="border-t border-slate-100 px-5 py-3">
          <p className="text-xs text-slate-400">
            Showing {filteredDispatches.length} of {safeDispatches.length}{" "}
            dispatch records
          </p>
        </div>
      </section>
    </div>
  );
}
