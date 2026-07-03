import { AppInstance } from './app.interface';
import { routes as catalogRoutes } from './catalog';
import { routes as contextRoutes } from './context';
import { routes as layerRoutes } from './layer';
import { routes as poiRoutes } from './poi';
import { routes as profilRoutes } from './profil';
import { routes as toolRoutes } from './tool';
import { routes as userRoutes } from './user';

export const routes = async (app: AppInstance) => {
  app.register(catalogRoutes, { prefix: '/catalogs' });
  app.register(contextRoutes, { prefix: '/contexts' });
  app.register(layerRoutes, { prefix: '/layers' });
  app.register(poiRoutes, { prefix: '/pois' });
  app.register(profilRoutes, { prefix: '/profils' });
  app.register(toolRoutes, { prefix: '/tools' });
  app.register(userRoutes, { prefix: '/users' });
};
