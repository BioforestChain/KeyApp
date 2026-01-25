import { describe, it, expect } from "vitest"
import { deleteSnapshot, readSnapshot, writeSnapshot } from "./snapshot-store"

describe("snapshot-store", () => {
  it("stores and retrieves snapshots in memory when IndexedDB is unavailable", async () => {
    const key = "test:snapshot:memory"
    const entry = {
      key,
      data: { amount: 1n, symbol: "BFT" },
      timestamp: Date.now(),
    }

    await writeSnapshot(entry)

    const loaded = await readSnapshot<typeof entry.data>(key)
    expect(loaded?.key).toBe(key)
    expect(loaded?.data.amount).toBe(1n)
    expect(loaded?.data.symbol).toBe("BFT")

    await deleteSnapshot(key)
  })
})
