// import { flow } from "@genkit-ai/flow";
// import { genkit } from "../genkit.js";
// import { carRentalPrompt } from "../prompts/carRentalPrompts.js";

// export const chatFlow = flow(
//   {
//     name: "carRentalChatFlow",
//     inputSchema: {
//       type: "object",
//       properties: { message: { type: "string" } },
//       required: ["message"],
//     },
//     outputSchema: {
//       type: "object",
//       properties: { reply: { type: "string" } },
//     },
//   },
//   async ({ message }) => {
//     const response = await genkit.generate({
//       model: "googleai/gemini-1.5-flash",
//       system: carRentalPrompt,
//       prompt: message,
//     });

//     return { reply: response.text() };
//   }
// );

// import { defineFlow } from "genkit";
// import { genkit } from "../genkit.js";
// import { carRentalPrompt } from "../prompts/carRentalPrompts.js";

// export const chatFlow = defineFlow(
//   {
//     name: "carRentalChatFlow",
//     inputSchema: {
//       type: "object",
//       properties: { message: { type: "string" } },
//       required: ["message"],
//     },
//     outputSchema: {
//       type: "object",
//       properties: { reply: { type: "string" } },
//     },
//   },
//   async ({ message }) => {
//     const response = await genkit.generate({
//       model: "googleai/gemini-1.5-flash",
//       system: carRentalPrompt,
//       prompt: message,
//     });

//     return { reply: response.text() };
//   }
// );
