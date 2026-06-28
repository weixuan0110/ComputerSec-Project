const STORE_KEY = "ransomware-defense-results";
const MAX_RECORDS = 1000;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}

function cleanText(value, maxLength) {
  return String(value ?? "").slice(0, maxLength);
}

function sanitizeRecord(input) {
  const answers = Array.isArray(input.answers) ? input.answers.slice(0, 100) : [];
  return {
    id: crypto.randomUUID(),
    receivedAt: new Date().toISOString(),
    playerName: cleanText(input.playerName, 40),
    startedAt: cleanText(input.startedAt, 40),
    completedAt: cleanText(input.completedAt, 40),
    outcome: input.outcome === "Win" ? "Win" : "Loss",
    stageReached: Math.min(3, Math.max(1, Number(input.stageReached) || 1)),
    remainingMoney: Math.max(0, Number(input.remainingMoney) || 0),
    securityPoints: Math.max(0, Number(input.securityPoints) || 0),
    mistakes: Math.max(0, Number(input.mistakes) || 0),
    answers: answers.map((answer) => ({
      stage: Math.min(3, Math.max(1, Number(answer.stage) || 1)),
      question: cleanText(answer.question, 300),
      selectedAnswer: cleanText(answer.selectedAnswer, 300),
      correctAnswer: cleanText(answer.correctAnswer, 300),
      isCorrect: answer.isCorrect === true,
      responseSeconds: Math.min(30, Math.max(0, Number(answer.responseSeconds) || 0))
    }))
  };
}

async function redis(commands) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Database environment variables are missing");

  const response = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(commands)
  });
  if (!response.ok) throw new Error("Database request failed");
  const result = await response.json();
  if (result.some((entry) => entry.error)) throw new Error("Database command failed");
  return result;
}

async function handlePost(request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 100000) return json({ error: "Record is too large" }, 413);

  let input;
  try {
    input = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const record = sanitizeRecord(input);
  await redis([
    ["RPUSH", STORE_KEY, JSON.stringify(record)],
    ["LTRIM", STORE_KEY, -MAX_RECORDS, -1]
  ]);
  return json({ saved: true, id: record.id }, 201);
}

async function handleGet(request) {
  const expected = process.env.RESULTS_ADMIN_KEY;
  const supplied = request.headers.get("authorization");
  if (!expected || supplied !== `Bearer ${expected}`) {
    return json({ error: "Unauthorized" }, 401);
  }

  const result = await redis([["LRANGE", STORE_KEY, 0, -1]]);
  const records = (result[0].result || []).map((value) => JSON.parse(value));
  return json({ count: records.length, records });
}

export default {
  async fetch(request) {
    try {
      if (request.method === "POST") return await handlePost(request);
      if (request.method === "GET") return await handleGet(request);
      return json({ error: "Method not allowed" }, 405);
    } catch (error) {
      console.error(error);
      return json({ error: "Unable to store results" }, 503);
    }
  }
};
