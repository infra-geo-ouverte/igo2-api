import { profilModel } from './profil.model';

export type IProfil = typeof profilModel.$inferSelect;
export type IProfilIn = typeof profilModel.$inferInsert;

export interface IProfilChilds {
  name: string;
  title: string;
  childs?: IProfil[];
}

export type IProfilPreference = Record<string, unknown>;

export interface ISearchResult {
  id: number;
  name: string;
  title: string;
  type: ProfilType;
}

export const ProfilType = ['user', 'profil'] as const;
export type ProfilType = (typeof ProfilType)[number];
