# Nudge: Testing Guide

This document describes the test suite structure, package integrations, mocking practices, and commands to run unit and component tests in Nudge.

---

## 1. Testing Framework Stack

Nudge uses **Vitest** for blazing-fast unit test execution, integrated with **React Testing Library** and **jsdom** for simulating browser DOM environments:
- **`vitest`**: Test runner.
- **`jsdom`**: Mock browser document object model.
- **`@testing-library/react`**: Component testing utilities.
- **`@testing-library/jest-dom`**: DOM-specific assertion helpers.

---

## 2. Configuration Files

- **[vite.config.ts](file:///C:/Users/Sidhi/.gemini/antigravity/scratch/nudge/vite.config.ts)**: Declares Vitest configuration and binds the jsdom setup entry.
- **[setup.ts](file:///C:/Users/Sidhi/.gemini/antigravity/scratch/nudge/src/test/setup.ts)**: Configures global test environments and extends jest assertions.

---

## 3. Test Suites

### A. Priority Engine Scoring Test (`src/test/priorityEngine.test.ts`)
Validates score algebra accuracy:
- Verifies deadline calculations (closer deadlines yield higher scores).
- Verifies urgency score mappings (`high` = 30 pts, `medium` = 15 pts, `low` = 5 pts).
- Verifies effort and energy index parse results.
- Verifies deadline risk warning flags.

### B. AI Planner Service Test (`src/test/aiService.test.ts`)
Validates AI recovery plan calculations:
- Verifies recovery steps yield exactly 3 recovery actions.
- Verifies context-aware nudges are generated appropriately.
- Verifies mock fallback statements when data structures are empty.

---

## 4. How to Run Tests

Ensure all dependencies are installed:
```bash
npm install
```

### Run Tests once
```bash
npm run test
```

### Run Tests in watch mode
```bash
npx vitest
```
