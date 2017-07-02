import { EventEmitter } from 'events';

import { Logger } from './util';
import { Service, ServiceConstructor, ServiceContainer } from './service';

export class Kaptan extends EventEmitter {
  public readonly services = new ServiceContainer();
  public readonly logger = new Logger('kaptan');

  constructor() {
    super();
  }

  public use(service: ServiceConstructor | Service) {
    if (service instanceof Service) {
      this.services.add(service);
    } else {
      this.services.add(new service(this));
    }
  }

  public start() {
    this.services.each(service => service.start());

    this.logger.text('started');
  }
}
