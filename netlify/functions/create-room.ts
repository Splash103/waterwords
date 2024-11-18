import { Handler } from '@netlify/functions';
import Pusher from 'pusher';

// Initialize Pusher with environment variables
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true
});

console.log('Pusher App ID:', process.env.PUSHER_APP_ID);
console.log('Pusher Key:', process.env.PUSHER_KEY);
console.log('Pusher Secret:', process.env.PUSHER_SECRET);
console.log('Pusher Cluster:', process.env.PUSHER_CLUSTER);

export const handler: Handler = async (event) => {
  console.log('Received create-room event:', event);

  // Check if the HTTP method is POST
  if (event.httpMethod !== 'POST') {
    console.log('Invalid HTTP method. Expected POST.');
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Parse room data from the request body
    const { roomData } = JSON.parse(event.body || '{}');
    console.log('Parsed room data:', roomData);

    // Trigger a 'room-created' event in Pusher
    await pusher.trigger(`room-${roomData.id}`, 'room-created', roomData);
    console.log('Room created successfully with data:', roomData);

    // Return success response
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, roomData })
    };
  } catch (error) {
    console.error('Error in create-room function:', error);

    // Return error response
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create room' })
    };
  }
};
