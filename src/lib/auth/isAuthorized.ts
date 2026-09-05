import { createHmac, timingSafeEqual } from "crypto";

const MAX_CLOCK_SKEW_SECONDS = 300;

function safeCompare(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export function isAuthorized(req: Request): boolean {
    const secret = process.env.INT_SYNC_SECRET_KEY;
    if (!secret) return false;

    const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const timestamp = req.headers.get("x-sync-timestamp");
    const signature = req.headers.get("x-sync-signature");

    if (!token || !timestamp || !signature || !safeCompare(token, secret)) return false;

    const ts = Number(timestamp);
    if (!Number.isFinite(ts) || Math.abs(Math.floor(Date.now() / 1000) - ts) > MAX_CLOCK_SKEW_SECONDS) return false;

    const expected = createHmac("sha256", secret).update(timestamp).digest("hex");
    return safeCompare(signature, expected);
}
