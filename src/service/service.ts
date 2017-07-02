import { EventEmitter } from 'events';

import { Kaptan } from '../kaptan';
import { Logger } from '../util';

export class Service extends EventEmitter {
  private kaptan: Kaptan;
  public readonly name?: string;
  private logger: Logger;

  constructor(name?: string) {
    super();

    this.name = name;
  }

  public init(kaptan: Kaptan) {
    this.kaptan = kaptan;
    this.logger = this.kaptan.logger.namespace(this.name || this.constructor.name);

    this.logger.text('initialized');
  }

  public start() {
    this.logger.text('started');
  }
}
