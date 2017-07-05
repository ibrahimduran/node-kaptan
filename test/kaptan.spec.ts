import { Kaptan, Service } from '../build';

describe('Kaptan', function () {
  let kaptan: Kaptan;

  class MyService extends Service {}

  it('should create instance', function () {
    kaptan = new Kaptan();
    kaptan.use(MyService);
  });

  it('should start all services', function () {
    kaptan.start();
  });
});
