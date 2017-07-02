import { Service } from './service';

export class ServiceContainer {
  private static services = new ServiceContainer();
  private list: Map<string, Service> = new Map<string, Service>();

  constructor() {
  }

  add(service: FunctionConstructor | Service) {
    if (service instanceof Service && service.name) {
      this.list.set(service.name, service);
    } else {
      this.list.set(service.constructor.name, new (service as any)());
    }
  }

  get(service: FunctionConstructor | string) {
    if (typeof service === 'string') {
      return this.list.get(service);
    } else {
      return this.list.get(service.constructor.name);
    }
  }

  each(callback: (service: Service) => void) {
    return this.list.forEach(callback);
  }

  public load(service: FunctionConstructor | Service) {
    ServiceContainer.services.add(service);
  }
}
