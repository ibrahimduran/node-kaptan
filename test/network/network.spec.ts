import 'mocha';
import { assert } from 'chai';
import * as getPort from 'get-port';

import { Kaptan, Network } from '../../build';

describe('Network/Network', function () {
  const kaptan = new Kaptan();

  let PORT = 3333;
  let network: Network.Network;
  let socket: Network.Socket;

  before(async function () {
    PORT = await getPort();
    kaptan.use(Network.Network, { PORT });
  });

  it('should spawn network service', function () {
    network = kaptan.services.spawn('Network') as Network.Network;
  });

  it('should connect to another network', function (done) {
    socket = network.connect('127.0.0.1', PORT);
    socket.client.on('connect', () => done());
  });

  it('should transfer data between server and client', function (done) {
    network.once('packet', (sock: Network.Socket, pkt: Network.Packet) => {
      sock.send(pkt);
    });

    const packet = Network.Packet.raw('Hello, can you mirror this packet to me?');
    socket.send(packet);
    socket.once('packet', (pkt: Network.Packet) => {
      assert.equal(pkt.toString(), packet.toString());
      done();
    });
  });

  var myPacketHandlerData: any[] = [];
  var myPacketHandler: Network.PacketHandler;

  it('should add packet handler', function (done) {
    var complete = () => { complete = done; };

    myPacketHandler = {
      onReceive(raw: string) {
        myPacketHandlerData.push(raw);
        assert.notEqual(raw.indexOf('Foo Bar'), -1);
        complete();
      },
      onParsed(packet: Network.Packet) {
        myPacketHandlerData.push(packet);
        assert.equal(packet.data, 'Foo Bar');
        complete();
      }
    } as Network.PacketHandler;

    network.addPacketHandler(myPacketHandler);

    socket.send('Foo Bar');
  });

  // not implemented yet
  // it('should remove packet handler', function (done) {
  //   myPacketHandlerData = [];
    
  //   network.removePacketHandler(myPacketHandler);
  //   socket.send('Foo Bar');

  //   setTimeout(() => {
  //     if (myPacketHandlerData.length > 0) {
  //       throw new Error('packet handler data exists: ' + myPacketHandlerData);
  //     }

  //     done();
  //   }, 1000);
  // });
});
