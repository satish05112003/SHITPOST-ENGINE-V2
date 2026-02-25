export async function POST(request) {
  const body = await request.json();

  const groqBody = {
    model: "llama-3.3-70b-versatile",
    max_tokens: 1000,
    messages: [
      { role: "system", content: body.system },
      ...body.messages,
    ],
  };

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify(groqBody),
  });

  const data = await response.json();
  
  const content = data.choices?.[0]?.message?.content || "";
  
  return Response.json({
    content: [{ type: "text", text: content }]
  });
}