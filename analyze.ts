import zxcvbn from "zxcvbn";
export interface Analysis {
  score: number;
  shannonBitsPerCharacter: number;
  empiricalBits: number;
  log10Guesses: number;
  patterns: string[];
  suggestions: string[];
  offlineGpuSeconds: number;
  offlineDictionarySeconds: number;
}
export function analyze(password: string): Analysis {
  if (password.length > 4096)
    throw new Error("Password analysis input is too large.");
  const characters = Array.from(password),
    counts = new Map<string, number>();
  for (const c of characters) counts.set(c, (counts.get(c) || 0) + 1);
  // Empirical Shannon H = -sum(p_i log2 p_i). This is a character-frequency statistic, NOT the entropy of a human's selection process.
  let h = 0;
  for (const n of counts.values()) {
    const p = n / characters.length;
    h -= p * Math.log2(p);
  }
  // Bound the pattern matcher to the first 256 code units to avoid pathological local CPU use; statistics still cover the entire input.
  const result = zxcvbn(password.slice(0, 256)),
    patterns = new Set<string>();
  for (const match of result.sequence as any[]) {
    if (match.pattern === "spatial") patterns.add("Keyboard walk");
    if (match.pattern === "repeat") patterns.add("Repeated sequence");
    if (match.pattern === "sequence") patterns.add("Predictable sequence");
    if (match.pattern === "dictionary")
      patterns.add(
        match.l33t
          ? "Dictionary word with leetspeak"
          : "Dictionary/common password",
      );
    if (match.pattern === "date") patterns.add("Date pattern");
  }
  const suggestions = [...result.feedback.suggestions];
  if (result.feedback.warning) suggestions.unshift(result.feedback.warning);
  if (!suggestions.length)
    suggestions.push(
      "Use a unique, randomly generated password or passphrase.",
    );
  // Illustrative model assumptions, not a guarantee: actual cost depends on the target's hash/KDF and attacker hardware.
  return {
    score: result.score,
    shannonBitsPerCharacter: h,
    empiricalBits: h * characters.length,
    log10Guesses: result.guesses_log10,
    patterns: [...patterns],
    suggestions,
    offlineGpuSeconds: result.guesses / 1e10,
    offlineDictionarySeconds: result.guesses / 1e8,
  };
}
