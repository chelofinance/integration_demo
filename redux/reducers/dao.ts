import {createReducer} from "@reduxjs/toolkit";
import * as actions from "@redux/actions";

// Define the DAO state type
type DaoState = {
    proposals: MiniDaoProposal[];
    daos: {
        baseWallet: string;
        creationBlock: number;
        modules: {address: string}[];
    }[];
};

// Define the initial state
const initialState: DaoState = {
    proposals: [],
    daos: [],
};

// Define the reducer
export const daoReducer = createReducer(initialState, (builder) => {
    builder.addCase(actions.onAddProposal.fulfilled, (state: DaoState, action) => {
        state.proposals.push(action.payload);
    });

    builder.addCase(actions.onAddMiniDao.fulfilled, (state: DaoState, action) => {
        state.daos.push(action.payload);
    });

    // handle the rejected case if needed for onAddMiniDao
    builder.addCase(actions.onAddMiniDao.rejected, (state: DaoState, action) => {
        // handle the error
    });

    // handle the rejected case if needed
    builder.addCase(actions.onAddProposal.rejected, (state: DaoState, action) => {
        // handle the error
    });
});
