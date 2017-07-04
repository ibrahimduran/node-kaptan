import { Service, ServiceConstructor } from './service';
import { Kaptan } from '../kaptan';
import { Logger } from '../util';

export class ServiceContainer {
  public readonly kaptan: Kaptan;
  private list: Map<string, ServiceConstructor> = new Map<string, ServiceConstructor>();
  private instances: Map<string, Service> = new Map<string, Service>();
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

  public spawn() {
    this.each((service, name) => this.instances.set(name, Service.spawn(service, this)));
  }
}
