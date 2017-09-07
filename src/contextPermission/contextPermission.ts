import * as Rx from 'rxjs';
import * as Boom from 'boom';

import { IDatabase, database } from '../database';
import { ObjectUtils } from '../utils';
import { User } from '../user';
import { ContextInstance, Scope } from '../context';

import { IContextPermission, ContextPermissionInstance,
  TypePermission } from './index';

export class ContextPermission {
  private database: IDatabase = database;

  constructor() {}

  public create(
    contextPermission: IContextPermission
  ): Rx.Observable<ContextPermissionInstance> {

    const bulkData: IContextPermission[] = [];

    const profils = contextPermission.profil.split(/[,;]/);
    for (let p of profils) {
      p = p.trim();
      if (p) {
        bulkData.push({
          profil: p,
          typePermission: contextPermission.typePermission,
          contextId: contextPermission.contextId
        });
      }
    }

    return Rx.Observable.create(observer => {
      this.database.contextPermission.bulkCreate(bulkData)
        .then((contextPermissionCreated) => {
          observer.next(contextPermissionCreated);
          observer.complete();
        }).catch((error) => {
          const uniqueFields = ['contextId', 'profil'];
          if (error.name === 'SequelizeUniqueConstraintError' &&
              error.fields.toString() === uniqueFields.toString()) {
            const message = 'The pair contextId and profil must be unique.';
            observer.error(Boom.conflict(message));
          } else {
            observer.error(Boom.badImplementation(error));
          }
        });
    });
  }

  public update(
    id: string,
    contextPermission: IContextPermission
  ): Rx.Observable<ContextPermissionInstance> {

    return Rx.Observable.create(observer => {

      this.database.contextPermission.update(contextPermission, {
        where: {
          id: id
        }
      }).then((count: [number, ContextPermissionInstance[]]) => {
        if (count[0]) {
          observer.next({id: id});
          observer.complete();
        } else {
          observer.error(Boom.notFound());
        }
      }).catch((error) => {
        const uniqueFields = ['contextId', 'profil'];
        if (error.name === 'SequelizeUniqueConstraintError' &&
            error.fields.toString() === uniqueFields.toString()) {
          const message = 'The pair contextId and profil must be unique.';
          observer.error(Boom.conflict(message));
        } else {
          observer.error(Boom.badImplementation(error));
        }
      });
    });
  }

  public delete(id: string): Rx.Observable<{}> {
    return Rx.Observable.create(observer => {
      this.database.contextPermission.destroy({
        where: {
          id: id
        }
      }).then((count: number) => {
        if (count) {
          observer.next({});
          observer.complete();
        } else {
          observer.error(Boom.notFound());
        }
      }).catch((error) => {
        observer.error(Boom.badImplementation(error));
      });
    });
  }

  public getByContextId(contextId): Rx.Observable<ContextPermissionInstance[]> {
    return Rx.Observable.create(observer => {
      this.database.contextPermission.findAll({
        where: {
          contextId: contextId
        }
      }).then((contextPermissions: ContextPermissionInstance[]) => {
          const plainContextPermissions = contextPermissions.map(
            (contextPermission) => {
              return ObjectUtils.removeNull(contextPermission.get());
            }
          );
          observer.next(plainContextPermissions);
          observer.complete();
        }).catch((error) => {
          observer.error(Boom.badImplementation(error));
        });
    });
  }

  public getPermission(context: ContextInstance,
    user?: string): Rx.Observable<TypePermission> {

    return Rx.Observable.create(observer => {

      if (user && context.owner === user) {
        observer.next(TypePermission.write);
        observer.complete();
        return;
      }

      if (!user) {
        if (Scope[context.scope] as any === Scope.public) {
          observer.next(TypePermission.read);
        } else {
          observer.next(TypePermission.null);
        }
        observer.complete();
        return;
      }

      if (Scope[context.scope] as any === Scope.private) {
        observer.next(TypePermission.null);
        observer.complete();
        return;
      }

      this.getPermissionFromProfils(context, user).subscribe(
        (permission) => {
          observer.next(permission);
          observer.complete();
        },
        (error: Boom.BoomError) => observer.error(error)
      );
    });
  }

  public getPermissionByContextId(contextId: string,
    user?: string): Rx.Observable<TypePermission> {

    return Rx.Observable.create(observer => {
      this.database.context.findOne({
        where: {
          id: contextId
        }
      }).then((context) => {
        if (context) {
          this.getPermission(context, user).subscribe(
            (permission) => {
              observer.next(permission);
              observer.complete();
            },
            (error: Boom.BoomError) => observer.error(error)
          );
        } else {
          observer.next(TypePermission.null);
          observer.complete();
        }
      });
    });
  }

  private getPermissionFromProfils(context: ContextInstance,
    user?: string): Rx.Observable<TypePermission> {

    return Rx.Observable.create(observer => {
      User.getProfils(user).subscribe(
        (profils) => {
          if (user) {
            profils.push(user);
          }
          this.database.context.findAll({
            include: [{
              model: this.database.contextPermission,
              where: {
                profil: profils
              }
            }],
            where: {
              id: context.id
            }
          }).then((contextFound: Array<any>) => {
            if (!contextFound.length) {
              if (Scope[context.scope] as any === Scope.public) {
                observer.next(TypePermission.read);
              } else {
                observer.next(TypePermission.null);
              }
            } else {
              let permission = TypePermission.read;
              for (const cp of contextFound[0].contextPermissions) {
                const typePerm: any = TypePermission[cp.typePermission];
                if (typePerm === TypePermission.write) {
                  permission = TypePermission.write;
                  break;
                }
              }
              observer.next(permission);
            }
            observer.complete();
          });
        },
        (error: Boom.BoomError) => observer.error(error)
      );
    });
  }

}
