import PusherClient from 'pusher-js';
import { nanoid } from 'nanoid';
import { seaAnimals } from '../utils/seaAnimals';
import type { Room, LobbySettings } from '../types/game';

const pusher = new PusherClient('4f01dcaa6c0557231477', {
  cluster: 'us2',
  enabledTransports: ['ws', 'wss'], // Explicitly define transports
});

// Add connection event listeners
pusher.connection.bind('connected', () => {
  console.log('Connected to Pusher');
});

pusher.connection.bind('error', (err: any) => {
  console.error('Pusher connection error:', err);
});

pusher.connection.bind('disconnected', () => {
  console.log('Disconnected from Pusher');
});

pusher.connection.bind('state_change', (states: any) => {
  console.log('Pusher state changed:', states);
});

const DEFAULT_LOBBY_SETTINGS: LobbySettings = {
  maxPlayers: 4,
  difficulty: 'normal',
  turnTimeLimit: 30
};

export const createRoom = async (hostName: string, settings = DEFAULT_LOBBY_SETTINGS) => {
  try {
    console.log('Creating room with host:', hostName);
    const roomId = nanoid(6).toUpperCase();
    const randomAnimal = seaAnimals[Math.floor(Math.random() * seaAnimals.length)];
    
    const roomData: Room = {
      id: roomId,
      host: hostName,
      players: [{
        id: nanoid(),
        name: hostName,
        avatar: randomAnimal,
        score: 0,
        bubbles: 3
      }],
      settings,
      isPlaying: false
    };

    console.log('Room data created:', roomData);

    // Create room channel
    const channel = pusher.subscribe(`room-${roomId}`);
    
    channel.bind('pusher:subscription_succeeded', () => {
      console.log('Successfully subscribed to room channel');
    });

    channel.bind('pusher:subscription_error', (error: any) => {
      console.error('Error subscribing to room channel:', error);
    });

    // Trigger room creation event
    const response = await fetch('/.netlify/functions/create-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomData })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server error creating room:', errorData);
      throw new Error(errorData.error || 'Failed to create room');
    }

    const result = await response.json();
    console.log('Room creation response:', result);

    return { roomId, roomData };
  } catch (error) {
    console.error('Detailed error creating room:', error);
    throw new Error(`Failed to create room: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const joinRoom = async (roomId: string, playerName: string) => {
  try {
    console.log('Attempting to join room:', roomId, 'as player:', playerName);
    const channel = pusher.subscribe(`room-${roomId}`);
    
    channel.bind('pusher:subscription_succeeded', () => {
      console.log('Successfully subscribed to room channel for joining');
    });

    channel.bind('pusher:subscription_error', (error: any) => {
      console.error('Error subscribing to room channel for joining:', error);
    });

    const randomAnimal = seaAnimals[Math.floor(Math.random() * seaAnimals.length)];

    const response = await fetch('/.netlify/functions/join-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, playerName, avatar: randomAnimal })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server error joining room:', errorData);
      throw new Error(errorData.error || 'Failed to join room');
    }

    const result = await response.json();
    console.log('Join room response:', result);
    return result;
  } catch (error) {
    console.error('Detailed error joining room:', error);
    throw new Error(`Failed to join room: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const subscribeToRoom = (roomId: string, callbacks: {
  onPlayerJoined?: (player: any) => void;
  onGameStart?: () => void;
  onPlayerTurn?: (playerId: string) => void;
  onWordSubmitted?: (data: any) => void;
}) => {
  console.log('Setting up room subscription for:', roomId);
  const channel = pusher.subscribe(`room-${roomId}`);
  
  channel.bind('pusher:subscription_succeeded', () => {
    console.log('Successfully subscribed to room events');
  });

  Object.entries(callbacks).forEach(([event, callback]) => {
    if (callback) {
      const eventName = event.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
      console.log('Binding event:', eventName);
      channel.bind(eventName, (data: any) => {
        console.log('Received event:', eventName, 'with data:', data);
        callback(data);
      });
    }
  });
  
  return () => {
    console.log('Cleaning up room subscription');
    channel.unbind_all();
    pusher.unsubscribe(`room-${roomId}`);
  };
};