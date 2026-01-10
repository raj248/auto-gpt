import OpenAI from "openai";
const client = new OpenAI();

export async function getResponse(input: string) {
  const response = await client.responses.create({
    model: "gpt-5-mini",
    input,
  });

  //   console.log(response.output_text);

  console.log(response.id);
  return response.output_text;
}

// In your terminal, first run:
// pnpm add ai @ai-sdk/xai

import { xai } from "@ai-sdk/xai";
import { generateText } from "ai";

import { response, Router } from "express";
const router = Router() as Router;

router.get("/", async (req, res) => {
  const result = await generateText({
    model: xai.responses("grok-4"),
    system: "You are Grok, a highly intelligent, helpful AI assistant.",
    prompt: "What is the meaning of life, the universe, and everything?",
  });

  console.log(result.text);

  res.send(result.text);
  // getResponse("Tell me something about yourself");
});

router.post("/batch", async (req, res) => {
  const { instruction, prompts } = req.body;

  if (!prompts || !Array.isArray(prompts)) {
    return res.status(400).json({ success: false, message: "Invalid prompts" });
  }

  console.log("Starting Stream");
  // Set headers for streaming
  res.setHeader("Content-Type", "application/x-ndjson");
  res.setHeader("Transfer-Encoding", "chunked");

  let lastResponseId: string | undefined = undefined;

  try {
    for (let i = 0; i < prompts.length; i++) {
      const item = prompts[i];

      const config: any = {
        model: xai("grok-4-1-fast-non-reasoning"),
        prompt: item.prompt,
      };

      if (lastResponseId) {
        config.providerOptions = {
          xai: { previousResponseId: lastResponseId },
        };
      } else {
        config.system = instruction;
      }

      const result = await generateText(config);
      lastResponseId = result.response.id;
      // console.log(result);

      // Send a progress chunk
      const progressUpdate = {
        index: i,
        total: prompts.length,
        status: "success",
        data: {
          id: item.id,
          prompt: item.prompt,
          response: result.text,
        },
      };

      console.log(progressUpdate);
      res.write(JSON.stringify(progressUpdate) + "\n");
    }
  } catch (error: any) {
    res.write(
      JSON.stringify({ status: "error", message: error.message }) + "\n"
    );
  } finally {
    res.end();
  }
});

// post /batch , recieves array of {id, prompt} , returns {id, prompt, response}
// router.post("/batch", async (req, res) => {
//   const batch = req.body;
//   const responses = await Promise.all(
//     batch.map(async ({ id, prompt }: { id: string; prompt: string }) => {
//       const response = await getResponse(prompt);
//       return { id, prompt, response };
//     })
//   );
//   // console.log(responses);
//   res.json(responses);
// });

export default router;
