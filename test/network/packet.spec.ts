import 'mocha';
import { assert } from 'chai';

import { Packet, PacketProtocol } from '../../build/network';

describe('Network/Packet', function () {
  let packet: Packet;

  it('should create packet', function () {
    packet = new Packet({});
  });

  it('should convert to string', function () {
    const data = JSON.parse(packet.toString());
    ['id', 'protocol', 'ref', 'data'].forEach((key) => {
      assert.equal((data as any)[key], (packet as any)[key]);
    });
  });

  it('should convert from string', function () {
    const generated = Packet.fromString(packet.toString());

    ['id', 'protocol', 'ref', 'data'].forEach((key) => {
      assert.equal((generated as any)[key], (packet as any)[key]);
    });
  });

  it('should return response metadata of packet', function () {
    assert.equal(packet.resMeta.ref, packet.id);
    assert.equal(packet.resMeta.protocol, PacketProtocol.RESPONSE);
  });

  it('should generate raw packet', function () {
    const raw = Packet.raw('hello world');

    assert.equal(raw.protocol, PacketProtocol.RAW);
    assert.equal(raw.data, 'hello world');
  });
});
