import "server-only";
import type { Claim, Completion, ContactStore } from "./contact-handler.ts";

// One atomic reservation across serverless instances. Only keyed hashes and status are stored.
export const claimScript = [
  "local old = redis.call('GET', KEYS[1])",
  "if old then",
  "  local record = cjson.decode(old)",
  "  if record.fingerprint ~= ARGV[1] then return {'conflict', 0} end",
  "  if record.status == 'accepted' then return {'accepted', 0} end",
  "  if record.status == 'unknown' then return {'unknown', 0} end",
  "  if record.status == 'pending' then",
  "    if tonumber(ARGV[2]) - record.started > 60 then return {'unknown', 0} end",
  "    return {'pending', 60}",
  "  end",
  "end",
  "local cooldown = redis.call('TTL', KEYS[2])",
  "if cooldown > 0 then return {'rate', cooldown} end",
  "if tonumber(redis.call('GET', KEYS[3]) or '0') >= 3 then return {'rate', math.max(1, redis.call('TTL', KEYS[3]))} end",
  "if tonumber(redis.call('GET', KEYS[4]) or '0') >= 50 then return {'rate', math.max(1, redis.call('TTL', KEYS[4]))} end",
  "redis.call('SET', KEYS[1], cjson.encode({fingerprint=ARGV[1], status='pending', started=tonumber(ARGV[2])}), 'EX', 86400)",
  "redis.call('SET', KEYS[2], '1', 'EX', 60)",
  "if redis.call('INCR', KEYS[3]) == 1 then redis.call('EXPIRE', KEYS[3], 3600) end",
  "if redis.call('INCR', KEYS[4]) == 1 then redis.call('EXPIRE', KEYS[4], 86400) end",
  "return {'new', 0}",
].join("\n");

const finishScript = [
  "local old = redis.call('GET', KEYS[1])",
  "if not old then return 'MISSING' end",
  "local record = cjson.decode(old)",
  "if record.fingerprint ~= ARGV[1] then return 'CONFLICT' end",
  "record.status = ARGV[2]",
  "redis.call('SET', KEYS[1], cjson.encode(record), 'KEEPTTL')",
  "return 'OK'",
].join("\n");

type Command = (command: (string | number)[]) => Promise<unknown>;

export function createRedisStore(command: Command): ContactStore {
  return {
    async claim(id, fingerprint, ipHash, now) {
      const seconds = Math.floor(now / 1000);
      const prefix = "goe:contact:";
      const result = await command([
        "EVAL", claimScript, 4, prefix + "request:" + id, prefix + "cooldown:" + ipHash,
        prefix + "hour:" + ipHash + ":" + Math.floor(seconds / 3600),
        prefix + "day:" + Math.floor(seconds / 86400), fingerprint, seconds,
      ]);
      const kinds = ["new", "accepted", "pending", "unknown", "conflict", "rate"];
      if (!Array.isArray(result) || !kinds.includes(result[0]) || !Number.isFinite(Number(result[1]))) throw new Error("Invalid contact store response");
      return { kind: result[0], retryAfter: Math.max(0, Number(result[1])) } as Claim;
    },
    async finish(id, fingerprint, status) {
      const result = await command(["EVAL", finishScript, 1, "goe:contact:request:" + id, fingerprint, status]);
      if (result !== "OK") throw new Error("Contact completion unavailable");
    },
  };
}

export function createRestCommand(url: string, token: string, request: typeof fetch = fetch): Command {
  return async (command) => {
    const response = await request(url, {
      method: "POST", redirect: "error", cache: "no-store",
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify(command), signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error("Contact store unavailable");
    const data = await response.json() as { result?: unknown; error?: unknown };
    if (data.error || !("result" in data)) throw new Error("Contact store unavailable");
    return data.result;
  };
}

// Local mock delivery only. Production requires the durable store above.
export function createMemoryStore(): ContactStore {
  const requests = new Map<string, { fingerprint: string; status: Completion | "pending"; started: number }>();
  const ips = new Map<string, { hour: number; count: number; last: number }>();
  let day = -1;
  let total = 0;
  return {
    async claim(id, fingerprint, ipHash, now) {
      for (const [key, record] of requests) if (now - record.started >= 86400000) requests.delete(key);
      for (const [key, record] of ips) if (now - record.last >= 3600000) ips.delete(key);
      const prior = requests.get(id);
      if (prior) {
        if (prior.fingerprint !== fingerprint) return { kind: "conflict" };
        if (prior.status === "accepted" || prior.status === "unknown") return { kind: prior.status };
        if (prior.status === "pending") return { kind: now - prior.started > 60000 ? "unknown" : "pending" };
      }
      const ip = ips.get(ipHash);
      const hour = Math.floor(now / 3600000);
      if (ip && now - ip.last < 60000) return { kind: "rate", retryAfter: Math.ceil((60000 - now + ip.last) / 1000) };
      if (ip?.hour === hour && ip.count >= 3) return { kind: "rate", retryAfter: 3600 };
      const nextDay = Math.floor(now / 86400000);
      if (nextDay !== day) { day = nextDay; total = 0; }
      if (total >= 50) return { kind: "rate", retryAfter: 86400 };
      requests.set(id, { fingerprint, status: "pending", started: now });
      ips.set(ipHash, { hour, count: ip?.hour === hour ? ip.count + 1 : 1, last: now });
      total++;
      return { kind: "new" };
    },
    async finish(id, fingerprint, status) {
      const prior = requests.get(id);
      if (!prior || prior.fingerprint !== fingerprint) throw new Error("Missing contact reservation");
      prior.status = status;
    },
  };
}
