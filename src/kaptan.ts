import { EventEmitter } from 'events';

import { Logger } from './util';
import { ServiceConstructor, ServiceContainer } from './service';

export class Kaptan extends EventEmitter {
  public readonly logger = new Logger('kaptan');
  public readonly services = new ServiceContainer(this);

  constructor() {
    super();
  }

  public use(service: ServiceConstructor) {
    this.services.add(service);
  }

  public start() {
    this.services.spawn();
  }
}
