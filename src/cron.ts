import { getDailyVerse, type DailyVerseRecord } from './bible.js';

export interface CronDailyVerseOptions {
  date?: string;
  daysAhead?: number;
  force?: boolean;
}

export interface CronDailyVerseResult {
  generated: DailyVerseRecord[];
  summary: string;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Exécute la génération / vérification du verset du jour.
 * Idéal pour être appelé en tâche planifiée (cron-job), CLI ou tâche d'arrière-plan.
 */
export function runDailyVerseCron(options: CronDailyVerseOptions = {}): CronDailyVerseResult {
  const generated: DailyVerseRecord[] = [];
  const daysAhead = Math.max(options.daysAhead ?? 1, 0);

  if (options.date) {
    const record = getDailyVerse(options.date, options.force ?? false);
    generated.push(record);
  } else {
    const today = new Date();
    for (let offset = 0; offset <= daysAhead; offset++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + offset);
      const dateStr = formatDate(targetDate);
      const record = getDailyVerse(dateStr, options.force ?? false);
      generated.push(record);
    }
  }

  const summary = generated
    .map(r => `[${r.date}] ${r.bookName} ${r.chapter}:${r.number} - « ${r.text.slice(0, 40)}... »`)
    .join('\n');

  return {
    generated,
    summary,
  };
}

/**
 * Planificateur automatique intégré au serveur Hono.
 * S'exécute au démarrage puis chaque nuit à 00:00:05 pour garantir que le verset
 * du jour suivant est pré-généré et disponible sans délai.
 */
export function startDailyVerseScheduler(): { stop: () => void } {
  let timer: NodeJS.Timeout | null = null;
  let active = true;

  const scheduleNext = () => {
    if (!active) return;
    try {
      runDailyVerseCron({ daysAhead: 1 });
    } catch (err) {
      console.error('[CRON-DAILY-VERSE] Erreur lors de la génération automatique :', err);
    }

    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5);
    const msUntilMidnight = Math.max(nextMidnight.getTime() - now.getTime(), 1000);

    timer = setTimeout(() => {
      scheduleNext();
    }, msUntilMidnight);
  };

  // Exécution initiale
  scheduleNext();

  return {
    stop: () => {
      active = false;
      if (timer) clearTimeout(timer);
    },
  };
}
