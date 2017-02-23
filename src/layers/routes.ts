import * as Hapi from 'hapi';
import * as Joi from 'joi';
import LayerController from './layer.controller';
import * as LayerValidator from './layer.validator';
// import { jwtValidator } from '../users/user-validator';
import { IDatabase } from '../database';
import { IServerConfigurations } from '../configurations';

export default function (server: Hapi.Server,
                         configs: IServerConfigurations,
                         database: IDatabase) {

    const layerController = new LayerController(configs, database);
    server.bind(layerController);

    server.route({
        method: 'GET',
        path: '/layers/{id}',
        config: {
            handler: layerController.getLayerById,
            // auth: 'jwt',
            auth: false,
            tags: ['api', 'layers'],
            description: 'Get layers by id.',
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
            // auth: 'jwt',
            auth: false,
            tags: ['api', 'layers'],
            description: 'Get all layers.',
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
        path: '/layers/{id}',
        config: {
            handler: layerController.deleteLayer,
            // auth: 'jwt',
            auth: false,
            tags: ['api', 'layers'],
            description: 'Delete layer by id.',
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
        method: 'PUT',
        path: '/layers/{id}',
        config: {
            handler: layerController.updateLayer,
            // auth: 'jwt',
            auth: false,
            tags: ['api', 'layers'],
            description: 'Update layer by id.',
            validate: {
                params: {
                    id: Joi.string().required()
                },
                payload: LayerValidator.updateLayerModel
                // headers: jwtValidator
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
            // auth: 'jwt',
            auth: false,
            tags: ['api', 'layers'],
            description: 'Create a layer.',
            validate: {
                payload: LayerValidator.createLayerModel
                // headers: jwtValidator
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
