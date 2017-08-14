import 'mocha';

import * as getPort from 'get-port';
import { assert } from 'chai';
import { Kaptan } from '../../build/kaptan';
import { Network, Address, RemoteService, Remote, IRemoteServiceOpts } from '../../build/network';

describe('Network/RemoteService', async function () {
  const serverKaptan = new Kaptan('server');
  const clientKaptan = new Kaptan('client');

  const SERVER_PORT = await getPort();
  const CLIENT_PORT = await getPort();
  
  serverKaptan.use(Network, { PORT: SERVER_PORT });
  clientKaptan.use(Network, { PORT: CLIENT_PORT });

  let established: boolean, clientService: MyService, serverService: MyService;

  class MyService extends RemoteService {
    constructor(kaptan: Kaptan, opts: IRemoteServiceOpts) {
      super(kaptan, {
        ...opts,
        EXPOSED: {
          SERVER: ['greet']
        }
      });
    }

    async greet(name: string) {
      return `Greetings, ${name}.`;
    }

    async foo() {
      return 'foo bar';
    }
  }

  it('should create remote service as server', function () {
    serverKaptan.use(MyService);
    serverKaptan.start();
    serverService = serverKaptan.services.spawn('MyService') as MyService;
  });

  it('should Remote object work as standalone', async function () {
    const remote = new Remote('MyService', new Address('127.0.0.1', SERVER_PORT));
    remote.register();

    assert.equal(
      await remote.run('greet', ['John Doe']),
      await serverService.greet('John Doe')
    );
  });

  it('should create remote service as client', function () {
    clientKaptan.use(MyService, {
      REMOTE: new Address('127.0.0.1', SERVER_PORT)
    });

    clientKaptan.start();

    clientService = clientKaptan.services.spawn('MyService') as MyService;
    clientService.once('init', () => established = true);
  });

  it('should establish connection between services', function (done) {
    this.timeout(3000);
    const check = () => established ? done() : setTimeout(check, 500);
    check();
  });

  it('should update state in server and client', function (done) {
    clientService
      .on('update:num', (state) => {
        assert.equal(state.num, 5);
      })
      .on('update', () => done());

    serverService.setState({ num: 5 });
  });

  it('should run remote method on server', async function () {
    assert.equal(
      await clientService.server!.run('greet', ['John Doe']),
      await serverService.greet('John Doe')
    );
  });

  it('should not run not exposed method', async function () {
    try {
      const returned = await clientService.server!.run('foo', []);

      if (returned === await serverService.foo()) {
        throw new Error('exposed method run successfuly');
      } else {
        throw new Error('didn\'t throw error but return values don\'t match');
      }
    } catch (err) {
    }
  });
});
