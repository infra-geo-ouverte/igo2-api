import { AppInstance, AppReply, AppRequest } from '../app.interface';
import { IAuthService } from '../auth';
import { ProfilService } from '../profil';
import { IUserPreference, IUserWithPermission } from './user.interface';
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

    const user = request.user!;
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
    const user = request.user!;
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
    const user = request.user!;
    const profils = user.profils;

    let profilsIgo = await this.profilIgoService
      .getByProfils(profils)
      .catch(() => []);
    const preference: IUserPreference = profilsIgo.reduce(
      (acc, value) => Object.assign(acc, value ? value.preference : {}),
      {}
    );
    const canShare = profilsIgo.find((p) => p.canShare === true);
    preference.canShare = !!canShare;
    user.preference = Object.assign(preference, user.preference);

    const hasAcrigeo = profilsIgo.find((p) => p.hasAcrigeo === true);
    if (!hasAcrigeo) {
      if (profilsIgo.length !== 1) {
        profilsIgo = profilsIgo.filter((p) => p.name !== 'acrigeo');
      } else {
        profilsIgo =
          profilsIgo[0].name === 'acrigeo'
            ? profilsIgo
            : profilsIgo.filter((p) => p.name !== 'acrigeo');
      }
    }

    const guides = profilsIgo.reduce((acc: string[], value) => {
      if (value.guides) {
        acc.push(...value.guides);
      }
      return [...new Set(acc)];
    }, []);

    return reply.send({
      ...user,
      guides
    } satisfies IUserWithPermission);
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
      return user;
    }

    const consumer = this.authService.getConsumer(request.headers);
    const userDb = await this.userService.create({
      externalId: consumer.customId
    });
    return reply.code(201).send(userDb);
  };
}
