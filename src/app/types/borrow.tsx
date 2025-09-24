export type BorrowStatus = "borrowed" | "returned";

export interface BorrowItem {
  id: number;
  itemId: number;
  namaBarang: string;
  peminjam: string;
  tanggalPinjam: string; // YYYY-MM-DD
  tanggalKembali?: string; // nullable
  status: BorrowStatus;
}
