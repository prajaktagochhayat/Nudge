import type { Task } from '../utils/priorityEngine';

export interface RecoveryStep {
  day: string;
  action: string;
  duration: string;
  completed: boolean;
}

export interface ActionableNudge {
  context: string;
  whyItMatters: string;
  suggestedAction: string;
  duration: string;
  ctaText: string;
}

export interface DailyPlanItem {
  timeSlot: string;
  taskText: string;
  duration: string;
  priority: string;
}

/**
 * Generates an actionable recovery plan divided by days for overdue tasks.
 */
export function getRecoveryPlan(task: Task): RecoveryStep[] {
  const normalizedText = task.text.toLowerCase();
  
  if (normalizedText.includes('presentation') || normalizedText.includes('pitch')) {
    return [
      { day: 'Today', action: 'Create key outline slides and gather data assets', duration: '30 mins', completed: false },
      { day: 'Tomorrow', action: 'Draft presentation slide visual elements and speaker notes', duration: '60 mins', completed: false },
      { day: 'Next Day', action: 'Perform dry run practice pitch to verify timing flow', duration: '20 mins', completed: false }
    ];
  }
  
  if (normalizedText.includes('homework') || normalizedText.includes('calculus') || normalizedText.includes('assignment')) {
    return [
      { day: 'Today', action: 'Review prompt rubric instructions and outline key thesis questions', duration: '20 mins', completed: false },
      { day: 'Tomorrow', action: 'Draft first section calculations or introductory essay body', duration: '60 mins', completed: false },
      { day: 'Next Day', action: 'Check formulas, proofread draft, and submit final PDF file', duration: '30 mins', completed: false }
    ];
  }

  // Default fallback recovery plan
  return [
    { day: 'Today', action: 'Unblock the initial backlog and complete the first sub-step outline', duration: '25 mins', completed: false },
    { day: 'Tomorrow', action: 'Tackle the main effort bulk work during your high energy focus window', duration: '45 mins', completed: false },
    { day: 'Next Day', action: 'Finalize revisions, verify criteria matching, and check off completed', duration: '15 mins', completed: false }
  ];
}

/**
 * Generates proactive, contextual, and highly actionable suggestions.
 */
export function getActionableNudges(tasks: Task[]): ActionableNudge[] {
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  if (pendingTasks.length === 0) {
    return [{
      context: 'All tasks completed!',
      whyItMatters: 'You have protected your focus and completed your commitments today.',
      suggestedAction: 'Take a well-deserved break or reflect on goals.',
      duration: '10m',
      ctaText: 'Start focus room'
    }];
  }

  const nudges: ActionableNudge[] = [];

  // Look for high urgency or short effort tasks to nudge on
  const critical = pendingTasks.find(t => t.urgency === 'high');
  if (critical) {
    nudges.push({
      context: `Upcoming deadline for "${critical.text}"`,
      whyItMatters: 'This task demands attention to avoid missing a critical commitment.',
      suggestedAction: `Schedule a dedicated focus block today to finish the "${critical.text}" outline.`,
      duration: critical.effort,
      ctaText: 'Start focus session'
    });
  }

  const quickTask = pendingTasks.find(t => t.effort.includes('min') || t.effort.includes('m') && parseInt(t.effort) <= 30);
  if (quickTask) {
    nudges.push({
      context: `Quick win available: "${quickTask.text}"`,
      whyItMatters: 'Completing small actions early clears cognitive load and builds consistency.',
      suggestedAction: `Take 15 minutes right now to check off "${quickTask.text}" before your schedule fills.`,
      duration: quickTask.effort,
      ctaText: 'Mark complete'
    });
  }

  // Add default habit nudge
  nudges.push({
    context: 'Consistency check',
    whyItMatters: 'Daily small habits grow long-term focus plants.',
    suggestedAction: 'Water your Habit Garden by clicking the bloom plants to log today\'s progress.',
    duration: '2 mins',
    ctaText: 'View habits'
  });

  return nudges;
}

/**
 * AI service coordinator to manage queries.
 */
export const aiService = {
  getRecoveryPlan,
  getActionableNudges
};
