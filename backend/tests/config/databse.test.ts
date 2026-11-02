import { describe, it, vi, expect, beforeEach, afterEach } from "vitest";
import { sql, connectDB } from "../../src/config/database";

vi.unmock("../../src/config/database.js");

const { mockSql } = vi.hoisted(() => ({ mockSql: vi.fn() }));
vi.mock("@neondatabase/serverless", () => ({ neon: () => mockSql }));

describe("connectDB", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "time").mockImplementation(() => {});
    vi.spyOn(console, "timeEnd").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    mockSql.mockReset();
  });

  it("sql have to be mock function (sanity check)", () => {
    expect(sql).toBe(mockSql);
  });

  it("when success: log time and infromation, call sql 1 time", async () => {
    mockSql.mockResolvedValueOnce([{ now: "2026-11-02T05:02:54.026Z" }]);
    const exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation((() => {}) as never);

    await connectDB();

    expect(mockSql).toHaveBeenCalledTimes(1);
    expect(console.time).toHaveBeenCalledWith("time-connect");
    expect(console.timeEnd).toHaveBeenCalledWith("time-connect");
    expect(console.log).toHaveBeenCalledWith(
      "NeonDB connected",
      "2026-11-02T05:02:54.026Z",
    );
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it("first cursh: log error, wait for 5 second to retry", async () => {
    const err = new Error("fail");
    mockSql.mockRejectedValueOnce(err).mockResolvedValueOnce([{ now: "ok" }]);
    const exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation((() => {}) as never);

    const p = connectDB();

    await vi.advanceTimersByTimeAsync(4999);
    expect(mockSql).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      "NeonDB connection error (retry 0/5)",
      err,
    );

    await vi.advanceTimersByTimeAsync(1);
    await p;

    expect(mockSql).toHaveBeenCalledTimes(2);
    expect(console.log).toHaveBeenCalledWith("NeonDB connected", "ok");
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it("await connectDB() dosen't stop until retry is success", async () => {
    mockSql
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValueOnce([{ now: "ok" }]);
    let done = false;

    const p = connectDB().then(() => {
      done = true;
    });

    await vi.advanceTimersByTimeAsync(4999);
    expect(done).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await p;
    expect(done).toBe(true);
  });

  it("alwary cursh: retry 5 then call process.exit(1)", async () => {
    mockSql.mockRejectedValue(new Error("down"));

    const exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {
      throw new Error("process.exit called");
    }) as never);

    const p = connectDB();
    const assertion = expect(p).rejects.toThrow("process.exit called");
    await vi.advanceTimersByTimeAsync(5000 * 5);
    await assertion;

    expect(mockSql).toHaveBeenCalledTimes(6);
    expect(console.log).toHaveBeenCalledWith(
      "NeonDB connection error (retry 5/5)",
      expect.any(Error),
    );
    expect(console.log).toHaveBeenCalledWith(
      "Can not connect to NeonDB, exiting.",
    );
    expect(exitSpy).toHaveBeenCalledTimes(1);
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
