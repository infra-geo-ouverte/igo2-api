import * as Hapi from 'hapi';
import * as Joi from 'joi';

import { IDatabase } from '../database';
import { IServerConfiguration } from '../configurations';

import LayerController from './layer.controller';
import * as LayerValidator from './layer.validator';
import * as UserValidator from '../users/user.validator';

export default function (server: Hapi.Server,
                         configs: IServerConfiguration,
                         database: IDatabase) {

    const layerController = new LayerController(configs, database);
    server.bind(layerController);

    server.route({
        method: 'GET',
        path: '/layers/{id}',
        config: {
            handler: layerController.getLayerById,
            tags: ['api', 'layers'],
            description: 'Get layers by id.',
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
            handler: layerController.getLayers,
            tags: ['api', 'layers'],
            description: 'Get all layers.',
            validate: {
                headers: UserValidator.authenticateValidator
            }
        }
    });

    server.route({
        method: 'DELETE',
        path: '/layers/{id}',
        config: {
            handler: layerController.deleteLayer,
            tags: ['api', 'layers'],
            description: 'Delete layer by id.',
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
            handler: layerController.updateLayer,
            tags: ['api', 'layers'],
            description: 'Update layer by id.',
            validate: {
                params: {
                    id: Joi.string().required()
                },
                payload: LayerValidator.updateLayerModel,
                headers: UserValidator.authenticateValidator
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
            handler: layerController.createLayer,
            tags: ['api', 'layers'],
            description: 'Create a layer.',
            validate: {
                payload: LayerValidator.createLayerModel,
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
