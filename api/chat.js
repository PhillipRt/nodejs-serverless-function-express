import OpenAI from 'openai';

const openai = new OpenAI(process.env.OPENAI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { sessionId, message } = req.body;
    
    // Initialize sessionThreads as a simple in-memory store. This is not suitable for production.
    // In production, use a database or other persistent storage solutions.
    let threadId = sessionThreads[sessionId];

    if (!threadId) {
      // If no thread exists for the session, create a new one
      const newThreadResponse = await openai.beta.threads.create({
        messages: [{ role: "user", content: message }]
      });
      threadId = newThreadResponse.id;
      sessionThreads[sessionId] = threadId; // Store the thread ID in your session management system
    } else {
      // If a thread exists, add a message to it
      await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: message
      });
    }

    // Run the assistant to get a response
    const runResponse = await openai.beta.threads.runs.create(
      threadId,
      { 
        assistant_id: 'asst_3zg4c6e06kydn93j3yolP4TK'
      }
    );

    // Assuming the response contains the messages
    const messages = runResponse.messages;
    //const latestMessage = messages[messages.length - 1]; // Get the latest message, assuming it's the response

    res.status(200).json({ answer: messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
}

// Initialize this in your global scope if you don't have a persistent session store
const sessionThreads = {};
