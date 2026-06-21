import type { Exercise } from '../../types';
import { Quiz } from './types/Quiz';
import { PromptCraft } from './types/PromptCraft';
import { CodeFill } from './types/CodeFill';
import { CodeOrder } from './types/CodeOrder';
import { NodeMapping } from './types/NodeMapping';
import { TerminalSim } from './types/TerminalSim';
import { ClaudeMdBuilder } from './types/ClaudeMdBuilder';

// Waehlt anhand des Aufgabentyps die passende interaktive Komponente.
export function ExerciseRunner({ exercise }: { exercise: Exercise }) {
  switch (exercise.type) {
    case 'quiz':
      return <Quiz exercise={exercise} />;
    case 'prompt-craft':
      return <PromptCraft exercise={exercise} />;
    case 'code-fill':
      return <CodeFill exercise={exercise} />;
    case 'code-order':
      return <CodeOrder exercise={exercise} />;
    case 'node-mapping':
      return <NodeMapping exercise={exercise} />;
    case 'terminal-sim':
      return <TerminalSim exercise={exercise} />;
    case 'claude-md-builder':
      return <ClaudeMdBuilder exercise={exercise} />;
    default:
      return <p>Unbekannter Aufgabentyp.</p>;
  }
}

const TYPE_LABEL: Record<Exercise['type'], string> = {
  quiz: 'Quiz',
  'prompt-craft': 'Prompt formulieren',
  'code-fill': 'Code ergänzen',
  'code-order': 'Reihenfolge',
  'node-mapping': 'Zuordnung',
  'terminal-sim': 'Terminal-Simulation',
  'claude-md-builder': 'CLAUDE.md-Builder',
};

export const exerciseTypeLabel = (t: Exercise['type']) => TYPE_LABEL[t];
