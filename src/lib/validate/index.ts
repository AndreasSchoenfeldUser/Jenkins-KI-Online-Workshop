import type {
  Solution,
  ValidationResult,
  PromptCraftSolution,
  ClaudeMdBuilderSolution,
  CodeFillSolution,
  CodeOrderSolution,
  TerminalSimSolution,
  NodeMappingSolution,
  QuizSolution,
} from '../../types';
import { containsAny, matchesAny } from './normalize';

// ----------------------------------------------------------------------------
// prompt-craft: Prompt gegen Kriterien-Checkliste pruefen.
// ----------------------------------------------------------------------------
export function validatePromptCraft(sol: PromptCraftSolution, input: string): ValidationResult {
  const details = sol.criteria.map((c) => ({
    label: c.label,
    ok: containsAny(input, c.anyOf),
  }));
  const solved = input.trim().length > 0 && details.every((d) => d.ok);
  return {
    solved,
    details,
    message: solved
      ? 'Alle Kriterien erfüllt — guter, prüfbarer Prompt.'
      : 'Noch nicht alle Kriterien erfüllt.',
  };
}

// ----------------------------------------------------------------------------
// claude-md-builder: Reihenfolge der Bausteine + korrekte Stichpunkte.
// ----------------------------------------------------------------------------
export function validateClaudeMdBuilder(
  sol: ClaudeMdBuilderSolution,
  order: string[],
  selectedBullets: Record<string, string[]>,
): ValidationResult {
  const orderOk =
    order.length === sol.order.length && order.every((id, i) => id === sol.order[i]);

  const details: { label: string; ok: boolean }[] = [
    { label: 'Bausteine in korrekter Reihenfolge', ok: orderOk },
  ];

  for (const block of sol.blocks) {
    const chosen = new Set(selectedBullets[block.id] ?? []);
    const correctIds = block.bullets.filter((b) => b.correct).map((b) => b.id);
    const ok =
      correctIds.length === chosen.size &&
      correctIds.every((id) => chosen.has(id)) &&
      // keine falschen Stichpunkte ausgewaehlt
      [...chosen].every((id) => correctIds.includes(id));
    details.push({ label: `Stichpunkte „${block.title}“`, ok });
  }

  return { solved: details.every((d) => d.ok), details };
}

// ----------------------------------------------------------------------------
// code-fill: Luecken normalisiert/regex-tolerant vergleichen.
// ----------------------------------------------------------------------------
export function validateCodeFill(
  sol: CodeFillSolution,
  values: Record<number, string>,
): ValidationResult {
  const details = sol.blanks.map((b) => ({
    label: b.label,
    ok: matchesAny(values[b.id] ?? '', b.accept, b.regex),
  }));
  return { solved: details.every((d) => d.ok), details };
}

// ----------------------------------------------------------------------------
// code-order: Reihenfolge der Stages.
// ----------------------------------------------------------------------------
export function validateCodeOrder(sol: CodeOrderSolution, order: string[]): ValidationResult {
  const correct = sol.items.map((i) => i.id);
  const details = order.map((id, i) => {
    const item = sol.items.find((it) => it.id === id);
    return { label: `${i + 1}. ${item?.label ?? id}`, ok: correct[i] === id };
  });
  const solved = order.length === correct.length && correct.every((id, i) => order[i] === id);
  return { solved, details };
}

// ----------------------------------------------------------------------------
// terminal-sim: aktueller Schritt — passt der eingegebene Befehl?
// ----------------------------------------------------------------------------
export function matchTerminalStep(sol: TerminalSimSolution, stepIndex: number, command: string) {
  const step = sol.steps[stepIndex];
  if (!step) return { ok: false, output: '' };
  const ok = step.accept.some((pat) => {
    try {
      return new RegExp(pat, 'i').test(command.trim());
    } catch {
      return command.trim().toLowerCase() === pat.toLowerCase();
    }
  });
  return { ok, output: ok ? step.output : '' };
}

// ----------------------------------------------------------------------------
// node-mapping: Jede Stage dem richtigen Host/Label zuordnen.
// ----------------------------------------------------------------------------
export function validateNodeMapping(
  sol: NodeMappingSolution,
  mapping: Record<string, string>,
): ValidationResult {
  const details = sol.items.map((item) => ({
    label: item.label,
    ok: mapping[item.id] === item.targetId,
  }));
  return { solved: details.every((d) => d.ok), details };
}

// ----------------------------------------------------------------------------
// quiz: Single-/Multiple-Choice.
// ----------------------------------------------------------------------------
export function validateQuiz(sol: QuizSolution, selected: string[]): ValidationResult {
  const correctIds = sol.options.filter((o) => o.correct).map((o) => o.id);
  const sel = new Set(selected);
  const solved =
    sel.size === correctIds.length &&
    correctIds.every((id) => sel.has(id)) &&
    [...sel].every((id) => correctIds.includes(id));
  const details = sol.options.map((o) => ({
    label: o.text,
    ok: o.correct === sel.has(o.id),
  }));
  return { solved, details, message: sol.explanation };
}

// Bequemer Dispatcher fuer einfache (einwert-)Validierungen.
export function isSolutionKind<K extends Solution['kind']>(
  sol: Solution,
  kind: K,
): sol is Extract<Solution, { kind: K }> {
  return sol.kind === kind;
}
