import * as Hapi from 'hapi';
import * as Boom from 'boom';

import { Bookmark } from './bookmark';
import { IBookmark, BookmarkInstance } from './bookmark.model';

export class BookmarkController {

  private bookmark: Bookmark;

  constructor() {
    this.bookmark = new Bookmark();
  }

  public create(request: Hapi.Request, reply: Hapi.IReply) {
    const bookmarkToCreate: IBookmark = request.payload;
    bookmarkToCreate.userId = request.headers['x-consumer-custom-id'];

    this.bookmark.create(bookmarkToCreate).subscribe(
      (bookmark: BookmarkInstance) => reply(bookmark).code(201),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public update(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];
    const userId = request.headers['x-consumer-custom-id'];
    const bookmarkToUpdate: IBookmark = request.payload;

    this.bookmark.update(id, userId, bookmarkToUpdate).subscribe(
      (bookmark: BookmarkInstance) => reply(bookmark),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public delete(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];
    const userId = request.headers['x-consumer-custom-id'];

    this.bookmark.delete(id, userId).subscribe(
      (bookmark: BookmarkInstance) => reply(bookmark).code(204),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public getById(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];
    const userId = request.headers['x-consumer-custom-id'];

    this.bookmark.getById(id, userId).subscribe(
      (bookmark: BookmarkInstance) => reply(bookmark),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public get(request: Hapi.Request, reply: Hapi.IReply) {
    const userId = request.headers['x-consumer-custom-id'];

    this.bookmark.get(userId).subscribe(
      (bookmarks: BookmarkInstance[]) => reply(bookmarks),
      (error: Boom.BoomError) => reply(error)
    );
  }
}
