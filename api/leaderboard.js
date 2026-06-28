const STORE_KEY = "ransomware-defense-results";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}

function compareScores(a, b) {
  return (
    b.remainingMoney - a.remainingMoney ||
    b.securityPoints - a.securityPoints ||
    a.mistakes - b.mistakes ||
    a.durationSeconds - b.durationSeconds
  );
}

export default {
  async fetch(request) {
    if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);

    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) return json({ error: "Leaderboard is not configured" }, 503);

    try {
      const response = await fetch(`${url}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify([["LRANGE", STORE_KEY, 0, -1]])
      });
      if (!response.ok) throw new Error("Database request failed");

      const result = await response.json();
      if (result[0]?.error) throw new Error("Database command failed");
      const records = (result[0]?.result || []).map((value) => JSON.parse(value));
      const bestByPlayer = new Map();

      records
        .filter((record) => record.outcome === "Win")
        .forEach((record) => {
          const started = Date.parse(record.startedAt);
          const completed = Date.parse(record.completedAt);
          const durationSeconds = Number.isFinite(started) && Number.isFinite(completed)
            ? Math.max(0, Math.round((completed - started) / 1000))
            : 0;
          const score = {
            playerName: String(record.playerName || "Anonymous").slice(0, 40),
            remainingMoney: Math.max(0, Number(record.remainingMoney) || 0),
            securityPoints: Math.max(0, Number(record.securityPoints) || 0),
            mistakes: Math.max(0, Number(record.mistakes) || 0),
            durationSeconds
          };
          const key = score.playerName.trim().toLowerCase() || "anonymous";
          const previous = bestByPlayer.get(key);
          if (!previous || compareScores(score, previous) < 0) {
            bestByPlayer.set(key, score);
          }
        });

      const leaderboard = [...bestByPlayer.values()]
        .sort(compareScores)
        .slice(0, 10)
        .map((entry, index) => ({ rank: index + 1, ...entry }));

      return json({ leaderboard });
    } catch (error) {
      console.error(error);
      return json({ error: "Unable to load leaderboard" }, 503);
    }
  }
};
