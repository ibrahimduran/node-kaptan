import 'mocha';
import { assert } from 'chai';

import { Kaptan, Network } from '../../build';

describe('Network/Network', function () {
  const kaptan = new Kaptan();
  kaptan.use(Network.Network);

  let network: Network.Network;
  let socket: Network.Socket;

  it('should spawn network service', function () {
    network = kaptan.services.spawn('Network') as Network.Network;
  });

  it('should connect to another network', function (done) {
    socket = network.connect('127.0.0.1', Network.Network.Options.PORT as number);
    socket.client.on('connect', () => done());
  });

  it('should transfer data between server and client', function (done) {
    network.once('packet', (socket: Network.Socket, pkt: Network.Packet) => {
      socket.send(pkt);
    });

    const packet = Network.Packet.raw('Hello, can you mirror this packet to me?');
    socket.send(packet);
    socket.on('packet', (pkt: Network.Packet) => {
      assert.equal(pkt.toString(), packet.toString());
      done();
    });
  });
});
