import { describe, it, expect } from 'vitest';
import { parseAiOutput } from '../src/validators/outputs.js';

describe('parseAiOutput', () => {
  it('parses valid JSON stripped of markdown fences', () => {
    const rawFenced = `\`\`\`json
{
  "answer": "Apply 2g/L of copper oxychloride early in the morning.",
  "action_steps": ["Spray leaves thoroughly", "Avoid overhead irrigation"],
  "warnings": ["Wear protective mask"],
  "consult_expert": false,
  "disclaimer": "Standard agronomic guidance."
}
\`\`\``;

    const parsed = parseAiOutput('followup', rawFenced);
    expect(parsed.answer).toBe('Apply 2g/L of copper oxychloride early in the morning.');
    expect(parsed.action_steps).toHaveLength(2);
    expect(parsed.consult_expert).toBe(false);
  });

  it('throws an error when output violates strict schema with extra fields or wrong types', () => {
    const invalid = JSON.stringify({
      answer: 12345, // should be string
      action_steps: 'wrong type',
      consult_expert: false
    });

    expect(() => parseAiOutput('followup', invalid)).toThrow(/validation/);
  });
});
