// import { configureGenkit } from "genkit";
// import * as Genkit from "genkit";
// import { googleAI } from "@genkit-ai/googleai";
// const { configureGenkit } = Genkit;
// export const genkit = configureGenkit({
//   plugins: [
//     googleAI({
//       apiKey: process.env.GOOGLE_API_KEY!,
//     }),
//   ],
// });
// import Genkit from "genkit";
// import { googleAI } from "@genkit-ai/googleai";
// // Create a single Genkit instance
// export const genkit = Genkit({
//   plugins: [
//     googleAI({
//       apiKey: process.env.GOOGLE_API_KEY!,
//     }),
//   ],
// });
// import * as GenkitModule from "genkit";
// import { googleAI } from "@genkit-ai/googleai";
// // Destructure the Genkit class from the module
// const { Genkit } = GenkitModule;
// // Create a Genkit instance using `new`
// export const genkit = new Genkit({
//   plugins: [
//     googleAI({
//       apiKey: process.env.GOOGLE_API_KEY!,
//     }),
//   ],
// });
// import { genkit } from "genkit";
// import { googleAI } from "@genkit-ai/googleai";
// export const ai = genkit({
//   plugins: [
//     googleAI({
//       apiKey: process.env.GOOGLE_API_KEY!,
//     }),
//   ],
//   model: "gemini-1.5-flash-001", 
// });
// import { genkit } from "genkit";
// import { googleAI } from "@genkit-ai/googleai";
// export const ai = genkit({
//   plugins: [
//     googleAI({
//       apiKey: process.env.GOOGLE_API_KEY!,
//     }),
//   ],
//   model: "googleai/gemini-1.5-flash-001",
// });
// import { genkit } from "genkit";
// import { googleAI } from "@genkit-ai/googleai";
// export const ai = genkit({
//   plugins: [
//     googleAI({ apiKey: process.env.GOOGLE_API_KEY! }),
//   ],
//   model: "googleai/chat-bison-001", // works in v1beta
// });
// import { genkit } from "genkit";
// import { googleAI } from "@genkit-ai/googleai";
// export const ai = genkit({
//   plugins: [
//     googleAI({
//       apiKey: process.env.GOOGLE_API_KEY!,
//       apiVersion: "v1", // 
//     }),
//   ],
//   model: "googleai/gemini-1.5-flash",
// });
// import { genkit } from "genkit";
// import { googleAI } from "@genkit-ai/googleai";
// export const ai = genkit({
//   plugins: [
//     googleAI({
//       apiKey: process.env.GOOGLE_API_KEY!,
//       // v1beta is default
//     }),
//   ],
//   model: "googleai/chat-bison-001",
// });
// src/genkit.ts
// import * as GenkitModule from "genkit";
// import { googleAI } from "@genkit-ai/googleai";
// // Destructure the Genkit class
// const { Genkit } = GenkitModule;
// // Initialize Genkit with a supported public model
// export const ai = new Genkit({
//   plugins: [
//     googleAI({
//       apiKey: process.env.GOOGLE_API_KEY!, // Your public key
//       // v1beta is default; works with chat-bison-001
//     }),
//   ],
//   model: "googleai/chat-bison-001", // ✅ Publicly accessible model
// });
// console.log("Google API Key loaded:", !!process.env.GOOGLE_API_KEY);
// src/genkit.ts
import * as GenkitModule from "genkit";
import { googleAI } from "@genkit-ai/googleai";
const { Genkit } = GenkitModule;
// Initialize Genkit with a supported public model
export const ai = new Genkit({
    plugins: [
        googleAI({
            apiKey: process.env.GOOGLE_API_KEY, // Your new API key
        }),
    ],
    model: "googleai/chat-bison-001", // Public & working model
});
