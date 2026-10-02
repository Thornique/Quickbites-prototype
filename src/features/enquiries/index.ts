"use client";

import { countNewEnquiries, listEnquiries } from "@/services/enquiries";
import type { EnquiryStatus } from "@/types";
import { useStoreQuery } from "../use-store-query";

export function useEnquiries(status?: EnquiryStatus) {
  return useStoreQuery(() => listEnquiries(status), ["enquiries"], [status]);
}

export function useNewEnquiryCount() {
  return useStoreQuery(countNewEnquiries, ["enquiries"]);
}
