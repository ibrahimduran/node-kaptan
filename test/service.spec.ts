import 'mocha';
import { assert } from 'chai';

import { Kaptan, Service, ServiceContainer, ServiceConstructor } from '../build';

describe('Service', function () {
  const kaptan = new Kaptan();
  let container: ServiceContainer;

  class MyService extends Service {}
  class FooService extends Service {}
  class BarService extends Service {}
  let HelloService: ServiceConstructor;

  it('should copy service', function () {
    class MyOldService { test() { return '5'; } }
    const MyNewService = Service.copy('MyNewService', MyOldService as any) as any;

    assert.equal(MyNewService.prototype.constructor.name, 'MyNewService');
    assert.equal(new MyOldService().test(), new MyNewService().test());
  });

  it('should create service', function () {
    HelloService = Service.create('HelloService', {
      async start() {
      },
      async stop() {
      }
    });
  });

  it('should create container', function () {
    container = new ServiceContainer(kaptan);
  });

  it('should add service to container', function () {
    container.add(MyService);
    container.add(FooService);
    container.add(BarService);
    container.add(HelloService);
  });

  it('should return service', function () {
    assert.equal(MyService, container.getConstructor('MyService'));
    assert.equal(MyService, container.getConstructor(MyService));
  });

  it('should loop through all services', function () {
    let services = Array.from(container.list.keys());
    container.each((service, name) => {
      services = services.filter(s => s !== name);
    });

    assert.equal(services.length, 0);
  });

  it('should spawn all services', function () {
    let services = Array.from(container.list.values());
    container.spawn();
    container.instances.forEach((instance) => {
      services = services.filter(service => !(instance instanceof service.service))
    });

    assert.equal(services.length, 0);
  });

  it('should spawn only one service', function () {
    class LonelyService extends Service {}
    container.add(LonelyService);
    
    const instance = container.spawn(LonelyService);
    assert.equal(instance instanceof LonelyService, true);
  });

  it('should return constructor or options of service', function () {
    class TestService extends Service {}
    const options = { FOO: 'BAR' };
    container.add(TestService, options);

    assert.equal(container.getConstructor(TestService), TestService);
    assert.equal(container.getOptions(TestService), options);
  });

  it('should try to get constructor or options of non existing service', function () {
    assert.equal(container.getConstructor('NotExisting'), undefined);
    assert.equal(container.getOptions('NotExisting'), undefined);
  });

  it('should return spawned service', function () {
    const instance = container.spawn('MyService');
    assert.equal(instance instanceof Service, true);
  });

  it('should throw not existing error', function (done) {
    try {
      container.spawn('NotExisting');
      done('did not throw an error');
    } catch (err) {
      done();
    }
  });
});
