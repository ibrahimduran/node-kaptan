import { Kaptan } from './kaptan';
import { Network, RemoteService, Address } from './network';

class MyService extends RemoteService {

}

const serverKaptan = new Kaptan('server');
serverKaptan.use(Network, { PORT: 3000 });
serverKaptan.use(MyService);

serverKaptan.start();

const clientKaptan = new Kaptan('client');
clientKaptan.use(Network, { PORT: 3001 });
clientKaptan.use(MyService, { REMOTE: new Address('127.0.0.1', 3000), NAME: 'MyService' });

clientKaptan.start();

setTimeout(() => {
  (serverKaptan.services.spawn('MyService') as MyService).setState({ num: 5 });
}, 5000);


