import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  public getSocket(): Socket {
    if (!this.socket) {
      const token = localStorage.getItem('ludo_token');
      this.socket = io({
        auth: { token },
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('⚡ Socket connected to Ludo server:', this.socket?.id);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('⚡ Socket disconnected:', reason);
      });

      this.socket.on('connect_error', (err) => {
        console.warn('⚡ Socket connection error:', err.message);
      });
    }

    return this.socket;
  }

  public updateAuthToken(token: string | null): void {
    if (this.socket) {
      this.socket.auth = { token };
      if (!this.socket.connected) {
        this.socket.connect();
      }
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
