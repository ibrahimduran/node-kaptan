import { EventEmitter } from 'events';

import { Logger } from './util';
import { ServiceConstructor, ServiceContainer } from './service';

export class Kaptan extends EventEmitter {
  public readonly logger = new Logger('kaptan');
  public readonly services = new ServiceContainer(this);

  constructor() {
    super();
  }

  public use(service: ServiceConstructor, options: {[key:string]: any} = {}) {
    if (!service.Options) {
      service.Options = {};
    }

    service.Options = { ...service.Options, ...options };
    this.services.add(service);
  }

  public start() {
    this.services.spawn();
  }
}
