export interface Task {
  id: number;
  text: string;
  category: string;
  urgency: 'high' | 'medium' | 'low';
  effort: string;
  energy: string;
  status?: string;
  due_date?: string;
}

export interface PriorityDetails {
  score: number;
  level: 'Critical' | 'High' | 'Important' | 'Normal' | 'Low';
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  explanation: string[];
  recommendedAction: string;
}

/**
 * Parses dynamic effort strings (like "3 hrs", "45 mins", "1h", "20m") into integer minutes.
 */
export function parseEffortToMinutes(effort: string): number {
  if (!effort) return 15;
  const normalized = effort.toLowerCase().trim();

  // "3 hrs", "1.5 hours", "1h"
  const hrMatch = normalized.match(/^(\d+(\.\d+)?)\s*(hrs?|hours?|h)$/);
  if (hrMatch) {
    return Math.round(parseFloat(hrMatch[1]) * 60);
  }

  // "45 mins", "20m", "15 minutes"
  const minMatch = normalized.match(/^(\d+)\s*(mins?|minutes?|m)$/);
  if (minMatch) {
    return parseInt(minMatch[1], 10);
  }

  const numOnly = parseInt(normalized, 10);
  return isNaN(numOnly) ? 15 : numOnly;
}

/**
 * Computes priority scoring parameters based on deadlines, effort, and categories.
 */
export function calculatePriority(task: Partial<Task>): PriorityDetails {
  let deadlinePoints = 0;
  let riskExplanation = 'No deadline set';
  let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';

  if (task.due_date) {
    const now = new Date();
    const due = new Date(task.due_date);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays < 0) {
      deadlinePoints = 40;
      riskExplanation = 'This task is overdue';
      riskLevel = 'Critical';
    } else if (diffDays <= 0.5) {
      deadlinePoints = 35;
      riskExplanation = 'Deadline is today';
      riskLevel = 'Critical';
    } else if (diffDays <= 1.5) {
      deadlinePoints = 30;
      riskExplanation = 'Deadline is tomorrow';
      riskLevel = 'High';
    } else if (diffDays <= 3) {
      deadlinePoints = 20;
      riskExplanation = 'Deadline is in less than 3 days';
      riskLevel = 'Medium';
    } else if (diffDays <= 7) {
      deadlinePoints = 10;
      riskExplanation = 'Deadline is in less than a week';
      riskLevel = 'Low';
    } else {
      deadlinePoints = 0;
      riskExplanation = 'Deadline is comfortable';
      riskLevel = 'Low';
    }
  }

  // Urgency weight
  let urgencyPoints = 5;
  if (task.urgency === 'high') urgencyPoints = 30;
  else if (task.urgency === 'medium') urgencyPoints = 15;

  // Effort weight
  const minutes = parseEffortToMinutes(task.effort || '');
  let effortPoints = 5;
  if (minutes > 120) effortPoints = 20;
  else if (minutes >= 60) effortPoints = 15;
  else if (minutes >= 30) effortPoints = 10;

  // Energy weight
  let energyPoints = 5;
  const energy = (task.energy || '').toLowerCase();
  if (energy.includes('high')) energyPoints = 10;
  else if (energy.includes('medium')) energyPoints = 7;
  else if (energy.includes('routine')) energyPoints = 5;
  else if (energy.includes('low')) energyPoints = 2;

  const score = Math.min(100, deadlinePoints + urgencyPoints + effortPoints + energyPoints);

  let level: 'Critical' | 'High' | 'Important' | 'Normal' | 'Low' = 'Low';
  if (score >= 80) level = 'Critical';
  else if (score >= 60) level = 'High';
  else if (score >= 40) level = 'Important';
  else if (score >= 20) level = 'Normal';

  // Construct structured explanations
  const explanation: string[] = [];
  if (task.due_date) {
    explanation.push(riskExplanation);
  }
  if (task.urgency === 'high') {
    explanation.push('User flagged as high priority');
  }
  if (minutes >= 60) {
    explanation.push(`Requires substantial focus block (${task.effort})`);
  }
  if (energy.includes('high')) {
    explanation.push('Requires high focus energy');
  }

  // Action recommendation
  let recommendedAction = 'Schedule a 15-minute quick pass to kickstart progress.';
  if (level === 'Critical' || level === 'High') {
    recommendedAction = `Allocate a focused ${Math.min(90, minutes)}-minute Zen block immediately.`;
  } else if (minutes >= 60) {
    recommendedAction = 'Decompose this large commitment into smaller sub-steps.';
  } else if (level === 'Important') {
    recommendedAction = 'Add this item to your today plan list.';
  }

  return {
    score,
    level,
    riskLevel,
    explanation,
    recommendedAction
  };
}

/**
 * Calculates if there is insufficient free time before deadline.
 * Generates an alert state if task effort exceeds available time slot window.
 */
export function calculateDeadlineRisk(task: Partial<Task>, availableHoursBeforeDeadline: number) {
  const effortMinutes = parseEffortToMinutes(task.effort || '');
  const effortHours = effortMinutes / 60;
  const isRisk = effortHours > availableHoursBeforeDeadline;

  return {
    isRisk,
    effortHours,
    availableHoursBeforeDeadline,
    riskLevel: isRisk ? (task.urgency === 'high' ? 'High' : 'Medium') : 'Low'
  };
}
