import { uid } from '../util/security';

export class Packet<T = {}> implements IPacket<T> {
  public id: string;
  public protocol: PacketProtocol;
  public ref?: string;
  public data?: T;

  public get resMeta() {
    return {
      ref: this.id,
      protocol: PacketProtocol.RESPONSE
    } as IPacketOptions<T>;
  }

  constructor(options: IPacketOptions<T>) {
    this.id = options.id || uid();
    this.protocol = options.protocol || PacketProtocol.RAW;
    this.ref = options.ref;
    this.data = options.data;
  }

  public toString(): string {
    return JSON.stringify({
      id: this.id,
      ref: this.ref,
      protocol: this.protocol,
      data: this.data,
    } as IPacket<T>);
  }

  public static raw(data: string) {
    return new Packet<string>({ data, protocol: PacketProtocol.RAW });
  }

  public static fromString<T = {}>(str: string): Packet<T> {
    return new Packet<T>(JSON.parse(str));
  }
}

export interface IPacket<T = {}> {
  id: string;
  protocol: PacketProtocol;
  ref?: string;
  data?: T;
}

export interface IPacketOptions<T> {
  id?: string;
  protocol?: PacketProtocol;
  ref?: string;
  data?: T;
}

export enum PacketProtocol {
  RAW,
  REQUEST,
  RESPONSE
}
