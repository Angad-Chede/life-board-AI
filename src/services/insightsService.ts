/**
 * AI Insights Service (Google Gemini Edition)
 * -------------------------------------------
 * Calls the Google Gemini API (gemini-1.5-flash) to generate personalized
 * productivity insights and motivational quotes based on the user's task & habit data.
 *
 * Features:
 *  - Daily refresh limit of 4 API calls per day to manage rate limits & costs.
 *  - Cycling of cached insights for the day once the limit is reached.
 *  - Graceful fallback when the API key is missing or the call fails.
 *  - Structured prompt engineering for actionable, concise insights & quotes.
 */

// ── Types ──────────────────────────────────────────────────────────
export interface InsightData {
  insights: string[];
  generatedAt: number; // epoch ms
  apiCallsToday: number;
  maxCallsPerDay: number;
  limitReached: boolean;
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

interface DailyInsightsState {
  date: string; // "YYYY-MM-DD"
  apiCallsToday: number; // starts at 0, max 4
  sets: string[][]; // Array of generated insight arrays, max 4
  currentSetIndex: number; // for cycling through cached sets once limit is hit
  lastActiveSet: string[]; // the currently shown insights
  lastGeneratedAt: number; // timestamp
}

// ── Constants ──────────────────────────────────────────────────────
const STATE_KEY = 'lifeboard_ai_insights_state';
const MAX_CALLS_PER_DAY = 4;
const GEMINI_MODEL = 'gemini-1.5-flash';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes cache for normal loads

// ── Helpers ────────────────────────────────────────────────────────

function getApiKey(): string | null {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  return key && key !== 'YOUR_GEMINI_API_KEY_HERE' ? key : null;
}

function getTodayDateString(): string {
  const tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
  const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
  return localISOTime; // "YYYY-MM-DD" in local timezone
}

function getInsightsState(): DailyInsightsState {
  const today = getTodayDateString();
  const defaultState: DailyInsightsState = {
    date: today,
    apiCallsToday: 0,
    sets: [],
    currentSetIndex: 0,
    lastActiveSet: [],
    lastGeneratedAt: 0,
  };

  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return defaultState;
    const parsed: DailyInsightsState = JSON.parse(raw);
    
    // If the cached date is different from today, reset the state
    if (parsed.date !== today) {
      return defaultState;
    }
    return parsed;
  } catch {
    return defaultState;
  }
}

function saveInsightsState(state: DailyInsightsState): void {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full - silently ignore
  }
}

/** Build the prompt for Gemini */
function buildPrompt(tasks: TaskSummary, habits: HabitSummary): string {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });

  return `You are an expert productivity coach embedded in a personal dashboard app called LifeBoard AI.
Your job is to analyze the user's task and habit data and produce exactly 3 short, encouraging items:
- 2 of the items must be highly actionable productivity insights based on user's tasks & habits data. Reference actual numbers from the data.
- 1 of the items must be an inspiring/motivational quote tailored to the user's current context.

Rules:
- Each item must be a single sentence (max 25 words).
- Be specific — reference actual numbers from the data (e.g. "You've completed 4 of 7 tasks...").
- Do NOT use emojis, markdown, or bullet markers.
- Return ONLY a JSON array of 3 strings. No other text.

Current time: ${dayOfWeek}, ${hour}:00 (${hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'})

Tasks:
- Total tasks: ${tasks.total}
- Completed tasks: ${tasks.completed} (${tasks.total > 0 ? Math.round((tasks.completed / tasks.total) * 100) : 0}%)
- High priority pending: ${tasks.highPriority}
- Overdue tasks: ${tasks.overdue}
- Recent task names: ${tasks.titles.slice(0, 5).join(', ') || 'none'}

Habits:
- Total active habits: ${habits.total}
- Habits completed today: ${habits.completedToday}
- Current habit streaks: ${habits.streaks.join(', ') || 'none'}
- Active habit names: ${habits.names.slice(0, 5).join(', ') || 'none'}

Generate 3 insights/quotes as a JSON array of strings:`;
}

// ── Main export ────────────────────────────────────────────────────

/**
 * Fetch AI-generated insights via Google Gemini.
 * @param forceRefresh  bypass cache (counts towards daily limit if limit is not reached)
 */
export async function fetchAIInsights(
  tasks: TaskSummary,
  habits: HabitSummary,
  forceRefresh = false,
): Promise<InsightData | null> {
  const apiKey = getApiKey();
  const state = getInsightsState();

  // 1. If not a force refresh, see if we have a fresh cached active set
  if (!forceRefresh && state.lastActiveSet.length > 0 && (Date.now() - state.lastGeneratedAt < CACHE_TTL_MS)) {
    return {
      insights: state.lastActiveSet,
      generatedAt: state.lastGeneratedAt,
      apiCallsToday: state.apiCallsToday,
      maxCallsPerDay: MAX_CALLS_PER_DAY,
      limitReached: state.apiCallsToday >= MAX_CALLS_PER_DAY,
    };
  }

  // 2. If limit reached, cycle through the already generated sets for today
  if (state.apiCallsToday >= MAX_CALLS_PER_DAY && state.sets.length > 0) {
    const nextIndex = (state.currentSetIndex + 1) % state.sets.length;
    state.currentSetIndex = nextIndex;
    state.lastActiveSet = state.sets[nextIndex];
    state.lastGeneratedAt = Date.now();
    saveInsightsState(state);

    return {
      insights: state.lastActiveSet,
      generatedAt: state.lastGeneratedAt,
      apiCallsToday: state.apiCallsToday,
      maxCallsPerDay: MAX_CALLS_PER_DAY,
      limitReached: true,
    };
  }

  // 3. Check for API key before making the call
  if (!apiKey) {
    console.warn('[LifeBoard] No VITE_GEMINI_API_KEY found — using fallback insights.');
    return null;
  }

  // 4. Call Google Gemini API
  const prompt = buildPrompt(tasks, habits);
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  try {
    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('[LifeBoard] Gemini API error:', res.status, errBody);
      return null;
    }

    const json = await res.json();
    let content: string = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';

    // Strip markdown code blocks if present
    if (content.startsWith('```')) {
      content = content.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    }

    const parsed: string[] = JSON.parse(content);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      console.error('[LifeBoard] Unexpected Gemini response shape:', content);
      return null;
    }

    // Update state with new successful call
    const newInsights = parsed.slice(0, 3);
    state.apiCallsToday += 1;
    state.sets.push(newInsights);
    state.lastActiveSet = newInsights;
    state.currentSetIndex = state.sets.length - 1;
    state.lastGeneratedAt = Date.now();
    saveInsightsState(state);

    return {
      insights: newInsights,
      generatedAt: state.lastGeneratedAt,
      apiCallsToday: state.apiCallsToday,
      maxCallsPerDay: MAX_CALLS_PER_DAY,
      limitReached: state.apiCallsToday >= MAX_CALLS_PER_DAY,
    };
  } catch (err) {
    console.error('[LifeBoard] Failed to fetch AI insights from Gemini:', err);
    // If the API failed but we already have some sets generated today, fall back to cycling them
    if (state.sets.length > 0) {
      const nextIndex = (state.currentSetIndex + 1) % state.sets.length;
      state.currentSetIndex = nextIndex;
      state.lastActiveSet = state.sets[nextIndex];
      state.lastGeneratedAt = Date.now();
      saveInsightsState(state);
      return {
        insights: state.lastActiveSet,
        generatedAt: state.lastGeneratedAt,
        apiCallsToday: state.apiCallsToday,
        maxCallsPerDay: MAX_CALLS_PER_DAY,
        limitReached: state.apiCallsToday >= MAX_CALLS_PER_DAY,
      };
    }
    return null;
  }
}

/** Clear the cached insights state (e.g. on logout). */
export function clearInsightsCache(): void {
  try {
    localStorage.removeItem(STATE_KEY);
  } catch {
    // ignore
  }
}

/** Returns true if a valid Gemini API key is configured. */
export function isInsightsConfigured(): boolean {
  return getApiKey() !== null;
}
