import 'colors';

type LogColor = 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'gray';

export class Logger {
  private static Options = {
    ENV: process.env.NODE_ENV || 'production'
  };

  private static colors: LogColor[] = Logger.getAvailableColors();

  private color: LogColor;
  private label: string;
  private nsp?: Logger;

  private get prefix(): string {
    return `${this.nsp ? this.nsp.prefix : `[${new Date().getTime()}]`} [${this.label[this.color]}]`;
  }

  constructor(label: string, nsp?: Logger) {
    if (Logger.colors.length === 0) Logger.colors = Logger.getAvailableColors();

    this.label = label;
    this.color = Logger.colors.splice(Math.floor(Math.random() * Logger.colors.length), 1)[0];
    this.nsp = nsp;
  }

  public namespace(label: string) {
    return new Logger(label, this);
  }

  public text(msg: string) {
    if (Logger.Options.ENV !== 'production') {
      console.log(`${this.prefix} ${msg}`);
    }

    return this;
  }

  private static getAvailableColors() {
    return [
      'red',
      'green',
      'yellow',
      'blue',
      'magenta',
      'cyan',
      'gray'
    ] as LogColor[];
  }
}
