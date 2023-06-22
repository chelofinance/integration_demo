import {createAsyncThunk} from "@reduxjs/toolkit";
import {IMPL_IDS} from "mini-daos-sdk";
import * as actions from "@redux/constants";

// Define the action to add a proposal
export const onAddProposal = createAsyncThunk<
  MiniDaoProposal,
  {
    id: string;
    targets: string[];
    data: string[];
    values: number[];
    description: string;
    timelock: boolean;
  },
  {rejectValue: StateErrorType}
>(actions.CREATE_PROPOSAL, async (args) => {
  const {id, targets, data, values, description, timelock} = args;
  const proposal: MiniDaoProposal = {
    id,
    targets,
    data,
    values,
    description,
    executed: false,
    status: 0,
    timelock,
  };
  return proposal;
});

export const onAddMiniDao = createAsyncThunk<
  MiniDAO,
  {baseWallet: string; blockNumber: number; modules: {address: string}[]}
>(actions.CREATE_MINI_PROPOSAL, async (args) => {
  const {baseWallet, modules, blockNumber} = args;
  return {
    id: baseWallet,
    name: "",
    wallet: baseWallet,
    type: "chelo",
    isRoot: false,

    token: {address: "", decimals: 18},
    votesLength: "",
    votingDelay: "",
    votingPeriod: "",
    quorum: "",
    proposals: [],
    creationBlock: blockNumber,
    modules: modules.map((mod) => ({id: IMPL_IDS.DAO_MODULE, address: mod.address})),
  };
});

export const onAddMiniDaoProposal = createAsyncThunk<
  {proposal: MiniDaoProposal; dao: string},
  {
    id: string;
    targets: string[];
    data: string[];
    values: number[];
    description: string;
    dao: string;
    status: number;
    isWallet: boolean;
  },
  {rejectValue: StateErrorType}
>("dao/addProposal", async (args) => {
  const {id, targets, data, values, description, dao, status, isWallet} = args;
  const proposal: MiniDaoProposal = {
    id,
    targets,
    data,
    values,
    description,
    executed: false,
    isWallet,
    status,
  };

  return {proposal, dao};
});
