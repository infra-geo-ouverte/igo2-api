import * as Hapi from 'hapi';
import * as Boom from 'boom';

import { IUser, UserInstance } from './user.model';
import { User } from './user';


export class UserController {

  private user: User;

  constructor() {
    this.user = new User();
  }

  public login(request: Hapi.Request, reply: Hapi.IReply) {
    const typeConnection = request.payload.typeConnection || 'msp';
    if (typeConnection === 'msp') {
      this.loginMspUser(request, reply);
    } else if (typeConnection === 'test') {
      this.loginTestUser(request, reply);
    } else {
      this.loginSocialUser(request, reply);
    }
  }

  public update(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.headers['x-consumer-custom-id'];
    const user: IUser = request.payload;

    this.user.update(id, user).subscribe(
      (rep: UserInstance) => reply(rep),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public delete(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.headers['x-consumer-custom-id'];
    const kongId = request.headers['x-consumer-id'];

    this.user.delete(id, kongId).subscribe(
      (rep: UserInstance) => reply(rep).code(204),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public info(request: Hapi.Request, reply: Hapi.IReply) {
    const customId = request.headers['x-consumer-custom-id'];

    this.user.info(customId).subscribe(
      (tool: UserInstance) => reply(tool),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public getProfils(request: Hapi.Request, reply: Hapi.IReply) {
    const kongId = request.headers['x-consumer-id'];

    User.getProfils(kongId).subscribe(
      (profils) => reply({profils: profils}),
      (error: Boom.BoomError) => reply(error)
    );
  }

  private loginMspUser(request: Hapi.Request, reply: Hapi.IReply) {
    const username = request.payload.username;
    const password = request.payload.password;

    this.user.loginMspUser(username, password).subscribe(
      (token) => reply(token),
      (error: Boom.BoomError) => reply(error)
    );
  }

  private loginTestUser(request: Hapi.Request, reply: Hapi.IReply) {
    const username = request.payload.username;
    const password = request.payload.password;

    this.user.loginTestUser(username, password).subscribe(
      (token) => reply(token),
      (error: Boom.BoomError) => reply(error)
    );
  }

  private loginSocialUser(request: Hapi.Request, reply: Hapi.IReply) {
    const socialToken = request.payload.token;
    const typeConnection = request.payload.typeConnection;

    this.user.loginSocialUser(socialToken, typeConnection).subscribe(
      (token) => reply(token),
      (error: Boom.BoomError) => reply(error)
    );
  }

}
