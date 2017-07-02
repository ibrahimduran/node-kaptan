import { EventEmitter } from 'events';

import { ServiceContainer } from '../service';
import { Kaptan } from '../kaptan';
import { Logger } from '../util';

export class Service extends EventEmitter {
  private kaptan: Kaptan;
  private logger: Logger;

  constructor(kaptan: Kaptan, ...services: Service[]) {
    super();

    this.kaptan = kaptan;
    this.logger = this.kaptan.logger.namespace(
      this.constructor.name
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .replace(/\s+/g, '-')
        .toLowerCase()
    );

    this.logger.text('created');
  }

  public start() {
    this.logger.text('started');
  }

  public static create(name: string, handlers: IService): ServiceConstructor {
    const service = eval(`class ${name} extends Service {}`);
    for (var key in handlers) {
      (service as any)[key] = (handlers as any)[key];
    }

    return service;
  }

  public static spawn(service: ServiceConstructor, container: ServiceContainer) {
    // TODO : inject dependencies
    return new service(container.kaptan);
  }
}

export interface ServiceConstructor {
  new (kaptan: Kaptan, ...services: Service[]): Service;
}

export interface IService {
}
