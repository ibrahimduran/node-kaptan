import { Service } from '../../service';
import { RemoteService } from './service';
import { PacketFilter } from '../filter';
import { Packet, PacketProtocol } from '../packet';
import { Socket } from '../socket';
import { Logger } from '../../util/logger';

export class Remote {
  protected service: RemoteService;
  protected socket: Socket;
  protected logger: Logger;

  constructor(service: RemoteService, socket: Socket, logger: Logger) {
    this.logger = logger;
    this.service = service;
    this.socket = socket;

    this.service.on('update', (state, remotelyUpdated) => {
      if (remotelyUpdated) return;

      this.socket.send({
        ref: 'RemoteService#update',
        data: {
          service: Service.getServiceName(this.service),
          state
        }
      });
    });

    this.socket.addPacketHandler({
      filter: new PacketFilter()
        .protocol(PacketProtocol.REQUEST)
        .ref('RemoteService#run')
        .require('method', 'args')
        .data({ service: Service.getServiceName(this.service) }),

      onParsed: this.onRemoteRun.bind(this)
    });

    this.logger.text('registered state updater');
  }

  public async run(method: string, args: any[]) {
    this.logger.text('running remote method ' + method);
    const res = await this.socket.send({
      protocol: PacketProtocol.REQUEST,
      ref: 'RemoteService#run',
      data: {
        service: Service.getServiceName(this.service),
        method: method,
        args: args
      }
    }) as Packet;

    if (res.data.error) {
      throw new Error(res.data.error);
    }

    return res.data;
  }

  public async register() {
    const response = await this.socket.send({
      ref: 'RemoteService#init',
      protocol: PacketProtocol.REQUEST,
      data: { name: Service.getServiceName(this.service) }
    }) as Packet;

    if (response.data.error) {
      this.service.emit('init', response.data.error);
      this.logger.text('connection error');
      throw new Error(response.data.error);
    } else {
      this.service.emit('init');
      this.service.setState(response.data.state);
      this.logger.text('connection established');

      this.socket.addPacketHandler({
        filter: new PacketFilter()
          .ref('RemoteService#update')
          .data({ service: Service.getServiceName(this.service) })
          .require('state'),

        onParsed: this.onRemoteUpdate.bind(this)
      });
    }
  }

  private onRemoteUpdate(socket: Socket, packet: Packet) {
    this.logger.text('incoming state updated');
    this.service.setState(packet.data.state, true);
  }

  private onRemoteRun(socket: Socket, packet: Packet) {
    this.logger.text('incoming remote execution request');
    const res = packet.resMeta;

    const method = this.service.getExposedMethod(packet.data.method);
    if (!method) {
      this.logger.text('sending remote execution response');
      res.data = { error: 'Exposed method not found!' };
      socket.send(res);
    } else {
      const promise = method.apply(this.service, packet.data.args);

      promise.then((x: any) => {
        this.logger.text('sending remote execution response');
        res.data = x;
        socket.send(res);
      });
    }
  }
}
