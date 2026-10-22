import { queryOptions } from "@tanstack/react-query";
import { getProducts, getStoreSettings } from "./store.functions";

export const productsQueryOptions = queryOptions({
  queryKey: ["products"],
  queryFn: () => getProducts(),
});

export const settingsQueryOptions = queryOptions({
  queryKey: ["store-settings"],
  queryFn: () => getStoreSettings(),
});
