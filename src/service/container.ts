import { Service, ServiceConstructor } from './service';
import { Kaptan } from '../kaptan';

export class ServiceContainer {
  public readonly kaptan: Kaptan;
  private list: Map<string, ServiceConstructor> = new Map<string, ServiceConstructor>();
  private instances: Map<string, Service> = new Map<string, Service>();

  constructor(kaptan: Kaptan) {
    this.kaptan = kaptan;
  }

  public add(service: ServiceConstructor) {
    this.list.set(service.prototype.constructor.name, service);
  }

  public get(service: ServiceConstructor | string) {
    if (typeof service === 'string') {
      return this.list.get(service);
    } else {
      return this.list.get(service.prototype.constructor.name);
    }
  }

  public each(callback: (service: ServiceConstructor, name: string) => void) {
    return this.list.forEach(callback);
  }

  public spawn() {
    this.each((service, name) => this.instances.set(name, Service.spawn(service, this)));
  }
}
