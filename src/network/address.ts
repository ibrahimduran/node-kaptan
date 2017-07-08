import { Socket as NetSocket, isIP, isIPv4 } from 'net';

export class Address {
  public readonly addr: string;
  public readonly port: number;
  public readonly family: AddressFamily;

  public get endpoint() {
    if (this.family === AddressFamily.IPv4) {
      return `${this.addr}:${this.port}`;
    } else {
      return `[${this.addr}]:${this.port}`;
    }
  }

  constructor(addr: string, port: number) {
    if (!isIP(addr)) {
      throw(`Given address is not IPv4 neither IPv6: ${addr}`);
    }

    this.family = isIPv4(addr) ? AddressFamily.IPv4 : AddressFamily.IPv6;
    this.addr = addr;
    this.port = port;
  }

  public static get loopback() {
    return new Address('127.0.0.1', 3333);
  }

  public static get loopback6() {
    return new Address('::1', 3333);
  }

  public static fromNetSock(netSock: NetSocket) {
    return new Address(netSock.remoteAddress, netSock.remotePort);
  }
}

export enum AddressFamily {
  IPv4,
  IPv6
}
