import OpenAI from "openai";

const levelDescriptions = {
  Beginner:
    "a very simple, common everyday word suitable for children (e.g. cat, ball, tree)",
  Intermediate: "a moderately common word that an average adult would know",
  Advanced: "an uncommon or sophisticated word that requires a good vocabulary",
  Expert:
    "a very rare, obscure, or highly technical word that most people would not know",
};

const lengthRanges = {
  Beginner: [3, 6],
  Intermediate: [4, 8],
  Advanced: [5, 10],
  Expert: [7, 14],
};

const categories = [
  "nature", "science", "food", "history", "music", "sports",
  "medicine", "geography", "technology", "literature", "animals",
  "weather", "clothing", "architecture", "mythology",
];

const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const beginnerLetters = "ABCDEFGHIJKLMNOPRSTUVW";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { level } = req.body;

  if (!level || !levelDescriptions[level]) {
    return res.status(400).json({ error: "Invalid level" });
  }

  const pool = level === "Beginner" ? beginnerLetters : allLetters;
  const randomLetter = pool[Math.floor(Math.random() * pool.length)];
  const randomCategory =
    categories[Math.floor(Math.random() * categories.length)];
  const [min, max] = lengthRanges[level];
  const randomLength = Math.floor(Math.random() * (max - min + 1)) + min;

  const openai = new OpenAI({
    apiKey: process.env.GITHUB_TOKEN,
    baseURL: "https://models.inference.ai.azure.com",
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `Give me ${levelDescriptions[level]} related to the topic "${randomCategory}" that starts with the letter "${randomLetter}" and is around ${randomLength} letters long. Provide the word and its definition on a separate line. Your entire response must use English characters only — do not include any characters from other scripts or languages. Don't say anything else except that, your response has to only have two lines. Example:\nAvuncular\nKind, friendly, and generous, especially to younger or less experienced people.`,
      },
    ],
    temperature: 1,
  });

  const lines = response.choices[0].message.content.split("\n");
  const word = lines[0].replace(/[^a-zA-Z]/g, "").toUpperCase();
  const hint = lines[1].trim();

  return res.status(200).json({ word, hint });
}
