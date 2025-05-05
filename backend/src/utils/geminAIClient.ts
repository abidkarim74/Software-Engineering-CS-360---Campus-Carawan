import { GoogleGenerativeAI, Part } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_DEFAULT_KEY");


export const checkForInappropriateContent = async (messageStrings: string[]): Promise<"yes" | "no"> => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0, 
        maxOutputTokens: 2, 
      },
    });

    const prompt = `Review these messages and respond strictly with "yes" if any contain inappropriate content 
    (harassment, hate speech, sexually explicit content, or dangerous content) or "no" if all are clean:\n\n
    ${messageStrings.join("\n")}\n\n
    Answer:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().toLowerCase().trim();

    if (text === "yes" || text === "y") {
      return "yes";
    }
    return "no"; 
  } catch (err) {
    console.error("Gemini API error:", err);
   
    return "yes";
  }
};