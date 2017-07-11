import { Socket, Packet } from './';

export interface PacketHandler {
  onReceive? (this: Socket, data: string): any;
  onParsed? (this: Socket, packet: Packet): any;
}
