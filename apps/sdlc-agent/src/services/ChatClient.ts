export interface ChatSession {
  session_id: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  context_type: string;
  created_at: string;
  websocket_url: string;
  message_count: number;
  progress: number;
}

export interface ChatMessage {
  message_id: string;
  session_id: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: string;
  requires_response?: boolean;
  options?: string[];
  message_type: 'question' | 'answer' | 'info' | 'error';
}

interface WebSocketMessage {
  type: 'user_message' | 'bot_message' | 'session_update' | 'error';
  session_id: string;
  data: any;
  timestamp: string;
}

interface SessionConfig {
  max_questions?: number;
  timeout_minutes?: number;
  auto_finalize?: boolean;
  temperature?: number;
  model?: string;
}

export class ChatClient {
  private sessionId: string;
  private ws: WebSocket | null = null;
  private messageCallbacks: ((message: ChatMessage) => void)[] = [];
  private statusCallbacks: ((status: any) => void)[] = [];

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`ws://localhost:8000/ws/chat/${this.sessionId}`);

        this.ws.onopen = () => {
          console.log('Connected to chat session:', this.sessionId);
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('Disconnected from chat session');
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(message: WebSocketMessage) {
    switch (message.type) {
      case 'bot_message':
        this.messageCallbacks.forEach(cb => cb({
          message_id: message.data.message_id || '',
          session_id: this.sessionId,
          sender: 'bot',
          content: message.data.content,
          timestamp: message.data.timestamp || new Date().toISOString(),
          requires_response: message.data.requires_response,
          options: message.data.options,
          message_type: message.data.message_type || 'info'
        }));
        break;

      case 'session_update':
        this.statusCallbacks.forEach(cb => cb(message.data));
        break;

      case 'error':
        console.error('Chat error:', message.data);
        break;
    }
  }

  sendMessage(content: string, messageType: string = 'answer') {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        type: 'user_message',
        content: content,
        message_type: messageType
      };

      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket not connected');
    }
  }

  pauseSession() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'session_action',
        action: 'pause'
      }));
    }
  }

  resumeSession() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'session_action',
        action: 'resume'
      }));
    }
  }

  cancelSession() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'session_action',
        action: 'cancel'
      }));
    }
  }

  onMessage(callback: (message: ChatMessage) => void) {
    this.messageCallbacks.push(callback);
  }

  onStatusUpdate(callback: (status: any) => void) {
    this.statusCallbacks.push(callback);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Helper function to create chat sessions
export async function createChatSession(
  contextType: string,
  initialContext: any,
  sessionConfig?: SessionConfig
): Promise<ChatSession> {
  const response = await fetch('http://localhost:8000/api/chat/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      context_type: contextType,
      initial_context: initialContext,
      session_config: {
        max_questions: 10,
        timeout_minutes: 30,
        auto_finalize: true,
        temperature: 0.7,
        model: "gpt-4o-mini",
        ...sessionConfig
      },
      user_id: "galaxy-sdlc-user"
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to create chat session: ${response.statusText}`);
  }

  return await response.json();
}

export type { ChatSession, ChatMessage, WebSocketMessage, SessionConfig };