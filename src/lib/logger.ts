import { getSupabase } from "@/lib/supabase/client";

type LogEntry = { ts: string; level: string; msg: string };

export function createLog(module: string) {
  const logs: LogEntry[] = [];
  const startedAt = new Date();

  const log = (level: string, msg: string) => {
    logs.push({ ts: new Date().toISOString(), level, msg });
    console[level === "error" ? "error" : "log"](`[${module}]`, msg);
  };

  return {
    info: (msg: string) => log("info", msg),
    warn: (msg: string) => log("warn", msg),
    error: (msg: string) => log("error", msg),

    async save(opts: {
      status: "completed" | "error";
      totalMunicipalities?: number;
      totalDatasets?: number;
      error?: string;
    }) {
      const now = new Date();
      await getSupabase().from("sync_logs").insert({
        module,
        status: opts.status,
        started_at: startedAt.toISOString(),
        finished_at: now.toISOString(),
        duration_ms: now.getTime() - startedAt.getTime(),
        total_municipalities: opts.totalMunicipalities ?? 0,
        total_datasets: opts.totalDatasets ?? 0,
        logs,
        error: opts.error ?? null,
      });
    },
  };
}
