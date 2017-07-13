import { EventEmitter } from 'events';

export class Events extends EventEmitter {
  private oneTimeInterceptedEvents: any[] = [];

  public onceIntercepted(event: string | symbol, listener: (...args: any[]) => void): this {
    EventEmitter.prototype.once.call(this, event, listener);
    this.oneTimeInterceptedEvents.push(listener);

    return this;
  }

  public onIntercepted(event: string | symbol, listener: (...args: any[]) => void): this {
    EventEmitter.prototype.on.call(this, event, listener);

    return this;
  }

  public async emitIntercepted(event: string | symbol, ...args: any[]) {
    const events = this.listeners(event) as Function[];
    events.forEach((e: (...args: any[]) => void) => {
      const index = this.oneTimeInterceptedEvents.indexOf(e);
      if (index !== -1) {
        this.oneTimeInterceptedEvents.splice(index, 1);
        this.removeListener(event, e);
      }
    });

    return Events.runIntercepted.apply(this, [events].concat(args));
  }

  public static async runIntercepted(eventList: Function[], ...args: any[]) {
    return new Promise((resolve, reject) => {
      const run = (callback: Function) => {
        if (eventList.length === 0) return callback();

        const event = eventList.shift() as Function;
        const returned = event.apply(this, args);

        if (returned) {
          if (typeof returned === 'function') {
            return returned(() => run(callback));
          }
          else if (typeof returned === 'object' && returned.constructor.name === 'Promise') {
            return returned.then(() => run(callback));
          }
        }

        run(callback);
      };

      run(resolve);
    });
  }
}
