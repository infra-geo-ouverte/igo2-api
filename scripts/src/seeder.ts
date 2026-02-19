import { AppInstance } from '../../src/app.interface';
import { catalogModel } from '../../src/catalog';
import {
  contextAccessModel,
  contextHiddenModel,
  contextLayerModel,
  contextModel,
  contextPermissionModel,
  contextToolModel
} from '../../src/context';
import { layerModel } from '../../src/layer';
import { poiModel } from '../../src/poi';
import { profilModel } from '../../src/profil';
import { toolModel } from '../../src/tool';
import { userModel } from '../../src/user';

export async function resetDatabase(app: AppInstance) {
  console.log('Resetting database...');

  try {
    await app.db.delete(catalogModel).execute();

    await app.db.delete(contextAccessModel).execute();
    await app.db.delete(contextHiddenModel).execute();
    await app.db.delete(contextLayerModel).execute();
    await app.db.delete(contextPermissionModel).execute();
    await app.db.delete(contextToolModel).execute();

    await app.db.delete(contextModel).execute();
    await app.db.delete(layerModel).execute();
    await app.db.delete(poiModel).execute();
    await app.db.delete(profilModel).execute();
    await app.db.delete(toolModel).execute();
    await app.db.delete(userModel).execute();
  } catch (error) {
    console.error(error);
  }

  console.log('Database reset completed.');
}
