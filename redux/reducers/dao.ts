import {createReducer} from "@reduxjs/toolkit";
import * as actions from "@redux/actions";

// Define the DAO state type
type DaoState = {
    proposals: MiniDaoProposal[];
    mini_daos: MiniDAO[];
};

// Define the initial state
const initialState: DaoState = {
    proposals: [],
    mini_daos: [],
};

// Define the reducer
export const daoReducer = createReducer(initialState, (builder) => {
    builder.addCase(actions.onAddProposal.fulfilled, (state: DaoState, action) => {
        state.proposals.push(action.payload);
    });

    builder.addCase(actions.onAddMiniDao.fulfilled, (state: DaoState, action) => {
        if (state.mini_daos.some((dao) => dao.id === action.payload.id)) return;
        state.mini_daos.push(action.payload);
    });

    builder.addCase(actions.onAddMiniDaoProposal.fulfilled, (state: DaoState, action) => {
        const {proposal, dao} = action.payload;
        const miniDao = state.mini_daos.find((miniDao) => miniDao.id === dao);
        if (miniDao) {
            const index = miniDao.proposals.findIndex((prop) => prop.id === proposal.id);
            if (index >= 0) {
                miniDao.proposals[index] = proposal;
            } else {
                miniDao.proposals.push(proposal);
            }
        }
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
