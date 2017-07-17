import { EventEmitter } from 'events';

import { Logger } from './util';
import { ServiceConstructor, ServiceContainer } from './service';

export class Kaptan extends EventEmitter {
  public readonly logger: Logger;
  public readonly services: ServiceContainer;

  constructor(label: string = 'kaptan') {
    super();

    this.logger = new Logger(label);
    this.services = new ServiceContainer(this);
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
