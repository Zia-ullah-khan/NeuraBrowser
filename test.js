import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyCvM3WYZdi7fv841mMa3D6C907lSpZ9r00");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = "Translate Hi into Spanish";

async function generateWithRetry(prompt, retries = 3, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            const result = await model.generateContent(prompt);
            console.log("Translation:", result.response.text());
            return;
        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error.message);
            if (i < retries - 1) {
                console.log(`Retrying in ${delay / 1000} seconds...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
                console.error("All attempts failed.");
            }
        }
    }
}

generateWithRetry(prompt);
