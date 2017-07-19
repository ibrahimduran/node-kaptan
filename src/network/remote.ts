import { Kaptan } from '../kaptan';
import { Service, ServiceContainer } from '../service';
import { Network, Packet, Address, Socket, PacketFilter, PacketProtocol } from '../network';
import { Logger } from '../util';

export class RemoteService extends Service {
  protected readonly clientLogger: Logger;
  protected readonly network: Network;
  protected readonly remote: Socket;
  protected readonly remoteName: string;

  public readonly state: {[key: string]: any} = {};

  constructor(kaptan: Kaptan, options = {}) {
    super(kaptan, {
      ...options
    });

    this.network = kaptan.services.spawn('Network') as Network;
    this.clientLogger = this.logger.namespace('remote');

    if (this.options.REMOTE) {
      if (!this.options.NAME) {
        throw new Error('Remote service name must be supplied as parameter!');
      }
        
      this.remoteName = this.options.NAME;
      this.remote = new Socket(this.options.REMOTE);

      this.initClient();
    } else {
      this.initServer(kaptan.services);
    }
  }

  private initServer(services: ServiceContainer) {
    this.logger.text('initializing remote service');
    const self = this;

    this.network.addPacketHandler({
      filter: new PacketFilter()
        .ref('RemoteService#init')
        .protocol(PacketProtocol.REQUEST)
        .require('name'),
      
      onParsed(socket: Socket, packet: Packet) {
        self.logger.text('incoming remote service request');
        const res = packet.resMeta;

        try {
          const service = services.spawn(packet.data.name) as RemoteService;
          res.data = service.getServiceState();

          self.on('update', (state) => {
            socket.send(new Packet({
              ref: 'RemoteService#update',
              data: {
                service: Service.getServiceName(self),
                state
              }
            }));
          });
        } catch (err) {
          res.data = {
            error: err.toString()
          };
        }

        self.logger.text('sending remote service response');
        socket.send(res);
      }
    });
  }

  private async initClient() {
    this.clientLogger.text('initializing connection');
    
    const response = await this.remote.send({
      ref: 'RemoteService#init',
      protocol: PacketProtocol.REQUEST,
      data: {
        name: this.remoteName
      }
    }) as Packet;

    if (response.data && response.data.error) {
      throw new Error(response.data.error);
    } else {
      const self = this;

      this.remote.addPacketHandler({
        filter: new PacketFilter()
          .ref('RemoteService#update')
          .require('service', 'state'),

        onParsed(socket: Socket, packet: Packet) {
          self.setState(packet.data.state);
        }
      });
      
      this.emit('init');
      this.clientLogger.text('connection established');
    }
  }

  public setState(state: {[key: string]: any}) {
    this.logger.text('updating state with ' + JSON.stringify(state));

    for(var key in state) {
      this.state[key] = state[key];
      this.emit('update:' + key, state);
    }

    this.emit('update', state);
  }

  public getServiceState(): {[key: string]: any} {
    return this.state;
  }
}

export interface RemoteServiceOptions {
  REMOTE?: Address,
  NAME?: string
}
