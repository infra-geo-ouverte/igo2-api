import * as Hapi from 'hapi';
import * as Joi from 'joi';

import { ToolController } from './tool.controller';
import { ToolValidator } from './tool.validator';
import { UserValidator } from '../user/user.validator';

export default function (server: Hapi.Server) {

    const toolController = new ToolController();
    server.bind(toolController);

    server.route({
        method: 'GET',
        path: '/tools/{id}',
        config: {
            handler: toolController.getById,
            tags: ['api', 'tools'],
            description: 'Get tools by id.',
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
            handler: toolController.get,
            tags: ['api', 'tools'],
            description: 'Get all tools.',
            validate: {
                headers: UserValidator.authenticateValidator
            }
        }
    });

    server.route({
        method: 'DELETE',
        path: '/tools/{id}',
        config: {
            handler: toolController.delete,
            tags: ['api', 'tools'],
            description: 'Delete tool by id.',
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
            handler: toolController.update,
            tags: ['api', 'tools'],
            description: 'Update tool by id.',
            validate: {
                params: {
                    id: Joi.string().required()
                },
                payload: ToolValidator.updateModel,
                headers: UserValidator.adminValidator
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
            handler: toolController.create,
            tags: ['api', 'tools'],
            description: 'Create a tool.',
            validate: {
                payload: ToolValidator.createModel,
                headers: UserValidator.adminValidator
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
