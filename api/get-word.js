import OpenAI from "openai";

const levelDescriptions = {
  Beginner:
    "a very simple, common everyday word suitable for children (e.g. cat, ball, tree)",
  Intermediate: "a moderately common word that an average adult would know",
  Advanced: "an uncommon or sophisticated word that requires a good vocabulary",
  Expert:
    "a very rare, obscure, or highly technical word that most people would not know",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { level, timestamp } = req.body;

  if (!level || !levelDescriptions[level]) {
    return res.status(400).json({ error: "Invalid level" });
  }

  const openai = new OpenAI({
    apiKey: process.env.GITHUB_TOKEN,
    baseURL: "https://models.inference.ai.azure.com",
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `Give me ${levelDescriptions[level]} and its definition on a separate line. CRITICAL: You must pick a genuinely random word — do NOT default to the same common words you typically suggest. The English language has hundreds of thousands of words; explore the full breadth of it. Actively avoid words you have given before. The current timestamp is ${timestamp} — use this as a random seed to vary your selection every single time. Your entire response must use English characters only — do not include any characters from other scripts or languages. Don't say anything else except that, your response has to only have two lines. Example:\nAvuncular\nKind, friendly, and generous, especially to younger or less experienced people.`,
      },
    ],
    temperature: 1.5,
  });

  const lines = response.choices[0].message.content.split("\n");
  const word = lines[0].replace(/[^a-zA-Z]/g, "").toUpperCase();
  const hint = lines[1].trim();

  return res.status(200).json({ word, hint });
}
