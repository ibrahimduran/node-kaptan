import { Service, ServiceConstructor } from './service';

export class ServiceContainer {
  private static services = new ServiceContainer();
  private list: Map<string, Service> = new Map<string, Service>();

  constructor() {
  }

  add(service: Service) {
    this.list.set(service.name, service);
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
