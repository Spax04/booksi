import { RootState } from "../index";

const getDocumentList = (state: RootState) => state.documentReducer.uploadedDocuments;
const getDocumentByName = (state: RootState, name: string) => state.documentReducer.uploadedDocuments.find(doc => doc.name === name);


export {
    getDocumentList,
    getDocumentByName
}