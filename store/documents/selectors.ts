import { RootState } from "../index";

const getDocumentList = (state: RootState) => state.documentReducer.uploadedDocuments;
const getDocumentByName = (state: RootState, name: string) => state.documentReducer.uploadedDocuments.find(doc => doc.name === name);
const isAllPagesReady = (state: RootState, name: string): boolean => {
  const doc = state.documentReducer.uploadedDocuments.find(doc => doc.name === name);
  return doc?.pagesDocument.every(page => page.isPageReady === true) ?? false;
};

export {
    getDocumentList,
    getDocumentByName,
    isAllPagesReady
}