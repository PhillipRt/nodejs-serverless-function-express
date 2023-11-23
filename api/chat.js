import OpenAI from 'openai';

const openai = new OpenAI(process.env.OPENAI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { sessionId, message } = req.body;
    let threadId = req.session[sessionId]; // Adjust this line to match your session management

    if (!threadId) {
      // If no thread exists for the session, create a new one
      const newThreadResponse = await openai.beta.threads.create({
        assistant: 'asst_3zg4c6e06kydn93j3yolP4TK', // Your assistant ID
        messages: [{ role: "user", content: message }]
      });
      threadId = newThreadResponse.id;
      req.session[sessionId] = threadId; // Adjust this line to match your session management
    } else {
      // If a thread exists, add a message to it
      await openai.beta.threads.messages.create(threadId, {
        assistant: 'asst_3zg4c6e06kydn93j3yolP4TK', // Your assistant ID
        role: 'user',
        content: message
      });
    }

    // Run the assistant to get a response
const run = await openai.beta.threads.runs.create(
  threadId,
  { 
    assistant_id: "asst_3zg4c6e06kydn93j3yolP4TK"
  }
);

    // Extract the assistant's response
    const messages = await openai.beta.threads.messages.list(
  threadId
); 

    res.status(200).json({ answer: messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
}