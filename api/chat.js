import OpenAI from 'openai';

const openai = new OpenAI(process.env.OPENAI_API_KEY);

// A simple in-memory store to keep track of threads for each session
// In a production environment, you would use a database instead
const sessionThreads = {};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    // Retrieve the session ID and user message from the request
    // The session ID should be generated and managed by the frontend
    const { sessionId, message } = req.body;

    // Check if the session already has an associated thread
    let threadId = sessionThreads[sessionId];

    if (!threadId) {
      // If no thread exists, create a new one and store it
      const newThread = await openai.createThread({
        assistant: 'asst_3zg4c6e06kydn93j3yolP4TK', // Use the provided assistant ID
        messages: [{
          role: "user",
          content: message
        }]
      });
      threadId = newThread.data.id;
      sessionThreads[sessionId] = threadId;
    } else {
      // Add the user's message to the existing thread
      await openai.createMessage(threadId, {
        assistant: 'asst_3zg4c6e06kydn93j3yolP4TK', // Use the provided assistant ID
        role: 'user',
        content: message
      });
    }

    // Run the assistant to get a response
    const run = await openai.runAssistant(threadId, {
      assistant: 'asst_3zg4c6e06kydn93j3yolP4TK', // Use the provided assistant ID
    });

    // Retrieve the assistant's response
    const response = run.data.messages.find(m => m.role === 'assistant').content;

    // Return the assistant's response back to the frontend
    res.status(200).json({ answer: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
}
