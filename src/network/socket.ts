import { createConnection, Socket as NetSocket } from 'net';
import { EventEmitter } from 'events';

import { Logger } from '../util';
import { Address } from './address';
import { Packet, PacketProtocol, IPacketOptions } from './packet';
import { IPacketFilter, PacketFilter } from './filter';
import { PacketHandler, IPacketHandler } from './handler';

export class Socket extends EventEmitter {
  protected static logger: Logger;
  
  public readonly remoteAddr: Address;
  public readonly client: NetSocket;

  constructor(remote: Address | NetSocket) {
    super();

    if (remote instanceof Address) {
      this.remoteAddr = remote;

      this.client = createConnection({
        port: this.remoteAddr.port,
        host: this.remoteAddr.addr
      });
    } else {
      this.remoteAddr = Address.fromNetSock(remote);
      
      this.client = remote;
    }

    this.bindNetSocket(this.client);
  }

  public bindNetSocket(netSock: NetSocket) {
    netSock.on('data', (chunk) => {
      let str = chunk.toString();
      let line = '';

      for (let i = 0, len = str.length; i < len; i++) {
        let chr = str[i];
        line += chr;

        if (/[\n\r]$/.test(chr)) {
          this.emit('line', this, line);
          this.emit('packet', this, Packet.fromString(line));
          line = '';
        }
      }
    });

    netSock.on('connect', () => this.emit('connection'));
    netSock.on('end', () => this.emit('disconnect'));
  }

  public addPacketHandler(handler: PacketHandler | IPacketHandler) {
    if (!(handler instanceof PacketHandler)) {
      handler = new PacketHandler(handler);
    }

    this.addListener('packet', (handler as PacketHandler).getOnParsedListener());
    this.addListener('line', (handler as PacketHandler).getOnReceiveListener());
  }

  public removePacketHandler(handler: PacketHandler) {
    this.removeListener('packet', handler.getOnParsedListener());
    this.removeListener('line', handler.getOnReceiveListener());
  }

  public wait(filter: IPacketFilter | PacketFilter): Promise<Packet<any>> {
    if (!(filter instanceof PacketFilter)) {
      filter = PacketFilter.from(filter);
    }

    return new Promise((resolve, reject) => {
      const handler = new PacketHandler({
        filter,
        onParsed: (socket, packet) => {
          resolve(packet);
          this.removePacketHandler(handler);
        }
      });

      this.addPacketHandler(handler);
    });
  }

  public async send(packet: Packet<any> | IPacketOptions<any> | string): Promise<Packet<any> | null> {
    if (typeof packet === 'string') {
      packet = Packet.raw(packet);
    } else if (!(packet instanceof Packet)) {
      packet = new Packet(packet);
    }

    this.emit('send', packet);
    this.client.write(String(packet.toString() + '\n'));

    if (packet.protocol === PacketProtocol.REQUEST) {
      return await this.wait((packet as Packet).resFilter);
    }

    return null;
  }

  public static fromNetSocket(netSock: NetSocket) {
    return new Socket(netSock);
  }
}
