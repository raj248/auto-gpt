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

import { Router } from "express";
const router = Router() as Router;

router.get("/", (req, res) => {
  res.send("Hello World!");
  getResponse("Tell me something about yourself");
});

// post /batch , recieves array of {id, prompt} , returns {id, prompt, response}
router.post("/batch", async (req, res) => {
  const batch = req.body;
  const responses = await Promise.all(
    batch.map(async ({ id, prompt }: { id: string; prompt: string }) => {
      const response = await getResponse(prompt);
      return { id, prompt, response };
    })
  );
  // console.log(responses);
  res.json(responses);
});

export default router;
