import * as Hapi from 'hapi';
import * as Joi from 'joi';

import { LayerController } from './layer.controller';
import { LayerValidator } from './layer.validator';
import { UserValidator } from '../user/user.validator';

export default function (server: Hapi.Server) {

    const layerController = new LayerController();
    server.bind(layerController);

    server.route({
        method: 'GET',
        path: '/layers/{id}',
        config: {
            handler: layerController.getById,
            tags: ['api', 'layers'],
            description: 'Get layers by id.',
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
                            'description': 'Layer founded.'
                        },
                        '404': {
                            'description': 'Layer does not exists.'
                        }
                    }
                }
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/layers',
        config: {
            handler: layerController.get,
            tags: ['api', 'layers'],
            description: 'Get all layers.',
            validate: {
                headers: UserValidator.adminValidator
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/baselayers',
        config: {
            handler: layerController.getBaseLayers,
            tags: ['api', 'layers'],
            description: 'Get base layers.',
            validate: {
                headers: UserValidator.userValidator
            }
        }
    });

    server.route({
        method: 'DELETE',
        path: '/layers/{id}',
        config: {
            handler: layerController.delete,
            tags: ['api', 'layers'],
            description: 'Delete layer by id.',
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
                            'description': 'Deleted Layer.',
                        },
                        '404': {
                            'description': 'Layer does not exists.'
                        }
                    }
                }
            }
        }
    });

    server.route({
        method: 'PATCH',
        path: '/layers/{id}',
        config: {
            handler: layerController.update,
            tags: ['api', 'layers'],
            description: 'Update layer by id.',
            validate: {
                params: {
                    id: Joi.string().required()
                },
                payload: LayerValidator.updateModel,
                headers: UserValidator.adminValidator
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'Deleted Layer.',
                        },
                        '404': {
                            'description': 'Layer does not exists.'
                        }
                    }
                }
            }
        }
    });

    server.route({
        method: 'POST',
        path: '/layers',
        config: {
            handler: layerController.create,
            tags: ['api', 'layers'],
            description: 'Create a layer.',
            validate: {
                payload: LayerValidator.createModel,
                headers: UserValidator.authenticateValidator
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '201': {
                            'description': 'Created Layer.'
                        }
                    }
                }
            }
        }
    });
}
