import { Handler } from '@netlify/functions';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    console.log('Join room function called');
    
    if (!event.body) {
      throw new Error('No request body provided');
    }

    const { roomId, playerName, avatar } = JSON.parse(event.body);
    console.log('Join room request:', { roomId, playerName, avatar });

    // Validate required environment variables
    if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_KEY || 
        !process.env.PUSHER_SECRET || !process.env.PUSHER_CLUSTER) {
      console.error('Missing required Pusher environment variables');
      throw new Error('Server configuration error');
    }

    // Validate input
    if (!roomId || !playerName || !avatar) {
      throw new Error('Missing required fields');
    }

    const player = { name: playerName, avatar, score: 0, bubbles: 3 };
    console.log('Triggering player-joined event for room:', roomId);
    await pusher.trigger(`room-${roomId}`, 'player-joined', player);
    console.log('Successfully triggered player-joined event');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, player })
    };
  } catch (error) {
    console.error('Detailed error in join-room function:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to join room',
        details: error instanceof Error ? error.stack : undefined
      })
    };
  }
};