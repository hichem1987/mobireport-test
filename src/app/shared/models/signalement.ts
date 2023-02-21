import { Observation } from './observation';
export interface Signalement {
  _id?: number;
  author: {
    first_name: string;
    last_name: string;
    birth_date: Date;
    sex: string;
    email: string;
  };
  observations: Observation[];
  description: string;
}
