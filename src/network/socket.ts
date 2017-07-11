import { createConnection, Socket as NetSocket } from 'net';
import { EventEmitter } from 'events';

import { Logger } from '../util';
import { Address } from './address';
import { PacketHandler } from './handler';
import { Packet, PacketProtocol, IPacketOptions } from './packet';

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
          this.emit('line', line);
          this.emit('packet', Packet.fromString(line));
          line = '';
        }
      }
    });

    netSock.on('connect', () => this.emit('connection'));
    netSock.on('end', () => this.emit('disconnect'));
  }

  public addPacketHandler(handler: PacketHandler) {
    if (handler.onParsed) {
      this.addListener('packet', handler.onParsed);
    }

    if (handler.onReceive) {
      this.addListener('line', handler.onReceive);
    }
  }

  public removePacketHandler(handler: PacketHandler) {
    if (handler.onParsed) {
      this.removeListener('packet', handler.onParsed);
    }

    if (handler.onReceive) {
      this.removeListener('line', handler.onReceive);
    }
  }

  public async wait<T = {}>(options: IPacketOptions<T>) {
    return new Promise((resolve, reject) => {
      var listener = (packet: Packet) => {
        for (var key in options) {
          if ((options as any)[key] !== (packet as any)[key]) {
            return;
          }
        }

        this.client.removeListener('packet', listener);
        resolve(packet);
      }

      this.on('packet', listener.bind(this));
    });
  }

  public async send(packet: Packet<any> | IPacketOptions<any> | string) {
    if (typeof packet === 'string') {
      packet = Packet.raw(packet);
    } else if (!(packet instanceof Packet)) {
      packet = new Packet(packet);
    }

    this.emit('send', packet);
    this.client.write(String(packet.toString() + '\n'));

    if (packet.protocol === PacketProtocol.REQUEST) {
      return await this.wait((packet as Packet).resMeta);
    }

    return null;
  }

  public static fromNetSocket(netSock: NetSocket) {
    return new Socket(netSock);
  }
}
