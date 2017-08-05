import 'mocha';
import { assert } from 'chai';

import { Packet } from '../../build/network/packet';
import { PacketHandler } from '../../build/network/handler';
import { PacketFilter } from '../../build/network/filter';

describe('Network/PacketHandler', function () {
  it('should filter packets correctly', function (done) {
    var complete = () => { complete = done; };

    const packet1 = new Packet({ ref: 'test', protocol: 0 });
    const packet2 = new Packet({ ref: 'test', protocol: 1 });
    const packet3 = new Packet({ ref: 'not test' });

    const handler = new PacketHandler({
      filter: { ref: 'test' },
      onParsed(socket: any, packet) {
        try {
          assert.equal(socket, 'socket');
          assert.equal(packet.toString(), packet1.toString());

          complete();
        } catch (err) {}
      },
      onReceive(socket: any, line: any) {
        try {
          assert.equal(socket, 'socket');
          assert.equal(line, packet1.toString());
          
          complete();
        } catch (err) {}
      }
    });

    handler.addFilter(new PacketFilter().protocol(0));
    
    const parsed = handler.getOnParsedListener();
    const received = handler.getOnReceiveListener();

    parsed('socket' as any, packet1);
    received('socket' as any, packet1.toString());
    parsed('socket' as any, packet2);
    received('socket' as any, packet2.toString());
    parsed('socket' as any, packet3);
    received('socket' as any, packet3.toString());
  });
});