import { Packet } from './packet';
import { IPacketFilter, PacketFilter } from './filter';
import { Socket } from './socket';
import { Events } from '../util/events';

export class PacketHandler {
  protected filters: PacketFilter[] = [];
  protected onParsedCallbacks: ((socket: Socket, packet: Packet) => void)[] = [];
  protected onReceiveCallbacks: ((socket: Socket, data: string) => void)[] = [];
  protected onParsedListener?: (socket: Socket, packet: Packet) => void;
  protected onReceiveListener?: (socket: Socket, data: string) => void;

  constructor(literal?: IPacketHandler) {
    if (literal) {
      if (literal.filter) {
        this.addFilter(literal.filter);
      }

      if (literal.onParsed) {
        this.onParsed(literal.onParsed);
      }

      if (literal.onReceive) {
        this.onReceive(literal.onReceive);
      }
    }
  }

  public addFilter(filter: IPacketFilter | PacketFilter) {
    if (!(filter instanceof PacketFilter)) {
      this.filters.push(PacketFilter.from(filter));
    } else {
      this.filters.push(filter);
    }
  }

  public onParsed(callback: (socket: Socket, packet: Packet) => void) {
    this.onParsedCallbacks.push(callback);

    return this;
  }

  public onReceive(callback: (socket: Socket, data: string) => void) {
    this.onReceiveCallbacks.push(callback);

    return this;
  }

  public getOnParsedListener() {
    if (!this.onParsedListener) {
      this.onParsedListener = (socket: Socket, packet: Packet) => {
        if (this.filters.every(filter => filter.test(packet))) {
          Events.runIntercepted([...this.onParsedCallbacks], socket, packet);
        }
      };
    }

    return this.onParsedListener;
  }

  public getOnReceiveListener() {
    if (!this.onReceiveListener) {
      this.onReceiveListener = (socket: Socket, data: string) => {
        Events.runIntercepted([...this.onReceiveCallbacks], socket, data);
      };
    }

    return this.onReceiveListener;
  }
}

export interface IPacketHandler {
  filter?: IPacketFilter | PacketFilter,
  onReceive? (socket: Socket, data: string): void;
  onParsed? (socket: Socket, packet: Packet): void;
}
