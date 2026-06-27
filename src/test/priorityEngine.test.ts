import { describe, it, expect } from 'vitest';
import { parseEffortToMinutes, calculatePriority, calculateDeadlineRisk } from '../utils/priorityEngine';

describe('Priority Engine Utilities', () => {
  describe('parseEffortToMinutes', () => {
    it('should parse hours correctly', () => {
      expect(parseEffortToMinutes('3 hrs')).toBe(180);
      expect(parseEffortToMinutes('1.5 hr')).toBe(90);
      expect(parseEffortToMinutes('1h')).toBe(60);
    });

    it('should parse minutes correctly', () => {
      expect(parseEffortToMinutes('45 mins')).toBe(45);
      expect(parseEffortToMinutes('20m')).toBe(20);
      expect(parseEffortToMinutes('15 minutes')).toBe(15);
    });

    it('should fall back to default when empty or unparseable', () => {
      expect(parseEffortToMinutes('')).toBe(15);
      expect(parseEffortToMinutes('unknown')).toBe(15);
    });
  });

  describe('calculatePriority', () => {
    it('should calculate high score for overdue and urgent tasks', () => {
      const task = {
        text: 'Critical assignment',
        urgency: 'high' as const,
        effort: '3 hrs',
        energy: 'High focus',
        due_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Overdue by 1 day
      };

      const result = calculatePriority(task);
      expect(result.score).toBe(100); // 40 (overdue) + 30 (high urgency) + 20 (>2h effort) + 10 (high focus) = 100 max
      expect(result.level).toBe('Critical');
      expect(result.riskLevel).toBe('Critical');
      expect(result.explanation).toContain('This task is overdue');
    });

    it('should calculate lower score for low urgency comfortable tasks', () => {
      const task = {
        text: 'Routine sweep',
        urgency: 'low' as const,
        effort: '15 mins',
        energy: 'Low effort',
        due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() // Comfortably due in 10 days
      };

      const result = calculatePriority(task);
      expect(result.score).toBe(12); // 0 (comfortable) + 5 (low urgency) + 5 (<30m effort) + 2 (low effort energy) = 12
      expect(result.level).toBe('Low');
      expect(result.riskLevel).toBe('Low');
    });
  });

  describe('calculateDeadlineRisk', () => {
    it('should trigger risk if effort exceeds available hours', () => {
      const task = { effort: '3 hrs', urgency: 'high' as const };
      const result = calculateDeadlineRisk(task, 2); // 3 hours effort > 2 hours available
      expect(result.isRisk).toBe(true);
      expect(result.riskLevel).toBe('High');
    });

    it('should not trigger risk if available hours are sufficient', () => {
      const task = { effort: '30 mins', urgency: 'low' as const };
      const result = calculateDeadlineRisk(task, 5); // 0.5 hours effort <= 5 hours available
      expect(result.isRisk).toBe(false);
      expect(result.riskLevel).toBe('Low');
    });
  });
});
