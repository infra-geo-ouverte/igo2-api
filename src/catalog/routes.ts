import * as Hapi from 'hapi';
import * as Joi from 'joi';

import { CatalogController } from './catalog.controller';
import { CatalogValidator } from './catalog.validator';
import { UserValidator } from '../user/user.validator';

export default function (server: Hapi.Server) {

    const catalogController = new CatalogController();
    server.bind(catalogController);

    server.route({
        method: 'GET',
        path: '/catalogs/{id}',
        config: {
            handler: catalogController.getById,
            tags: ['api', 'catalogs'],
            description: 'Get catalogs by id.',
            validate: {
                params: {
                    id: Joi.string().required()
                },
                headers: UserValidator.userValidator
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'Catalog founded.'
                        },
                        '404': {
                            'description': 'Catalog does not exists.'
                        }
                    }
                }
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/catalogs',
        config: {
            handler: catalogController.get,
            tags: ['api', 'catalogs'],
            description: 'Get all catalogs.',
            validate: {
                headers: UserValidator.userValidator
            }
        }
    });

    server.route({
        method: 'DELETE',
        path: '/catalogs/{id}',
        config: {
            handler: catalogController.delete,
            tags: ['api', 'catalogs'],
            description: 'Delete catalog by id.',
            validate: {
                params: {
                    id: Joi.string().required()
                },
                headers: UserValidator.adminValidator
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '204': {
                            'description': 'Deleted Catalog.',
                        },
                        '404': {
                            'description': 'Catalog does not exists.'
                        }
                    }
                }
            }
        }
    });

    server.route({
        method: 'PATCH',
        path: '/catalogs/{id}',
        config: {
            handler: catalogController.update,
            tags: ['api', 'catalogs'],
            description: 'Update catalog by id.',
            validate: {
                params: {
                    id: Joi.string().required()
                },
                payload: CatalogValidator.updateModel,
                headers: UserValidator.adminValidator
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'Deleted Catalog.',
                        },
                        '404': {
                            'description': 'Catalog does not exists.'
                        }
                    }
                }
            }
        }
    });

    server.route({
        method: 'POST',
        path: '/catalogs',
        config: {
            handler: catalogController.create,
            tags: ['api', 'catalogs'],
            description: 'Create a catalog.',
            validate: {
                payload: CatalogValidator.createModel,
                headers: UserValidator.adminValidator
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '201': {
                            'description': 'Created Catalog.'
                        }
                    }
                }
            }
        }
    });
}
