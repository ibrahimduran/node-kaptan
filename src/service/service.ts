import { EventEmitter } from 'events';

import { Kaptan } from '../kaptan';
import { Logger } from '../util';

export class Service extends EventEmitter {
  private kaptan: Kaptan;
  private logger: Logger;

  public readonly name?: string;

  constructor(kaptan: Kaptan, ...services: Service[]) {
    super();

    this.kaptan = kaptan;
    this.name = name;
    this.logger = this.kaptan.logger.namespace(this.name || this.constructor.name);

    this.logger.text('created')
  }

  public start() {
    this.logger.text('started');
  }
}

export interface ServiceConstructor {
  new (kaptan: Kaptan, ...services: Service[]): Service;
}