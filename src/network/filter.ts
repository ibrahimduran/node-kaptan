import { IPacketOptions, Packet, PacketProtocol } from './packet';

export class PacketFilter {
  private callbacks: ((packet: Packet) => boolean)[] = [];

  constructor(callback?: (packet: Packet) => boolean) {
    if (callback) {
      this.add.call(this, callback);
    }
  }

  public add(callback: (packet: Packet) => boolean): this {
    this.callbacks.push(callback);

    return this;
  }

  public id(val: string): this {
    this.add(packet => packet.id === val);

    return this;
  }

  public ref(val: string): this {
    this.add(packet => packet.ref == val);

    return this;
  }

  public protocol(protocol: PacketProtocol): this {
    this.add(packet => packet.protocol === protocol);

    return this;
  }

  public require(...keys: string[]): this {
    this.add(packet => keys.every(k => packet.data[k] !== undefined));

    return this;
  }

  public data(val: {[key: string]: any} | string): this {
    this.add(packet => (
      typeof val === 'string' ? packet.data === val : (
        Object.keys(val).every(k => packet.data[k] == val[k])
      )
    ));

    return this;
  }

  public test(packet: Packet): boolean {
    return this.callbacks.every(callback => callback(packet));
  }

  public static from(filterData: IPacketFilter): PacketFilter {
    const filter = new PacketFilter();

    if (filterData.id) {
      filter.id(filterData.id);
    }

    if (filterData.ref) {
      filter.ref(filterData.ref);
    }

    if (filterData.protocol) {
      filter.protocol(filterData.protocol);
    }

    if (filterData.data) {
      filter.data(filterData.data);
    }

    return filter;
  }
}

export type IPacketFilter = IPacketOptions;
