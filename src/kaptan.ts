import { EventEmitter } from 'events';

import { Logger } from './util';
import { Service, ServiceContainer } from './service';

export class Kaptan extends EventEmitter {
  public readonly services = new ServiceContainer();
  public readonly logger = new Logger('kaptan');

  constructor() {
    super();
  }

  public use(service: FunctionConstructor | Service) {
    this.services.add(service);
  }

  public start() {
    this.services.each(service => service.init(this));
    this.services.each(service => service.start());

    this.logger.text('started');
  }
}
