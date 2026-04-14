import { describe, it, expect } from "vitest";

describe("Nahya API Integration", () => {
  it("should connect to Nahya API and get a valid response", async () => {
    const apiKey = process.env.NAHYA_API_KEY;
    const apiBase = process.env.NAHYA_API_BASE;

    expect(apiKey).toBeDefined();
    expect(apiBase).toBeDefined();

    const response = await fetch(`${apiBase}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "nuha-2.0",
        messages: [{ role: "user", content: "مرحبا" }],
        max_tokens: 20,
      }),
    });

    expect(response.ok).toBe(true);
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    expect(data.choices).toBeDefined();
    expect(data.choices![0].message?.content).toBeTruthy();
  }, 30000);
});
