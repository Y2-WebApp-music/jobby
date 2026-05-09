declare module "socket.io-client" {
  export type Socket = {
    auth?: unknown;
    connected?: boolean;
    disconnect: () => void;
    connect: () => void;
  };

  export function io(url: string, options?: unknown): Socket;
}
