import 'mocha';

import * as getPort from 'get-port';
import { assert } from 'chai';
import { Kaptan } from '../../build/kaptan';
import { Network, Address, RemoteService } from '../../build/network';

describe('Network/RemoteService', function () {
  const serverKaptan = new Kaptan('server');
  const clientKaptan = new Kaptan('client');

  let SERVER_PORT = 0;
  let CLIENT_PORT = 0;

  before(function (done) {
    getPort().then((sPort: number) => {
      SERVER_PORT = sPort;
      serverKaptan.use(Network, { PORT: SERVER_PORT });

      getPort().then((cPort: number) => {
        
        CLIENT_PORT = cPort;
        clientKaptan.use(Network, { PORT: CLIENT_PORT });
        done();
      });
    });
  });

  class MyService extends RemoteService {}

  it('should create remote service as server', function () {
    serverKaptan.use(MyService);
    serverKaptan.start();
  });

  it('should throw name is required error', function (done) {
    MyService.Options.REMOTE = Address.loopback;
    try {
      new MyService(clientKaptan);
      done('it did not throw error');
    } catch (err) {
      done();
    }
  });

  let established = false;
  it('should create remote service as client', function () {
    clientKaptan.use(MyService, {
      REMOTE: new Address('127.0.0.1', SERVER_PORT),
      NAME: 'MyService'
    });

    (<MyService>clientKaptan.services.spawn('MyService'))
      .once('init', () => { established = true; });
  
    clientKaptan.start();
  });

  it('should establish connection between services', function (done) {
    this.timeout(3000);
    if (established) {
      done();
    } else {
      (<MyService>clientKaptan.services.spawn('MyService'))
        .once('init', () => done());
    }
  });

  it('should update state in server and client', function (done) {
    (<MyService>clientKaptan.services.spawn('MyService'))
      .on('update:num', (state) => {
        assert.equal(state.num, 5);
      })
      .on('update', () => done());

    (<MyService>serverKaptan.services.spawn('MyService'))
        .setState({ num: 5 });
  });
});
