import {createAsyncThunk, createAction} from "@reduxjs/toolkit";

import * as actionTypes from "@redux/constants";
import {addNetwork, getNetworkProvider, switchNetwork} from "@helpers/index";
import {ConnectionType} from "@helpers/connection";
import {Connector} from "@web3-react/types";
import {getConnection} from "@helpers/connection/utils";
import {TransactionMeta} from "types";
import {getNetworkConfig} from "@helpers/network";
import {RootState} from "@redux/store";
import {attach} from "@helpers/contracts";
import {TokenRoles} from "@shared/constants";

export const onConnectWallet = createAsyncThunk<
  {
    erc20: ERC20[];
    erc721: ERC721[];
    account: string;
    wallet: ConnectionType;
    networkId: SupportedNetworks;
  },
  {connection: Connector; account: string; chainId: number},
  {rejectValue: StateErrorType}
>(actionTypes.CONNECT_WALLET, async (args, {rejectWithValue, dispatch}) => {
  let {connection, account, chainId} = args;

  console.log("connect network");
  return {
    erc20: [],
    erc721: [],
    account,
    wallet: getConnection(connection).type,
    networkId: chainId as SupportedNetworks,
  };
});

export const onDisconnectWallet = createAsyncThunk(actionTypes.CONNECT_WALLET, () => {
  return {
    account: "",
    erc20: [],
    erc721: [],
    wallet: "",
    networkId: 1,
  };
});

export const onSwitchNetwork = createAsyncThunk<
  {network: SupportedNetworks},
  {networkId: SupportedNetworks; connector: Connector},
  {rejectValue: StateErrorType}
>(
  actionTypes.SWITCH_NETWORK,
  async (
    {networkId, connector}: {networkId: SupportedNetworks; connector: Connector},
    {rejectWithValue}
  ) => {
    try {
      await connector.activate(networkId);
      await switchNetwork(networkId); //rinkeby

      return {network: networkId};
    } catch (err) {
      console.log({err});
      const network = getNetworkConfig(networkId);
      try {
        if (err.code === 4902) {
          await addNetwork({
            chainId: networkId,
            name: network.settings.name,
            currency: {
              name: network.settings.currency,
              decimals: 18,
              symbol: network.settings.currency,
            },
            rpcUrl: network.settings.explorer,
          });
          return {network: networkId};
        } else if (err.code === -32603) {
          return rejectWithValue({
            message: `Seems like we can't switch network automatically. Please check if you can change it from the wallet`,
            code: err.code,
            open: true,
          } as StateErrorType);
        }
      } catch (err) {
        console.log({onConnectWallet: err});
      }
      return rejectWithValue({
        message: err.message,
        code: err.code,
        open: true,
      } as StateErrorType);
    }
  }
);

export const onUpdateError = createAction(
  actionTypes.UPDATE_ERROR,
  (error: {message?: string; code?: string; open?: boolean}) => {
    return {payload: error};
  }
);

export const onShowTransaction = createAction(
  actionTypes.SHOW_TRANSACTION,
  (transactionInfo: TransactionMeta | boolean) => {
    return {
      payload: transactionInfo,
    };
  }
);
