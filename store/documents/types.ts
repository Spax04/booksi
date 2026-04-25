export interface IRootState {
    uploadedDocuments: IDocumentObject[];
}

export interface IDocumentObject {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
  lastModified: number;
}
