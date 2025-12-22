import { RequiredFile } from "./required-file";

export interface RequiredFilesResponse {
  jsonData: string;
  files: RequiredFile[];
  count: number;
}