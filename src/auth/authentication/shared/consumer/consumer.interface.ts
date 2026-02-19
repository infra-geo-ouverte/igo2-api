import { ADMIN_GROUP } from '../../../authorization';

/**
 * Le concept de "consumer" permet d'identifier l'acteur (usager ou système) qui interagit avec l'API.
 * L'API de IGO n'ayant pas son propre système d'authentification, elle s'appuie sur la Passerelle API
 * pour fournir ces informations d'identification via les entêtes.
 */
export type IAnyConsumer = IAnonymousConsumer | IUserConsumer | ISystemConsumer;

export interface IAnonymousConsumer extends IConsumerBase {
  source: 'anonymous';
}

export interface IUserConsumer extends IConsumerBase {
  /** L'identifiant de l'usager dans le système interne d'authentification (DB:auth TABLE:user) */
  customId: number;
  source: 'user';
}

export interface ISystemConsumer extends IConsumerBase {
  source: 'system';
}

interface IConsumerBase {
  id: string;
  username: string;
  groups: ConsumerGroups[];
  source: IConsumerSource;
}

export type IConsumerSource = 'anonymous' | 'user' | 'system';

export const ConsumerGroups = [ADMIN_GROUP] as const;
export type ConsumerGroups = (typeof ConsumerGroups)[number] | string;
