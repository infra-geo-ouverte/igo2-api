import * as Hapi from 'hapi';
import * as Joi from 'joi';
import ContextController from './context.controller';
import * as ContextValidator from './context.validator';
// import { jwtValidator } from '../users/user-validator';
import { IDatabase } from '../database';
import { IServerConfigurations } from '../configurations';

export default function (server: Hapi.Server,
                         configs: IServerConfigurations,
                         database: IDatabase) {

    const contextController = new ContextController(configs, database);
    server.bind(contextController);

    server.route({
        method: 'GET',
        path: '/contexts/{id}',
        config: {
            handler: contextController.getContextById,
            // auth: 'jwt',
            auth: false,
            tags: ['api', 'contexts'],
            description: 'Get contexts by id.',
            validate: {
                params: {
                    id: Joi.string().required()
                }
                // headers: jwtValidator
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'Context founded.'
                        },
                        '404': {
                            'description': 'Context does not exists.'
                        }
                    }
                }
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/contexts/{id}/details',
        config: {
            handler: contextController.getContextDetailsById,
            // auth: 'jwt',
            auth: false,
            tags: ['api', 'tools', 'layers', 'contexts'],
            description: 'Get details of context by context id.',
            validate: {
                params: {
                    id: Joi.string().required()
                }
                // headers: jwtValidator
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'Context founded.'
                        },
                        '404': {
                            'description': 'Context does not exists.'
                        }
                    }
                }
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/contexts',
        config: {
            handler: contextController.getContexts,
            // auth: 'jwt',
            auth: false,
            tags: ['api', 'contexts'],
            description: 'Get all contexts.',
            validate: {
                query: {
                    // top: Joi.number().default(5),
                    // skip: Joi.number().default(0)
                }
                // headers: jwtValidator
            }
        }
    });

    server.route({
        method: 'DELETE',
        path: '/contexts/{id}',
        config: {
            handler: contextController.deleteContext,
            // auth: 'jwt',
            auth: false,
            tags: ['api', 'contexts'],
            description: 'Delete context by id.',
            validate: {
                params: {
                    id: Joi.string().required()
                }
                // headers: jwtValidator
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'Deleted Context.',
                        },
                        '404': {
                            'description': 'Context does not exists.'
                        }
                    }
                }
            }
        }
    });

    server.route({
        method: 'PUT',
        path: '/contexts/{id}',
        config: {
            handler: contextController.updateContext,
            // auth: 'jwt',
            auth: false,
            tags: ['api', 'contexts'],
            description: 'Update context by id.',
            validate: {
                params: {
                    id: Joi.string().required()
                },
                payload: ContextValidator.updateContextModel
                // headers: jwtValidator
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'Deleted Context.',
                        },
                        '404': {
                            'description': 'Context does not exists.'
                        }
                    }
                }
            }
        }
    });

    server.route({
        method: 'POST',
        path: '/contexts',
        config: {
            handler: contextController.createContext,
            // auth: 'jwt',
            auth: false,
            tags: ['api', 'contexts'],
            description: 'Create a context.',
            validate: {
                payload: ContextValidator.createContextModel
                // headers: jwtValidator
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '201': {
                            'description': 'Created Context.'
                        }
                    }
                }
            }
        }
    });
}
