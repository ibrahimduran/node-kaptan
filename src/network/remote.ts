import { Kaptan } from '../kaptan';
import { Service, ServiceContainer } from '../service';
import { Network, Packet, Address, Socket, PacketProtocol } from '../network';
import { Logger } from '../util';

export class RemoteService extends Service {
  public static Options: RemoteServiceOptions = {};

  protected readonly clientLogger: Logger;
  protected readonly network: Network;
  protected readonly remote: Socket;
  protected readonly remoteName: string;

  public readonly state: {[key: string]: any} = {};

  constructor(kaptan: Kaptan) {
    super(kaptan);

    this.network = kaptan.services.spawn('Network') as Network;
    this.clientLogger = this.logger.namespace('remote');

    const self = <typeof RemoteService>this.constructor;
    if (self.Options.REMOTE) {
      if (!self.Options.NAME) {
        throw new Error('Remote service name must be supplied as parameter!');
      }
        
      this.remoteName = self.Options.NAME;
      this.remote = new Socket(self.Options.REMOTE);

      this.initClient();
    } else {
      this.initServer(kaptan.services);
    }
  }

  private initServer(services: ServiceContainer) {
    this.logger.text('initializing remote service');
    const logger = this.logger;
    this.network.addPacketHandler({
      onParsed(packet: Packet) {
        if (packet.protocol === PacketProtocol.REQUEST && packet.ref === 'RemoteService#init') {
          logger.text('incoming remote service request');
          const res = packet.resMeta;

          try {
            if (!packet.data || !packet.data.name) {
              throw new Error('Service name is required!');
            }
            
            const service = services.spawn(packet.data.name) as RemoteService;
            res.data = service.getServiceState();
          } catch (err) {
            res.data = {
              error: err.toString()
            };
          }

          logger.text('sending remote service response');
          this.send(res);
        }
      }
    });
  }

  private initClient() {
    this.clientLogger.text('initializing connection');
    this.remote.send({
      ref: 'RemoteService#init',
      protocol: PacketProtocol.REQUEST,
      data: {
        name: this.remoteName
      }
    }).then((packet: Packet) => {
      if (packet.data && packet.data.error) {
        throw new Error((packet.data as any).error);
      } else {
        this.clientLogger.text('connection established');
      }
    });
  }

  public diffServiceState(prev: any, next: any): {[key: string]: any} {
    // TODO: implement this
    return {};
  }

  public getServiceState(): {[key: string]: any} {
    return this.state;
  }
}

export interface RemoteServiceOptions {
  REMOTE?: Address,
  NAME?: string
}
