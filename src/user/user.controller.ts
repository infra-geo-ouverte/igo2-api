import { AppInstance, AppReply, AppRequest } from '../app.interface';
import { IAuthService } from '../auth';
import { isUserConsumer } from '../auth/authentication/shared/consumer/consumer.utils';
import { ProfilService } from '../profil';
import {
  IUser,
  IUserPreference,
  IUserWithPermission,
  IUserWithProfils
} from './user.interface';
import {
  CreateUserSchema,
  DeleteUserSchema,
  GetUserSchema,
  SyncUserSchema,
  UpdateUserSchema
} from './user.schema';
import { UserService } from './user.service';

export class UserController {
  private authService: IAuthService;
  private userService: UserService;
  private profilIgoService: ProfilService;

  constructor(app: AppInstance) {
    this.authService = app.authService;
    this.userService = new UserService(app);
    this.profilIgoService = new ProfilService(app);
  }

  create = async (
    request: AppRequest<typeof CreateUserSchema>,
    reply: AppReply<typeof CreateUserSchema>
  ) => {
    const body = request.body;

    const res = await this.userService.create(body);
    return reply.code(201).send(res);
  };

  update = async (
    request: AppRequest<typeof UpdateUserSchema>,
    reply: AppReply<typeof UpdateUserSchema>
  ) => {
    const body = request.body;
    const mergePreference = request.query.mergePreference ?? true;

    const user = request.user;
    if (!user) {
      return reply.forbidden('Accès refusé');
    }

    if (body.id && body.id !== user.id) {
      return reply.forbidden();
    }

    if (mergePreference) {
      body.preference = {
        ...(user.preference ?? {}),
        ...(body.preference ?? {})
      };
    }

    return this.userService.update(user.id, body);
  };

  delete = async (
    request: AppRequest<typeof DeleteUserSchema>,
    reply: AppReply<typeof DeleteUserSchema>
  ) => {
    const user = request.user;
    if (!user) {
      return reply.notFound();
    }

    await this.userService.delete(user.id);
    return reply.code(204).send();
  };

  get = async (
    request: AppRequest<typeof GetUserSchema>,
    reply: AppReply<typeof GetUserSchema>
  ) => {
    const user = request.user;
    if (!user) {
      return reply.forbidden('Accès refusé');
    }

    const userWithPermissions = await this.addUserPermissions(user);
    return reply.send(userWithPermissions);
  };

  /**
   * Un "GET" User avec la possibilité de création si l'utilisateur n'existe pas
   */
  sync = async (
    request: AppRequest<typeof SyncUserSchema>,
    reply: AppReply<typeof SyncUserSchema>
  ) => {
    const user = request.user;
    if (user) {
      return await this.addUserPermissions(user);
    }

    const consumer = this.authService.getConsumer(request.headers);
    if (!consumer) {
      return reply.internalServerError("Problème d'accès");
    }

    const userDb = await this.userService.create({
      externalId: isUserConsumer(consumer)
        ? consumer.customId.toString()
        : consumer.id
    });

    const userWithPermissions = await this.addUserPermissions(userDb);
    return reply.code(201).send(userWithPermissions);
  };

  private async addUserPermissions(
    user: IUserWithProfils | IUser
  ): Promise<IUserWithPermission> {
    const profils = (user as IUserWithProfils)?.profils ?? [];

    const profilsIgo = await this.profilIgoService
      .getByProfils(profils)
      .catch(() => []);
    const preference: IUserPreference = profilsIgo.reduce(
      (acc, value) => Object.assign(acc, value ? value.preference : {}),
      {}
    );
    const canShare = profilsIgo.find((p) => p.canShare === true);
    preference.canShare = !!canShare;
    user.preference = Object.assign(preference, user.preference);

    return user;
  }
}
