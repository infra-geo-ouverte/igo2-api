import * as Hapi from 'hapi';
import * as Joi from 'joi';

import { POIController } from './poi.controller';
import { POIValidator } from './poi.validator';
import { UserValidator } from '../user/user.validator';

export default function (server: Hapi.Server) {

    const poiController = new POIController();
    server.bind(poiController);

    server.route({
        method: 'GET',
        path: '/pois/{id}',
        config: {
            handler: poiController.getById,
            tags: ['api', 'pois'],
            description: 'Get pois by id.',
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
                            'description': 'POI founded.'
                        },
                        '404': {
                            'description': 'POI does not exists.'
                        }
                    }
                }
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/pois',
        config: {
            handler: poiController.get,
            tags: ['api', 'pois'],
            description: 'Get all pois.',
            validate: {
                headers: UserValidator.authenticateValidator
            }
        }
    });

    server.route({
        method: 'DELETE',
        path: '/pois/{id}',
        config: {
            handler: poiController.delete,
            tags: ['api', 'pois'],
            description: 'Delete poi by id.',
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
                            'description': 'Deleted POI.',
                        },
                        '404': {
                            'description': 'POI does not exists.'
                        }
                    }
                }
            }
        }
    });

    server.route({
        method: 'PATCH',
        path: '/pois/{id}',
        config: {
            handler: poiController.update,
            tags: ['api', 'pois'],
            description: 'Update poi by id.',
            validate: {
                params: {
                    id: Joi.string().required()
                },
                payload: POIValidator.updateModel,
                headers: UserValidator.authenticateValidator
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'Deleted POI.',
                        },
                        '404': {
                            'description': 'POI does not exists.'
                        }
                    }
                }
            }
        }
    });

    server.route({
        method: 'POST',
        path: '/pois',
        config: {
            handler: poiController.create,
            tags: ['api', 'pois'],
            description: 'Create a poi.',
            validate: {
                payload: POIValidator.createModel,
                headers: UserValidator.authenticateValidator
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '201': {
                            'description': 'Created POI.'
                        }
                    }
                }
            }
        }
    });
}
