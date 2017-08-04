import * as Hapi from 'hapi';
import * as Joi from 'joi';

import { IDatabase } from '../database';
import { IServerConfiguration } from '../configurations';

import ToolController from './tool.controller';
import * as ToolValidator from './tool.validator';
import * as UserValidator from '../users/user.validator';

export default function (server: Hapi.Server,
                         configs: IServerConfiguration,
                         database: IDatabase) {

    const toolController = new ToolController(configs, database);
    server.bind(toolController);

    server.route({
        method: 'GET',
        path: '/tools/{id}',
        config: {
            handler: toolController.getToolById,
            tags: ['api', 'tools'],
            description: 'Get tools by id.',
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
            tags: ['api', 'tools'],
            description: 'Get all tools.',
            validate: {
                headers: UserValidator.userValidator
            }
        }
    });

    server.route({
        method: 'DELETE',
        path: '/tools/{id}',
        config: {
            handler: toolController.deleteTool,
            tags: ['api', 'tools'],
            description: 'Delete tool by id.',
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
        method: 'PATCH',
        path: '/tools/{id}',
        config: {
            handler: toolController.updateTool,
            tags: ['api', 'tools'],
            description: 'Update tool by id.',
            validate: {
                params: {
                    id: Joi.string().required()
                },
                payload: ToolValidator.updateToolModel,
                headers: UserValidator.authenticateValidator
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
            tags: ['api', 'tools'],
            description: 'Create a tool.',
            validate: {
                payload: ToolValidator.createToolModel,
                headers: UserValidator.authenticateValidator
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
