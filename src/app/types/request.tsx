export type RequestStatus = "pending" | "accepted" | "rejected" | "cancelled";

export interface RequestItem {
  id: number;
  itemId: number;
  requester: string; // email atau username user
  status: RequestStatus;
}
