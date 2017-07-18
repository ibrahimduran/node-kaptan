import { Service, ServiceConstructor } from './service';
import { Kaptan } from '../kaptan';
import { Logger } from '../util';

export class ServiceContainer {
  public readonly kaptan: Kaptan;
  public readonly instances: Map<string, Service> = new Map<string, Service>();
  public readonly list: Map<string, IServiceOptions> = new Map<string, IServiceOptions>();
  public readonly logger: Logger;

  constructor(kaptan: Kaptan) {
    this.kaptan = kaptan;
    this.logger = kaptan.logger.namespace('container');
  }

  public add(service: ServiceConstructor, options = {}) {
    this.list.set(Service.getServiceName(service), {
      service,
      options
    });
  }

  public getConstructor(service: ServiceConstructor | string): ServiceConstructor | undefined {
    const serviceOpts = this.get(service);
    if (!serviceOpts) {
      return undefined;
    } else {
      return serviceOpts.service;
    }
  }

  public getOptions(service: ServiceConstructor | string): {[key: string]: any} | undefined {
    const serviceOpts = this.get(service);
    if (!serviceOpts) {
      return undefined;
    } else {
      return serviceOpts.options;
    }
  }

  public get(service: ServiceConstructor | string) {
    return this.list.get(Service.getServiceName(service));
  }

  public each(callback: (service: ServiceConstructor, name: string, options: {[key: string]: any}) => void) {
    return this.list.forEach((value, key) => callback(value.service, key, value.options));
  }

  public spawn(service?: ServiceConstructor | string): Service | void {
    if (service) {
      const serviceName = Service.getServiceName(service);
      if (this.instances.has(serviceName)) {
        return this.instances.get(serviceName);
      } else {
        const serviceOpts = this.list.get(serviceName);
        if (!serviceOpts) {
          throw new Error('Service not found! ' + serviceName);
        }

        const instance = Service.spawn(serviceOpts.service, this, serviceOpts.options);
        this.instances.set(serviceName, instance);

        return instance;
      }
    } else {
      this.each((service, name, options) => {
        if (!this.instances.has(name)) {
          this.instances.set(name, Service.spawn(service, this, options));
        }
      });
    }
  }
}

export class IServiceOptions {
  service: ServiceConstructor;
  options: {[key: string]: any};
}
