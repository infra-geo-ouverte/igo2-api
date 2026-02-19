import { IProfils } from '../../../auth/authentication';

export interface ILayerPermission {
  verifyPermissionByUrl(url: string, profils: IProfils): Promise<boolean>;
}

export interface ILayerPermissionInstance {
  layerPermission?: ILayerPermission;
}
