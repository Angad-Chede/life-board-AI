/**
 * AI Insights Service
 * -------------------
 * Calls the OpenAI API (GPT-4o-mini) to generate personalized productivity
 * insights based on the user's task & habit data.
 *
 * Features:
 *  - localStorage caching with a configurable TTL (default 30 min)
 *  - Graceful fallback when the API key is missing or the call fails
 *  - Structured prompt engineering for actionable, concise insights
 */

// ── Types ──────────────────────────────────────────────────────────
export interface InsightData {
  insights: string[];
  generatedAt: number; // epoch ms
}

interface TaskSummary {
  total: number;
  completed: number;
  highPriority: number;
  overdue: number;
  titles: string[];
}

interface HabitSummary {
  total: number;
  completedToday: number;
  streaks: number[];
  names: string[];
}

// ── Constants ──────────────────────────────────────────────────────
const CACHE_KEY = 'lifeboard_ai_insights';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// ── Helpers ────────────────────────────────────────────────────────

function getApiKey(): string | null {
  const key = import.meta.env.VITE_OPENAI_API_KEY;
  return key && key !== 'YOUR_OPENAI_API_KEY_HERE' ? key : null;
}

function getCachedInsights(): InsightData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: InsightData = JSON.parse(raw);
    if (Date.now() - parsed.generatedAt < CACHE_TTL_MS) return parsed;
    return null; // expired
  } catch {
    return null;
  }
}

function cacheInsights(data: InsightData): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full – silently ignore
  }
}

/** Build the system + user prompt for GPT-4o-mini */
function buildPrompt(tasks: TaskSummary, habits: HabitSummary): { system: string; user: string } {
  const system = `You are an expert productivity coach embedded in a personal dashboard app called LifeBoard AI. 
Your job is to analyze the user's current task and habit data and produce exactly 3 short, actionable, encouraging insights.

Rules:
- Each insight must be a single sentence (max 25 words).
- Be specific — reference actual numbers from the data (e.g. "You've completed 4 of 7 tasks…").
- Vary the tone: one motivational, one analytical, one practical tip.
- Do NOT use emojis, markdown, or bullet markers.
- Return ONLY a JSON array of 3 strings. No other text.`;

  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });

  const user = `Current time: ${dayOfWeek}, ${hour}:00 (${hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'})

Tasks:
- Total: ${tasks.total}
- Completed: ${tasks.completed} (${tasks.total > 0 ? Math.round((tasks.completed / tasks.total) * 100) : 0}%)
- High priority pending: ${tasks.highPriority}
- Overdue: ${tasks.overdue}
- Recent titles: ${tasks.titles.slice(0, 5).join(', ') || 'none'}

Habits:
- Total active: ${habits.total}
- Completed today: ${habits.completedToday}
- Current streaks: ${habits.streaks.join(', ') || 'none'}
- Habit names: ${habits.names.slice(0, 5).join(', ') || 'none'}

Generate 3 insights as a JSON array of strings.`;

  return { system, user };
}

// ── Main export ────────────────────────────────────────────────────

/**
 * Fetch AI-generated insights.
 * Returns cached data if still fresh, otherwise calls OpenAI.
 * @param forceRefresh  bypass cache
 */
export async function fetchAIInsights(
  tasks: TaskSummary,
  habits: HabitSummary,
  forceRefresh = false,
): Promise<InsightData | null> {
  // 1. Try cache first
  if (!forceRefresh) {
    const cached = getCachedInsights();
    if (cached) return cached;
  }

  // 2. Check for API key
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('[LifeBoard] No VITE_OPENAI_API_KEY found — using fallback insights.');
    return null;
  }

  // 3. Call OpenAI
  const { system, user } = buildPrompt(tasks, habits);

  try {
    const res = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('[LifeBoard] OpenAI API error:', res.status, errBody);
      return null;
    }

    const json = await res.json();
    const content: string = json.choices?.[0]?.message?.content?.trim() ?? '';

    // Parse the JSON array from the response
    const parsed: string[] = JSON.parse(content);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      console.error('[LifeBoard] Unexpected OpenAI response shape:', content);
      return null;
    }

    const data: InsightData = {
      insights: parsed.slice(0, 3),
      generatedAt: Date.now(),
    };

    cacheInsights(data);
    return data;
  } catch (err) {
    console.error('[LifeBoard] Failed to fetch AI insights:', err);
    return null;
  }
}

/** Clear the cached insights (e.g. on logout). */
export function clearInsightsCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
}

/** Returns true if a valid OpenAI API key is configured. */
export function isInsightsConfigured(): boolean {
  return getApiKey() !== null;
}
