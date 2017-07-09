import 'mocha';
import { assert } from 'chai';

import {
  createServer,
  createConnection,
  Socket as NetSocket,
  Server as NetServer
} from 'net';
import { Socket, Address, Packet, PacketProtocol } from '../../build/network';

describe('Network/Socket', function () {
  const PORT = 56743;

  let server: NetServer;
  let client: NetSocket;
  let socket: Socket;

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
    socket = Socket.fromNetSocket(client);
  });

  it('should send and receive packet', function (done) {
    const packet = Packet.raw('hello from socket');
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
    socket.send({ protocol: PacketProtocol.REQUEST, data: 'hello rpc' })
      .then((res: Packet) => {
        assert.equal(res.data, 'hello rpc');
      });
  });

  it ('should connect to server using address', function (done) {
    new Socket(new Address('127.0.0.1', PORT)).on('connection', () => done());
  });
});
