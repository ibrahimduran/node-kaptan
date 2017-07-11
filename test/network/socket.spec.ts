import 'mocha';
import { assert } from 'chai';

import {
  createServer,
  createConnection,
  Socket as NetSocket,
  Server as NetServer
} from 'net';

import { Network } from '../../build';

describe('Network/Socket', function () {
  const PORT = 56743;

  let server: NetServer;
  let client: NetSocket;
  let socket: Network.Socket;

  before(function (done) {
    let completed = 0;
    let check = () => {
      completed++;
      if (completed == 2) {
        done();
      }
    };

    server = createServer().listen(PORT).on('listening', () => check());
    server.on('connection', (socket: NetSocket) => {
      socket.on('data', (chunk) => {
        let str = chunk.toString();
        let line = '';

        for (let i = 0, len = str.length; i < len; i++) {
          let chr = str[i];
          line += chr;

          if (/[\n\r]$/.test(chr)) {
            socket.write(line);
            line = '';
          }
        }
      });
    });

    client = createConnection({ port: PORT }).on('connect', () => check());
  });

  it('should generate socket from netsocket', function () {
    socket = Network.Socket.fromNetSocket(client);
  });

  it('should send and receive packet', function (done) {
    const packet = Network.Packet.raw('hello from socket');
    socket.send(packet);
    socket.once('packet', (p) => {
      assert.equal(p.toString(), packet.toString());
      done();
    });
  });

  it('should wait for specific packet', function (done) {
    socket.wait({ data: 'wait_for_this' }).then(() => {
      done();
    });

    socket.send('dont_mind_me');
    socket.send('wait_for_this');
  });

  it('should send request and wait for response', function () {
    socket.send({ protocol: Network.PacketProtocol.REQUEST, data: 'hello rpc' })
      .then((res: Network.Packet) => {
        assert.equal(res.data, 'hello rpc');
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

    socket.addPacketHandler(myPacketHandler);

    socket.send('Foo Bar');
  });

  it('should remove packet handler', function (done) {
    myPacketHandlerData = [];
    
    socket.removePacketHandler(myPacketHandler);
    socket.send('Foo Bar');

    setTimeout(() => {
      if (myPacketHandlerData.length > 0) {
        throw new Error('packet handler data exists: ' + myPacketHandlerData);
      }

      done();
    }, 1000);
  });

  it ('should connect to server using address', function (done) {
    new Network.Socket(
      new Network.Address('127.0.0.1', PORT)).on('connection', () => done()
    );
  });
});
