"use client";

import { countNewEnquiries, listEnquiries } from "@/services/enquiries";
import type { EnquiryStatus, OutletId } from "@/types";
import { useStoreQuery } from "../use-store-query";

export function useEnquiries(status?: EnquiryStatus, outletId?: OutletId) {
  return useStoreQuery(
    () => listEnquiries(status, outletId),
    ["enquiries"],
    [status, outletId],
  );
}

export function useNewEnquiryCount(outletId?: OutletId) {
  return useStoreQuery(() => countNewEnquiries(outletId), ["enquiries"], [outletId]);
}
