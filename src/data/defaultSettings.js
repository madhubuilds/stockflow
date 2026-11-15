export const defaultSettings = {
  business: {
    name: "StockFlow Wholesale",
    email: "",
    phone: "",
    address: "",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "",
  },
  inventory: {
    defaultLowStockThreshold: 10,
    allowNegativeStock: false,
  },
  orders: {
    allowPartialApproval: true,
    requireApprovalBeforePicking: true,
  },
  dispatch: {
    requirePackingBeforeDispatch: true,
    defaultDispatchStatus: "Dispatched",
  },
  preferences: {
    currency: "INR",
    dateFormat: "DD/MM/YYYY",
  },
};
