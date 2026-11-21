#!/usr/bin/env node
import { runDailyVerseCron } from '../src/cron.js';

function parseArgs(): { date?: string; daysAhead?: number; force?: boolean } {
  const args = process.argv.slice(2);
  const options: { date?: string; daysAhead?: number; force?: boolean } = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--force' || arg === '-f') {
      options.force = true;
    } else if (arg === '--date' && args[i + 1]) {
      options.date = args[++i];
    } else if (arg === '--daysAhead' && args[i + 1]) {
      options.daysAhead = parseInt(args[++i], 10);
    }
  }

  return options;
}

try {
  const options = parseArgs();
  console.log('[CRON] Exécution du tirage du verset du jour...');
  const result = runDailyVerseCron(options);
  console.log(`[CRON] ${result.generated.length} verset(s) du jour vérifié(s) / généré(s) :`);
  console.log(result.summary);
  process.exit(0);
} catch (error) {
  console.error('[CRON] Échec de la génération du verset du jour :', error);
  process.exit(1);
}
