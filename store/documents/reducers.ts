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

    setPageDataToDocumentObject: (state :IRootState, action: PayloadAction<{name: string, text: string, imageUri?: string, pageNumber: number}>) => {
        let updateDocs = state.uploadedDocuments.map(doc => {
            if(doc.name === action.payload.name) {
                const updatedPages = [...doc.pagesDocument];
                updatedPages[action.payload.pageNumber] = { ...updatedPages[action.payload.pageNumber], text: action.payload.text };
                if(action.payload.imageUri) {
                    updatedPages[action.payload.pageNumber] = { ...updatedPages[action.payload.pageNumber], imageUri: action.payload.imageUri };
                }
                return { ...doc, pagesDocument: updatedPages };
            }
            return doc;
        });

        return{...state, uploadedDocuments: updateDocs as IRootState['uploadedDocuments']}
    },

    setAudioUriToPageDocument: (state :IRootState, action: PayloadAction<{name: string, pageNumber: number, audioUri: string}>) => {
        let updateDocs = state.uploadedDocuments.map(doc => {
            if(doc.name === action.payload.name) {
                const updatedPages = [...doc.pagesDocument];
                if(action.payload.audioUri) {
                    updatedPages[action.payload.pageNumber] = { ...updatedPages[action.payload.pageNumber], audioUri: action.payload.audioUri };
                }
                return { ...doc, pagesDocument: updatedPages };
            }
            return doc;
        });

        return{...state, uploadedDocuments: updateDocs as IRootState['uploadedDocuments']}
    },
    setCovertedStatus: (state :IRootState, action: PayloadAction<{name: string, isConverted: boolean}>) => {
        let updateDocs = state.uploadedDocuments.map(doc => {
            if(doc.name === action.payload.name) {
               
                return { ...doc, isConverted: action.payload.isConverted };
            }
            return doc;
        });

        return{...state, uploadedDocuments: updateDocs as IRootState['uploadedDocuments']}
    }
}

export {
    reducers,
};