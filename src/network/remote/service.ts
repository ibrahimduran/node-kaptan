import { Kaptan } from '../../kaptan';
import { Service } from '../../service';
import { Network } from '../network';
import { Remote } from './remote';
import { Address } from '../address';
import { Socket } from '../socket';
import { Packet, PacketProtocol } from '../packet';

export class RemoteService extends Service {
  protected options: IRemoteServiceOpts;
  public readonly clients: Remote[] | null;
  public readonly server: Remote | null;
  public readonly state: { [key: string]: any } = {};
  protected network: Network;

  public get isServer() {
    return !Boolean(this.server);
  }

  constructor(kaptan: Kaptan, opts: IRemoteServiceOpts) {
    super(kaptan, {
      ...opts
    });

    this.network = kaptan.services.spawn('Network') as Network;

    if (opts.REMOTE) {
      this.server = new Remote(this, new Socket(opts.REMOTE), this.logger.namespace('server'));
      this.clients = null;
      this.server.register();
    } else {
      this.server = null;
      this.clients = [];
      this.init();
    }
  }

  public getExposedMethod(method: string) {
    if (
      !this.options.EXPOSED ||
      (!this.isServer && (!this.options.EXPOSED.CLIENT || this.options.EXPOSED.CLIENT.indexOf(method) === -1)) ||
      (this.isServer && (!this.options.EXPOSED.SERVER || this.options.EXPOSED.SERVER.indexOf(method) === -1))
    ) {
      return null;
    }

    return (this as any)[method];
  }

  public setState(state: {[key: string]: any}, remotelyUpdated: boolean = false) {
    this.logger.text('updating state with ' + JSON.stringify(state));

    for(var key in state) {
      this.state[key] = state[key];
      this.emit('update:' + key, state, remotelyUpdated);
    }

    this.emit('update', state, remotelyUpdated);
  }

  public getServiceState(): {[key: string]: any} {
    return this.state;
  }

  private init() {
    this.logger.text('initializing remote service server');

    this.network.addPacketHandler({
      filter: {
        ref: 'RemoteService#init',
        protocol: PacketProtocol.REQUEST,
        data: { name: Service.getServiceName(this) }
      },
      onParsed: this.onRemoteServiceInit.bind(this)
    });
  }

  private onRemoteServiceInit(socket: Socket, packet: Packet) {
    this.logger.text('incoming remote service request');

    const res = packet.resMeta;
    res.data = {
      state: this.getServiceState()
    };

    const remote = new Remote(this, socket, this.logger.namespace(socket.remoteAddr.addr));
    (<Remote[]>this.clients).push(remote);

    this.logger.text('sending remote service response');
    socket.send(res);
  }
}

export interface IRemoteServiceOpts {
  REMOTE?: Address,
  EXPOSED?: {
    SERVER?: string[],
    CLIENT?: string[]
  }
}
