export class Logger {
  constructor(private prefix: string, private color: string) {}

  info(message: any) {
    console.info(`%c${this.prefix}:`, `color: ${this.color}`, message);
  }

  error(message: any) {
    console.error(`%c${this.prefix}:`, `color: ${this.color}`, message);
  }
}
