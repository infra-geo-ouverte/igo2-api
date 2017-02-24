import * as Hapi from 'hapi';
import * as Joi from 'joi';
import ToolController from './tool.controller';
import * as ToolValidator from './tool.validator';
// import { jwtValidator } from '../users/user-validator';
import { IDatabase } from '../database';
import { IServerConfigurations } from '../configurations';

export default function (server: Hapi.Server,
                         configs: IServerConfigurations,
                         database: IDatabase) {

    const toolController = new ToolController(configs, database);
    server.bind(toolController);

    server.route({
        method: 'GET',
        path: '/tools/{id}',
        config: {
            handler: toolController.getToolById,
            // auth: 'jwt',
            auth: false,
            tags: ['api', 'tools'],
            description: 'Get tools by id.',
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
                            'description': 'Tool founded.'
                        },
                        '404': {
                            'description': 'Tool does not exists.'
                        }
                    }
                }
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/tools',
        config: {
            handler: toolController.getTools,
            // auth: 'jwt',
            auth: false,
            tags: ['api', 'tools'],
            description: 'Get all tools.',
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
        path: '/tools/{id}',
        config: {
            handler: toolController.deleteTool,
            // auth: 'jwt',
            auth: false,
            tags: ['api', 'tools'],
            description: 'Delete tool by id.',
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
                            'description': 'Deleted Tool.',
                        },
                        '404': {
                            'description': 'Tool does not exists.'
                        }
                    }
                }
            }
        }
    });

    server.route({
        method: 'PUT',
        path: '/tools/{id}',
        config: {
            handler: toolController.updateTool,
            // auth: 'jwt',
            auth: false,
            tags: ['api', 'tools'],
            description: 'Update tool by id.',
            validate: {
                params: {
                    id: Joi.string().required()
                },
                payload: ToolValidator.updateToolModel
                // headers: jwtValidator
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'Deleted Tool.',
                        },
                        '404': {
                            'description': 'Tool does not exists.'
                        }
                    }
                }
            }
        }
    });

    server.route({
        method: 'POST',
        path: '/tools',
        config: {
            handler: toolController.createTool,
            // auth: 'jwt',
            auth: false,
            tags: ['api', 'tools'],
            description: 'Create a tool.',
            validate: {
                payload: ToolValidator.createToolModel
                // headers: jwtValidator
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '201': {
                            'description': 'Created Tool.'
                        }
                    }
                }
            }
        }
    });
}
