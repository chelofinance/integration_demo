import {createAsyncThunk} from "@reduxjs/toolkit";

// Define the action to add a proposal
export const onAddProposal = createAsyncThunk<
  MiniDaoProposal,
  {id: string; targets: string[]; data: string[]; values: number[]; description: string},
  {rejectValue: StateErrorType}
>("dao/addProposal", async (args) => {
  const {id, targets, data, values, description} = args;
  const proposal: MiniDaoProposal = {
    id,
    targets,
    data,
    values,
    description,
    executed: false,
  };
  return proposal;
});

export const onAddMiniDao = createAsyncThunk<
  {baseWallet: string; modules: {address: string}[]},
  {baseWallet: string; modules: {address: string}[]}
>("dao/addMiniDao", async (args) => {
  const {baseWallet, modules} = args;
  return {baseWallet, modules};
});
