import { mockOrders } from "./mockOrders";

const uniqueStores = [
  ...new Map(
    mockOrders.map((order) => [
      `${order.store}-${order.location}`,
      {
        name: order.store,
        location: order.location,
      },
    ]),
  ).values(),
];

export const mockStores = uniqueStores.map((store, index) => ({
  id: `STORE-${String(index + 1).padStart(3, "0")}`,
  name: store.name,
  contactPerson: "",
  phone: "",
  email: "",
  address: store.location,
  city: "",
  district: "",
  status: "Active",
  createdAt: new Date().toISOString(),
}));
