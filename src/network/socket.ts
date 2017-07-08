import { createConnection, Socket as NetSocket } from 'net';
import { EventEmitter } from 'events';

import { Logger } from '../util';
import { Address } from './address';
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
    
    this.client.on('data', (data) => {
      const packet = Packet.fromString(String(data));

      this.emit('packet', packet);
    });

    this.client.on('connect', () => this.emit('connection'));
    this.client.on('end', () => this.emit('disconnect'));
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
    this.client.write(packet.toString());

    if (packet.protocol === PacketProtocol.REQUEST) {
      return await this.wait((packet as Packet).resMeta);
    }

    return null;
  }

  public static fromNetSocket(netSock: NetSocket) {
    return new Socket(netSock);
  }
}
