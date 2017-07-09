import 'mocha';
import { assert } from 'chai';

import { Address } from '../../build/network';

describe('Network/Address', function () {
  it('should create address', function () {
    new Address('127.0.0.1', 3000);
  });

  it('should throw error for invalid address', function (done) {
    try {
      new Address('invalid_addr', 3000);
      done('it did not throw error');
    } catch (err) {
      done();
    }
  });

  it('should return endpoint', function () {
    let addr4 = Address.loopback;
    let addr6 = Address.loopback6;
    assert.equal(addr4.endpoint, '127.0.0.1' + ':' + addr4.port);
    assert.equal(addr6.endpoint, '[::1]' + ':' + addr6.port);
  });
});
