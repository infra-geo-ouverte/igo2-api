import * as Rx from 'rxjs';
import * as Boom from 'boom';

import { IDatabase, database } from '../database';
import { ObjectUtils } from '../utils';

import { IBookmark, BookmarkInstance } from './bookmark.model';

export class Bookmark {

  private database: IDatabase = database;

  constructor() {}

  public create(bookmark: IBookmark): Rx.Observable<BookmarkInstance> {
    return Rx.Observable.create(observer => {
      this.database.bookmark.create(bookmark).then((createdBookmark) => {
        observer.next(createdBookmark);
        observer.complete();
      }).catch((error) => {
        observer.error(Boom.badImplementation(error));
      });
    });
  }

  public update(id: string, userId: string,
    bookmark: IBookmark): Rx.Observable<BookmarkInstance> {

    return Rx.Observable.create(observer => {
      this.database.bookmark.update(bookmark, {
        where: {
          id: id,
          userId: userId
        }
      }).then((count: [number, BookmarkInstance[]]) => {
        if (count[0]) {
          observer.next({id: id});
          observer.complete();
        } else {
          observer.error(Boom.notFound());
        }
      }).catch((error) => {
        observer.error(Boom.badImplementation(error));
      });
    });
  }

  public delete(id: string, userId: string): Rx.Observable<{}> {
    return Rx.Observable.create(observer => {
      this.database.bookmark.destroy({
        where: {
          id: id,
          userId: userId
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

  public get(userId: string): Rx.Observable<BookmarkInstance[]> {
    return Rx.Observable.create(observer => {
      this.database.bookmark.findAll({
        where: {
          userId: userId
        }
      }).then((bookmarks: BookmarkInstance[]) => {
        const plainBookmarks = bookmarks.map(
          (bookmark) => ObjectUtils.removeNull(bookmark.get())
        );
        observer.next(plainBookmarks);
        observer.complete();
      }).catch((error) => {
        observer.error(Boom.badImplementation(error));
      });
    });
  }

  public getById(id: string, userId: string): Rx.Observable<BookmarkInstance> {
    return Rx.Observable.create(observer => {
      this.database.bookmark.findOne({
        where: {
          id: id,
          userId: userId
        }
      }).then((bookmark: BookmarkInstance) => {
        if (bookmark) {
          observer.next(ObjectUtils.removeNull(bookmark.get()));
          observer.complete();
        } else {
          observer.error(Boom.notFound());
        }
      }).catch((error) => {
        observer.error(Boom.badImplementation(error));
      });
    });
  }
}
