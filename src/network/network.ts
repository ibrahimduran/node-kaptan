import {
  createServer,
  Server as NetServer,
  Socket as NetSocket
} from 'net';

import { Socket, Packet, PacketHandler, IPacketHandler, Address } from './';
import { Kaptan } from '../kaptan';
import { Service } from '../service';
import { Logger } from '../util';

export class Network extends Service {
  protected server: NetServer;
  protected clientLogger: Logger;
  protected serverLogger: Logger;

  constructor(kaptan: Kaptan, options = {}) {
    super(kaptan, {
      PORT: process.env.PORT || 3333,
      ...options
    });

    this.clientLogger = this.logger.namespace('client');
    this.serverLogger = this.logger.namespace('server');
    
    this.server = createServer()
      .on('listening', () => this.logger.text('listening on ' + this.server.address().port));
    
    this.server.on('connection', this.onConnection.bind(this));
  }


  public async start() {
    super.start();

    this.server.listen(this.options.PORT);
  }

  public stop() {
    super.stop();

    return new Promise<void>((resolve, reject) => {
      this.server.close(() => resolve());
    });
  }

  public addPacketHandler(handler: PacketHandler | IPacketHandler) {
    if (!(handler instanceof PacketHandler)) {
      handler = new PacketHandler(handler);
    }

    this.on('socket', (socket: Socket) => {
      socket.addPacketHandler(handler);
    });

    this.emit('addHandler', handler);
  }

  public removePacketHandler(handler: PacketHandler) {
    this.emit('removeHandler', handler);
  }

  // Outgoing connection - client
  public connect(addr: string, port: number): Socket {
    const socket = new Socket(new Address(addr, port));
    
    socket.on('connection', () => this.clientLogger.text(`connected to ${socket.remoteAddr.endpoint}`));
    socket.on('disconnect', () => this.clientLogger.text(`disconnected from ${socket.remoteAddr.endpoint}`));

    socket.on('packet', (sock) => {
      this.clientLogger.text(`incoming packet from ${sock.remoteAddr.endpoint}`);
    });

    socket.on('send', (packet: Packet) => {
      this.clientLogger.text(`sending packet to ${socket.remoteAddr.endpoint}`);
    });

    return socket;
  }

  // Incoming connection - server
  private onConnection(netSock: NetSocket) {
    const socket = Socket.fromNetSocket(netSock);
    this.emit('socket', socket);
    this.on('addHandler', handler => socket.addPacketHandler(handler));
    this.on('removeHandler', handler => socket.removePacketHandler(handler));

    this.serverLogger.text(`incoming connection from ${socket.remoteAddr.endpoint}`);
    
    socket.on('disconnect', () => {
      this.serverLogger.text(`disconnected from ${socket.remoteAddr.endpoint}`);
      this.emit('disconnect', socket);
    });

    socket.on('packet', (sock, packet) => {
      this.serverLogger.text(`incoming packet from ${sock.remoteAddr.endpoint}`);
      this.emit('packet', sock, packet);
    });

    socket.on('send', (packet: Packet) => {
      this.emit('send', socket, packet);
      this.serverLogger.text(`sending packet to ${socket.remoteAddr.endpoint}`);
    });
  }
}
