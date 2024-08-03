import { Knex } from 'knex';

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string;
      name: string;
      email: string;
      password: string;
      picture_path: string;
    };
    meals: {
      id: string;
      user_id: string;
      name: string;
      description: string;
      date: string;
      is_in_diet: boolean;
    };
  }
}
