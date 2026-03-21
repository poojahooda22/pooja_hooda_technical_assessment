// templateParser.ts — Pure utility for template variable extraction
// No React dependencies. Testable with simple assertions.

const VAR_REGEX = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$.:-]*)\s*\}\}/g;

/**
 * Extract unique variable names from template text.
 * Matches {{ variableName }} patterns with valid JS identifiers.
 * Returns deduplicated array preserving first-occurrence order.
 */
/**
 * Extract argument names from a Python function definition.
 * Matches `def run(arg1, arg2):` and extracts ['arg1', 'arg2'].
 * Ignores `self`, `cls`, and default values.
 */
const PYTHON_DEF_REGEX = /def\s+\w+\s*\(([^)]*)\)/;

export const extractPythonArgs = (code: string): string[] => {
  if (!code) return [];
  const match = PYTHON_DEF_REGEX.exec(code);
  if (!match || !match[1].trim()) return [];
  return match[1]
    .split(',')
    .map((arg) => arg.trim().split('=')[0].split(':')[0].trim())
    .filter((arg) => arg && arg !== 'self' && arg !== 'cls');
};

/**
 * Remove all occurrences of {{varName}} from template text.
 * Handles optional whitespace inside braces.
 */
export const removeVariable = (text: string, varName: string): string => {
  const escaped = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\{\\{\\s*${escaped}\\s*\\}\\}`, 'g');
  return text.replace(pattern, '').replace(/\s{2,}/g, ' ').trim();
};

export const extractVariables = (text: string): string[] => {
  if (!text) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  let match: RegExpExecArray | null;
  // Reset lastIndex for global regex reuse
  VAR_REGEX.lastIndex = 0;
  while ((match = VAR_REGEX.exec(text)) !== null) {
    const varName = match[1];
    if (!seen.has(varName)) {
      seen.add(varName);
      result.push(varName);
    }
  }
  return result;
};
