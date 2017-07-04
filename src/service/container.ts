import { Service, ServiceConstructor } from './service';
import { Kaptan } from '../kaptan';
import { Logger } from '../util';

export class ServiceContainer {
  public readonly kaptan: Kaptan;
  public readonly instances: Map<string, Service> = new Map<string, Service>();
  public readonly list: Map<string, ServiceConstructor> = new Map<string, ServiceConstructor>();
  public readonly logger: Logger;

  constructor(kaptan: Kaptan) {
    this.kaptan = kaptan;
    this.logger = kaptan.logger.namespace('container');
  }

  public add(service: ServiceConstructor) {
    this.list.set(Service.getServiceName(service), service);
  }

  public get(service: ServiceConstructor | string) {
    return this.list.get(Service.getServiceName(service));
  }

  public each(callback: (service: ServiceConstructor, name: string) => void) {
    return this.list.forEach(callback);
  }

  public spawn(service?: ServiceConstructor | string): Service | void {
    if (service) {
      const serviceName = Service.getServiceName(service);
      if (this.instances.has(serviceName)) {
        return this.instances.get(serviceName);
      } else {
        const constructor = this.list.get(serviceName);
        if (!constructor) {
          throw new Error('Service not found! ' + serviceName);
        }

        const instance = Service.spawn(constructor, this);
        this.instances.set(serviceName, instance);

        return instance;
      }
    } else {
      this.each((service, name) => {
        if (!this.instances.has(name)) {
          this.instances.set(name, Service.spawn(service, this));
        }
      });
    }
  }
}
