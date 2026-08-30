import { describe, it, expect } from "vitest";

describe("Guest QR Check-in & Seating Resolver Logic", () => {
  interface SeatingTable {
    id: string;
    name: string;
    capacity: number;
    zone: string;
    guestIds: string[];
  }

  const mockTables: SeatingTable[] = [
    {
      id: "tbl-1",
      name: "Bàn 1 - VIP Gia Đình",
      capacity: 10,
      zone: "Khu vực sân khấu",
      guestIds: ["guest-1", "guest-2"],
    },
    {
      id: "tbl-2",
      name: "Bàn 2 - Bạn Thân Dâu Rể",
      capacity: 10,
      zone: "Khu vực trung tâm",
      guestIds: ["guest-3"],
    },
  ];

  function resolveGuestTable(guestId: string, tables: SeatingTable[]) {
    const found = tables.find((t) => t.guestIds.includes(guestId));
    if (found) {
      return { tableName: found.name, zone: found.zone, isSeated: true };
    }
    return { tableName: "Chưa xếp bàn", zone: "Tự do", isSeated: false };
  }

  function parseScannedCode(rawText: string): string {
    if (!rawText) return "";
    if (rawText.includes("guest=")) {
      const match = rawText.match(/guest=([a-zA-Z0-9-%_]+)/);
      return match ? decodeURIComponent(match[1]) : "";
    }
    if (rawText.startsWith("LS-GUEST:")) {
      return rawText.replace("LS-GUEST:", "").trim();
    }
    return rawText.trim();
  }

  it("should correctly resolve seating table and zone for assigned guests", () => {
    const result1 = resolveGuestTable("guest-1", mockTables);
    expect(result1.isSeated).toBe(true);
    expect(result1.tableName).toBe("Bàn 1 - VIP Gia Đình");
    expect(result1.zone).toBe("Khu vực sân khấu");

    const result2 = resolveGuestTable("guest-3", mockTables);
    expect(result2.isSeated).toBe(true);
    expect(result2.tableName).toBe("Bàn 2 - Bạn Thân Dâu Rể");

    const resultUnassigned = resolveGuestTable("guest-unknown", mockTables);
    expect(resultUnassigned.isSeated).toBe(false);
    expect(resultUnassigned.tableName).toBe("Chưa xếp bàn");
  });

  it("should extract guest identifier accurately from various QR string formats", () => {
    expect(parseScannedCode("https://lovestory.app/i/tuan-mai?guest=guest-123")).toBe("guest-123");
    expect(parseScannedCode("https://lovestory.app/i/tuan-mai?guest=Nguy%E1%BB%85n%20V%C4%83n%20A")).toBe("Nguyễn Văn A");
    expect(parseScannedCode("LS-GUEST:guest-456")).toBe("guest-456");
    expect(parseScannedCode("c2f1f58e-0cf4-4ffb-8730-84ebef95b712")).toBe("c2f1f58e-0cf4-4ffb-8730-84ebef95b712");
  });
});
