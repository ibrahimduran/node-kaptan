import { EventEmitter } from 'events';

import { ServiceContainer } from '../service';
import { Kaptan } from '../kaptan';
import { Logger } from '../util';
import { toHyphenSpace } from '../util/texts';

export class Service extends EventEmitter {
  protected kaptan: Kaptan;
  protected logger: Logger;

  constructor(kaptan: Kaptan) {
    super();

    this.kaptan = kaptan;
    this.logger = this.kaptan.logger.namespace(
      toHyphenSpace(Service.getServiceName(this))
    );

    this.logger.text('created');
  }

  public static copy(name: string, service: ServiceConstructor): ServiceConstructor {
    const newService = eval(`class ${name} extends service {}`);

    return newService;
  }

  public static create(name: string, handlers: IService): ServiceConstructor {
    const service = Service.copy(name, Service);
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
