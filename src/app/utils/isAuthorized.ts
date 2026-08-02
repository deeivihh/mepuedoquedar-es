import { createHmac, timingSafeEqual } from "crypto";

const MAX_CLOCK_SKEW_SECONDS = 300;

function getOneMonthAgo() {
    return new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
    )
        .toISOString()
        .slice(0, 10);
}

function safeCompare(a: string, b: string): boolean {
    const bufferA = Buffer.from(a);
    const bufferB = Buffer.from(b);

    if (bufferA.length !== bufferB.length) {
        return false;
    }

    return timingSafeEqual(bufferA, bufferB);
}

function createSignature(timestamp: string, secret: string) {
    return createHmac("sha256", secret)
        .update(timestamp)
        .digest("hex");
}

export function isAuthorized(req: Request): boolean {
    const secret = process.env.INT_SYNC_SECRET_KEY;

    if (!secret) return false;

    const token = req.headers
        .get("authorization")
        ?.replace(/^Bearer\s+/i, "");

    const timestamp = req.headers.get(
        "x-sync-timestamp"
    );

    const signature = req.headers.get(
        "x-sync-signature"
    );

    if (!token || !timestamp || !signature) {
        return false;
    }

    if (!safeCompare(token, secret)) {
        return false;
    }

    const timestampNumber = Number(timestamp);

    if (!Number.isFinite(timestampNumber)) {
        return false;
    }

    const now = Math.floor(Date.now() / 1000);

    if (
        Math.abs(now - timestampNumber) >
        MAX_CLOCK_SKEW_SECONDS
    ) {
        return false;
    }

    const expectedSignature = createSignature(
        timestamp,
        secret
    );

    return safeCompare(
        signature,
        expectedSignature
    );
}