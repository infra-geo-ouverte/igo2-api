import * as Hapi from 'hapi';
import * as Joi from 'joi';

import { BookmarkController } from './bookmark.controller';
import { BookmarkValidator } from './bookmark.validator';
import { UserValidator } from '../user/user.validator';

export default function (server: Hapi.Server) {

    const bookmarkController = new BookmarkController();
    server.bind(bookmarkController);

    server.route({
        method: 'GET',
        path: '/bookmarks/{id}',
        config: {
            handler: bookmarkController.getById,
            tags: ['api', 'bookmarks'],
            description: 'Get bookmarks by id.',
            validate: {
                params: {
                    id: Joi.string().required()
                },
                headers: UserValidator.authenticateValidator
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'Bookmark founded.'
                        },
                        '404': {
                            'description': 'Bookmark does not exists.'
                        }
                    }
                }
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/bookmarks',
        config: {
            handler: bookmarkController.get,
            tags: ['api', 'bookmarks'],
            description: 'Get all bookmarks.',
            validate: {
                headers: UserValidator.authenticateValidator
            }
        }
    });

    server.route({
        method: 'DELETE',
        path: '/bookmarks/{id}',
        config: {
            handler: bookmarkController.delete,
            tags: ['api', 'bookmarks'],
            description: 'Delete bookmark by id.',
            validate: {
                params: {
                    id: Joi.string().required()
                },
                headers: UserValidator.authenticateValidator
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '204': {
                            'description': 'Deleted Bookmark.',
                        },
                        '404': {
                            'description': 'Bookmark does not exists.'
                        }
                    }
                }
            }
        }
    });

    server.route({
        method: 'PATCH',
        path: '/bookmarks/{id}',
        config: {
            handler: bookmarkController.update,
            tags: ['api', 'bookmarks'],
            description: 'Update bookmark by id.',
            validate: {
                params: {
                    id: Joi.string().required()
                },
                payload: BookmarkValidator.updateModel,
                headers: UserValidator.authenticateValidator
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'Deleted Bookmark.',
                        },
                        '404': {
                            'description': 'Bookmark does not exists.'
                        }
                    }
                }
            }
        }
    });

    server.route({
        method: 'POST',
        path: '/bookmarks',
        config: {
            handler: bookmarkController.create,
            tags: ['api', 'bookmarks'],
            description: 'Create a bookmark.',
            validate: {
                payload: BookmarkValidator.createModel,
                headers: UserValidator.authenticateValidator
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '201': {
                            'description': 'Created Bookmark.'
                        }
                    }
                }
            }
        }
    });
}
