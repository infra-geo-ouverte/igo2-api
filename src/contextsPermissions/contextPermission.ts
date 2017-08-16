import * as Rx from 'rxjs';

import { IDatabase } from '../database';
import { User } from '../users';
import { ContextInstance, Scope } from '../contexts';

import { TypePermission } from './index';

export class ContextPermission {
  private database: IDatabase;

  constructor(database: IDatabase) {
    this.database = database;
  }

  public getPermissions(context: ContextInstance,
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

      this.getPermissionsByProfils(context, user).subscribe((permission) => {
        observer.next(permission);
        observer.complete();
      });

    });
  }

  public getPermissionsByContextId(contextId: string,
    user?: string): Rx.Observable<TypePermission> {

    return Rx.Observable.create(observer => {
      this.database.context.findOne({
        where: {
          id: contextId
        }
      }).then((context) => {
        if (context) {
          this.getPermissions(context, user).subscribe((permission) => {
            observer.next(permission);
            observer.complete();
          });
        } else {
          observer.next(TypePermission.null);
          observer.complete();
        }
      });
    });
  }

  private getPermissionsByProfils(context: ContextInstance,
    user?: string): Rx.Observable<TypePermission> {

    return Rx.Observable.create(observer => {
      User.getProfils(user).subscribe((profils) => {
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
      });

    });
  }

}
