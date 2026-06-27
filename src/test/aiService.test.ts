import { describe, it, expect } from 'vitest';
import { getRecoveryPlan, getActionableNudges } from '../services/aiService';
import type { Task } from '../utils/priorityEngine';

describe('AI Service Layer', () => {
  describe('getRecoveryPlan', () => {
    it('should generate academic recovery plan for assignment tasks', () => {
      const task: Task = {
        id: 1,
        text: 'Calculus assignment homework draft',
        category: 'Academics',
        urgency: 'high',
        effort: '2 hrs',
        energy: 'High focus'
      };

      const plan = getRecoveryPlan(task);
      expect(plan.length).toBe(3);
      expect(plan[0].day).toBe('Today');
      expect(plan[0].action).toContain('thesis');
    });

    it('should generate default recovery plan for standard tasks', () => {
      const task: Task = {
        id: 2,
        text: 'Clean room and organize desk',
        category: 'Personal',
        urgency: 'low',
        effort: '30m',
        energy: 'Low energy'
      };

      const plan = getRecoveryPlan(task);
      expect(plan[1].action).toContain('energy focus window');
    });
  });

  describe('getActionableNudges', () => {
    it('should provide complete suggestions if there are pending tasks', () => {
      const tasks: Task[] = [
        {
          id: 1,
          text: 'Project presentation slide audit',
          category: 'Work',
          urgency: 'high',
          effort: '3 hrs',
          energy: 'High focus',
          status: 'pending'
        }
      ];

      const nudges = getActionableNudges(tasks);
      expect(nudges.length).toBeGreaterThan(0);
      expect(nudges[0].context).toContain('deadline');
      expect(nudges[0].ctaText).toBe('Start focus session');
    });

    it('should return empty/break state nudges when all tasks are complete', () => {
      const tasks: Task[] = [
        {
          id: 1,
          text: 'Submit calc sheet',
          category: 'Academics',
          urgency: 'high',
          effort: '1 hr',
          energy: 'High focus',
          status: 'completed'
        }
      ];

      const nudges = getActionableNudges(tasks);
      expect(nudges[0].context).toBe('All tasks completed!');
      expect(nudges[0].ctaText).toBe('Start focus room');
    });
  });
});
