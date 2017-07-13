export function emitEventsSync(this: any, eventList: Function[], ...args: any[]) {
  if (eventList.length === 0) return;

  const event = eventList.shift() as Function;
  const returned = event.call(this, args);

  if (returned) {
    if (typeof returned === 'function') {
      return returned(() => emitEventsSync(eventList, args));
    }
    else if (typeof returned === 'object' && returned.constructor.name === 'Promise') {
      return returned.then(() => emitEventsSync(eventList, args));
    }
  }

  emitEventsSync(eventList, args);
}
