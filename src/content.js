// Content module loader. Content is DATA ONLY — no executable code is
// imported from any pre-existing source. All three modules are pinned to
// their approved sources in PROVENANCE.md.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const load = (name) => JSON.parse(readFileSync(join(here, '..', 'content', name), 'utf8'));

export const framework = load('framework.json');   // CSR-1 (pre-existing, labeled)
export const scriptsData = load('scripts.json');   // CSR-2 (pre-existing, labeled)
export const safetyCopy = load('safety-copy.json'); // CSR-3 v0.2 FROZEN (pre-existing, labeled)

export const SPOKE_IDS = framework.wheel.map((s) => s.id);
export const STAGE_IDS = framework.cycle.map((s) => s.id);
export const SCRIPT_NUMBERS = scriptsData.records.map((r) => r.number);

export function getScript(number) {
  return scriptsData.records.find((r) => r.number === number) ?? null;
}
