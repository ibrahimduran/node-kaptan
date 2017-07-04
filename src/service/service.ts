import { EventEmitter } from 'events';

import { ServiceContainer } from '../service';
import { Kaptan } from '../kaptan';
import { Logger } from '../util';

export class Service extends EventEmitter {
  private kaptan: Kaptan;
  private logger: Logger;

  constructor(kaptan: Kaptan) {
    super();

    this.kaptan = kaptan;
    this.logger = this.kaptan.logger.namespace(
      Service.getServiceName(this)
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
    container.logger.text('spawning ' + Service.getServiceName(service));

    return new service(container.kaptan);
  }

  public static getServiceName(service: ServiceConstructor | Service | string): string {
    if (typeof service === 'string') {
      return service;
    } else if (service instanceof Service) {
      return service.constructor.name;
    } else {
      return service.prototype.constructor.name;
    }
  }
}

export interface ServiceConstructor {
  new (kaptan: Kaptan): Service;
}

export interface IService {
}
