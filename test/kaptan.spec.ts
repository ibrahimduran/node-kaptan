import 'mocha';
import { assert } from 'chai';

import { Kaptan, Service } from '../build';

describe('Kaptan', function () {
  let kaptan: Kaptan;

  class MyService extends Service {}

  it('should create instance', function () {
    kaptan = new Kaptan();
    kaptan.use(MyService);
  });

  it('should have set options for service correctly', function (done) {
    class TestService extends Service {
      constructor(kaptan: Kaptan, options: {[key: string]: any} = {}) {
        super(kaptan, options);
        assert.equal(options.FOO, 'BAR');
        done();
      }
    }

    kaptan.use(TestService, { FOO: 'BAR' });
    kaptan.services.spawn('TestService');
  });

  it('should start all services', function () {
    kaptan.start();
  });
});
