import {
  createServer,
  Server as NetServer,
  Socket as NetSocket
} from 'net';

import { Socket, Packet, PacketHandler, Address } from './';
import { Kaptan } from '../kaptan';
import { Service } from '../service';
import { Logger } from '../util';

export class Network extends Service {
  protected server: NetServer;
  protected clientLogger: Logger;
  protected serverLogger: Logger;

  constructor(kaptan: Kaptan, options = {}) {
    console.log('Network Options: ', options);
    super(kaptan, {
      PORT: process.env.PORT || 3333,
      ...options
    });

    this.clientLogger = this.logger.namespace('client');
    this.serverLogger = this.logger.namespace('server');
    
    this.server = createServer()
      .on('listening', () => this.logger.text('listening on ' + this.server.address().port))
      .listen(this.options.PORT);
    
    this.server.on('connection', this.onConnection.bind(this));
  }

  public addPacketHandler(handler: PacketHandler) {
    this.on('socket', (socket: Socket) => {
      socket.addPacketHandler(handler);
    });

    this.emit('addHandler', handler);
  }

  public removePacketHandler(handler: PacketHandler) {
    throw new Error('Not implemented');
  }

  // Outgoing connection - client
  public connect(addr: string, port: number): Socket {
    const socket = new Socket(new Address(addr, port));
    
    socket.on('connection', () => this.clientLogger.text(`connected to ${socket.remoteAddr.endpoint}`));
    socket.on('disconnect', () => this.clientLogger.text(`disconnected from ${socket.remoteAddr.endpoint}`));

    socket.on('packet', (packet: Packet) => {
      this.clientLogger.text(`incoming packet from ${socket.remoteAddr.endpoint}`);
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

    this.serverLogger.text(`incoming connection from ${socket.remoteAddr.endpoint}`);
    
    socket.on('connection', () => this.serverLogger.text(`connected to ${socket.remoteAddr.endpoint}`));
    socket.on('disconnect', () => this.serverLogger.text(`disconnected from ${socket.remoteAddr.endpoint}`));

    socket.on('packet', (packet: Packet) => {
      this.serverLogger.text(`incoming packet from ${socket.remoteAddr.endpoint}`);
    });

    socket.on('send', (packet: Packet) => {
      this.serverLogger.text(`sending packet to ${socket.remoteAddr.endpoint}`);
    });

    socket.on('disconnect', () => this.emit('disconnect', socket));
    socket.on('connection', () => this.emit('connection', socket));
    socket.on('packet', (packet) => this.emit('packet', socket, packet));
  }
}
