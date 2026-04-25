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
    }
}

export {
    reducers,
};