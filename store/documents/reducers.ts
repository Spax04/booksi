import { PayloadAction } from "@reduxjs/toolkit";
import { IRootState } from "./types";

const reducers = {
    setNewDocumnetObject: (state :IRootState, action: PayloadAction<IRootState['uploadedDocuments'][number]>) => {
        if(state.uploadedDocuments.some(doc => doc.name === action.payload.name)) {
            return state;
        }

        return {
        ...state,
        uploadedDocuments: [... state.uploadedDocuments, action.payload] as IRootState['uploadedDocuments'],
        }
    },

    removeSelectedDocumnetObject: (state :IRootState, action: PayloadAction<IRootState['uploadedDocuments'][number]>) => {
        let updateDocs = state.uploadedDocuments.filter(doc => doc.name !== action.payload.name);

        return {
        ...state,
        uploadedDocuments: updateDocs as IRootState['uploadedDocuments'],
        }
    },

    setPageDataToDocumentObject: (state :IRootState, action: PayloadAction<{name: string, text: string, imageUri?: string}>) => {
        let updateDocs = state.uploadedDocuments.filter(doc => doc.name !== action.payload.name);

        updateDocs[0]?.pagesDocument.push({
            text: action.payload.text,
            imageUri: action.payload.imageUri
        });

        return{...state, uploadedDocuments: updateDocs as IRootState['uploadedDocuments']}
    },

    setPagesCount: (state :IRootState, action: PayloadAction<{name: string, pageCount: number}>) => {
        let updateDocs = state.uploadedDocuments.filter(doc => doc.name !== action.payload.name);
        if(updateDocs[0]) {
            updateDocs[0].pageCount = action.payload.pageCount;
        }

        return{...state, uploadedDocuments: updateDocs as IRootState['uploadedDocuments']}
    }
}

export {
    reducers,
};