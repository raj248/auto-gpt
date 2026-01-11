import { xai } from "@ai-sdk/xai";
import { generateText } from "ai";
import { Router } from "express";
import { authenticateToken } from "./auth";

const router = Router() as Router;

router.post("/batch", authenticateToken, async (req, res) => {
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
        model: xai("grok-4-1-fast"),
        system: instruction,
        prompt: item.prompt,
      };

      if (lastResponseId) {
        config.providerOptions = {
          xai: { previousResponseId: lastResponseId },
        };
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

export default router;
