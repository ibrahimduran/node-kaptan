import 'mocha';
import { assert } from 'chai';

import { Kaptan, Service } from '../build';

describe('Kaptan', function () {
  let kaptan: Kaptan;

  class MyService extends Service {}
  class MyOtherService extends Service {
    public static Options = {
      FOO: ''
    };
  }

  it('should create instance', function () {
    kaptan = new Kaptan();
    kaptan.use(MyService);
  });

  it('should have set options for service correctly', function () {
    kaptan.use(MyOtherService, { FOO: 'BAR' });
    const service = kaptan.services.get('MyOtherService');
    if (!service) throw new Error('MyOtherService is not in the service container');
    assert.equal(service.Options['FOO'], 'BAR');
  });

  it('should start all services', function () {
    kaptan.start();
  });
});
