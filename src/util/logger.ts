import 'colors';

export class Logger {
  private static readonly colors = [
    'red',
    'green',
    'yellow',
    'blue',
    'magenta',
    'cyan',
    'gray'
  ];

  private color: string;
  private label: string;
  private nsp?: Logger;

  private get prefix(): string {
    return `${this.nsp ? this.nsp.prefix : `[${new Date().getTime()}]`} [${this.label[this.color as any]}]`;
  }

  constructor(label: string, nsp?: Logger) {
    this.label = label;
    this.color = Logger.colors.splice(Math.floor(Math.random() * Logger.colors.length))[0];
    this.nsp = nsp;
  }

  public namespace(label: string) {
    return new Logger(label, this);
  }

  public text(msg: string) {
    console.log(`${this.prefix} ${msg}`);

    return this;
  }
}