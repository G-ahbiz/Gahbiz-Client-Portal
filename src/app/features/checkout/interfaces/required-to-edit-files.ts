export interface RequiredToEditFilesResponse {
  clientServiceId: string;
  serviceId: string;
  pendingEditsCount: number;
  editRequests: {
    serviceFileId: string;
    fileName: string;
    comment: string;
    currentFileName: string;
  }[];
  requiredFiles: {
    serviceFileId: string;
    currentFile: string;
    isTarget: boolean;
  }[];
}
