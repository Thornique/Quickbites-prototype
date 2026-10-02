"use client";

import { getCustomer, listCustomers } from "@/services/customers";
import { useStoreQuery } from "../use-store-query";

export function useCustomers(search?: string) {
  return useStoreQuery(() => listCustomers(search), ["users", "orders"], [search]);
}

export function useCustomer(id: string) {
  return useStoreQuery(() => getCustomer(id), ["users", "orders"], [id]);
}
