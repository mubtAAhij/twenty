import { Record as IRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

export interface PGGraphQLResponse<Data = any> {
  resolve: {
    data: Data;
    errors: any[];
  };
}

export type PGGraphQLResult<Data = any> = [PGGraphQLResponse<Data>];

export interface PGGraphQLMutation<Record = IRecord> {
  affectedRows: number;
  records: Record[];
}
