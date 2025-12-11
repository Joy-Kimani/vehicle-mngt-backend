// import { Hono } from "hono";
// import { ai } from "../genkit.js";
// import { carRentalPrompt } from "../prompts/carRentalPrompts.js";
// const chatRoute = new Hono();
// chatRoute.post("/", async (c) => {
//   const { message } = await c.req.json();
//   if (!message) {
//     return c.json({ error: "Message is required" }, 400);
//   }
//   try {
//     const response = await ai.generate({
//       system: carRentalPrompt,
//       prompt: message,
//     });
//     // ✅ FIX IS HERE
//     return c.json({
//       reply: response.text,
//     });
//   } catch (err) {
//     console.error("Chat error:", err);
//     return c.json({ error: "AI service unavailable" }, 500);
//   }
// });
// export default chatRoute;
// import { Hono } from "hono";
// import { ai } from "../genkit.js";
// import { carRentalPrompt } from "../prompts/carRentalPrompts.js";
// const chatRoute = new Hono();
// chatRoute.post("/", async (c) => {
//   try {
//     const { message } = await c.req.json();
//     if (!message) return c.json({ error: "Message is required" }, 400);
//     const response = await ai.generate({
//       system: carRentalPrompt,
//       prompt: message,
//     });
//     // Use getter, not function
//     return c.json({ reply: response.text });
//   } catch (err: any) {
//     console.error("AI generate failed:", err); // log full error
//     return c.json({ error: "AI service unavailable", details: err.message }, 500);
//   }
// });
// export default chatRoute;
// import { Hono } from "hono";
// import { ai } from "../genkit.js";
// import { carRentalPrompt } from "../prompts/carRentalPrompts.js";
// const chatRoute = new Hono();
// chatRoute.post("/", async (c) => {
//   try {
//     // Parse the incoming message
//     const { message } = await c.req.json();
//     if (!message) return c.json({ error: "Message is required" }, 400);
//     // Generate AI response safely
//     const response = await ai.generate({
//       model: "googleai/bison-001", // Public Google AI model
//       system: carRentalPrompt,
//       prompt: message,
//     });
//     return c.json({ reply: response.text });
//   } catch (err: any) {
//     console.error("Chat error:", err);
//     // Return a friendly error response
//     return c.json(
//       {
//         error: "AI service unavailable",
//         details: err?.message || "Unknown error",
//       },
//       500
//     );
//   }
// });
// export default chatRoute;
// import { Hono } from "hono";
// // import { GenerativeLanguageClient } from "@google/generative-ai";
// import * as genAI from "@google/generative-ai";
// // const client = new ({
// //   apiKey: process.env.GOOGLE_API_KEY
// // });
// const chatRoute = new Hono();
// // Initialize Google AI client
// const client = new genAI.TextServiceClient({
//   apiKey: process.env.GOOGLE_API_KEY, // Make sure this is set in your .env
// });
// // POST /api/chat
// chatRoute.post("/", async (c) => {
//   const { message } = await c.req.json();
//   if (!message) {
//     return c.json({ error: "Message is required" }, 400);
//   }
//   try {
//     const response = await client.generateText({
//       model: "models/bison-001", 
//       prompt: message,
//       temperature: 0.7,
//       maxOutputTokens: 300,
//     });
//     return c.json({ reply: response.candidates[0].output });
//   } catch (err: any) {
//     console.error("Chat error:", err);
//     return c.json(
//       { error: "AI service unavailable", details: err.message },
//       500
//     );
//   }
// });
// export default chatRoute;
// import { Hono } from "hono";
// import { TextServiceClient } from "@google/generative-ai";
// // Initialize client
// const client = new TextServiceClient({
//   apiKey: process.env.GOOGLE_API_KEY,
// });
// const chatRoute = new Hono();
// chatRoute.post("/", async (c) => {
//   const { message } = await c.req.json();
//   if (!message) {
//     return c.json({ error: "Message is required" }, 400);
//   }
//   try {
//     const response = await client.generateText({
//       model: "models/bison-001",
//       prompt: message,
//       temperature: 0.7,
//       maxOutputTokens: 300,
//     });
//     return c.json({ reply: response.candidates?.[0]?.output ?? "No response" });
//   } catch (err: any) {
//     console.error("Chat error:", err);
//     return c.json(
//       { error: "AI service unavailable", details: err.message },
//       500
//     );
//   }
// });
// export default chatRoute;
import { Hono } from "hono";
import { v1beta2 } from "@google-ai/generativelanguage";
const chatRoute = new Hono();
const client = new v1beta2.TextServiceClient();
chatRoute.post("/", async (c) => {
    const { message } = await c.req.json();
    if (!message) {
        return c.json({ error: "Message is required" }, 400);
    }
    try {
        const [response] = await client.generateText({
            model: "models/text-bison-001", // a public supported model
            prompt: { text: message },
            temperature: 0.7,
            maxOutputTokens: 300,
        });
        const reply = response.candidates?.[0]?.output ?? "No response";
        return c.json({ reply });
    }
    catch (err) {
        console.error("Chat error:", err);
        return c.json({ error: "AI service unavailable", details: err.message }, 500);
    }
});
export default chatRoute;
