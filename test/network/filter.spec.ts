import 'mocha';
import { assert } from 'chai';

import { Packet } from '../../build/network/packet';
import { PacketFilter } from '../../build/network/filter';

// TODO: automate filter testing

describe('Network/PacketFilter', function () {
  it('should filter packets correctly', function () {
    assert.equal(new PacketFilter((p) => parseInt(p.ref as string) > 1)
      .test(new Packet({ ref: '2' })), true, '#1');
    assert.equal(new PacketFilter((p) => parseInt(p.ref as string) > 1)
      .test(new Packet({ ref: '1' })), false, '#2');
    assert.equal(new PacketFilter().ref('xyz')
      .test(new Packet({ ref: 'xyz' })), true, '#3');
    assert.equal(new PacketFilter().ref('xyz')
      .test(new Packet({ ref: 'abc' })), false, '#4');
    assert.equal(new PacketFilter().data('xyz')
      .test(new Packet({ data: 'abc' })), false, '#5');
    assert.equal(new PacketFilter().data('xyz')
      .test(new Packet({ data: 'xyz' })), true), '#6';
    assert.equal(new PacketFilter().require('xyz')
      .test(new Packet({ data: 'xyz' })), false, '#7');
    assert.equal(new PacketFilter().require('xyz')
      .test(new Packet({ data: { xyz: 1 } })), true, '#8');
    assert.equal(new PacketFilter().protocol(0)
      .test(new Packet({ protocol: 1 })), false, '#9');
    assert.equal(new PacketFilter().protocol(1)
      .test(new Packet({ protocol: 1 })), true, '#10');
    assert.equal(new PacketFilter().id('123')
      .test(new Packet({ id: 123 as any })), false, '#11');
    assert.equal(new PacketFilter().id('123')
      .test(new Packet({ id: '123' })), true, '#12');
    assert.equal(new PacketFilter().ref('123').data('test')
      .test(new Packet({ ref: '123', data: 'test' })), true, '#13');
    assert.equal(new PacketFilter().ref('123').data('test')
      .test(new Packet({ ref: '', data: 'test' })), false, '#14');
  });

  it('should generate filter from literal object', function () {
    assert.equal(PacketFilter.from({ ref: 'xyz' })
      .test(new Packet({ ref: 'xyz' })), true, '#1');
    assert.equal(PacketFilter.from({ ref: 'xyz' })
      .test(new Packet({ ref: 'abc' })), false, '#2');
    assert.equal(PacketFilter.from({ data: 'test', ref: 'xyz' })
      .test(new Packet({ data: '', ref: 'xyz' })), false, '#3');
    assert.equal(PacketFilter.from({ data: 'test', ref: 'xyz' })
      .test(new Packet({ data: 'test', ref: 'xyz' })), true, '#4');
    assert.equal(PacketFilter.from({ data: { xyz: 5, abc: 6 }, ref: 'xyz' })
      .test(new Packet({ data: { xyz: '5', abc: 6 }, ref: 'xyz' })), true, '#5');
    assert.equal(PacketFilter.from({ data: { xyz: 5, abc: 6 }, ref: 'xyz' })
      .test(new Packet({ data: { xyz: 5, abc: 6 }, ref: 'xyz' })), true, '#6');
    assert.equal(PacketFilter.from({ data: { xyz: 5, abc: 6 }, ref: 'xyz' })
      .test(new Packet({ data: { xyz: '5', abc: 5 }, ref: 'xyz' })), false, '#7');
  });
});