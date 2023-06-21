import React from "react";
import {useAppSelector, useAppDispatch} from "@redux/store";
import {onAddMiniDao} from "@redux/actions"; // import the action
import {getNetworkConfig} from "@helpers/network"; // import the necessary utilities
import {getLogs} from "@helpers/index";
import {attach} from "@helpers/contracts";
import {Formik, Form} from "formik";
import * as Yup from "yup";
import {useWeb3React} from "@web3-react/core";
import {TextInput} from "@shared/components/common/Forms";
import {getNetworkProvider} from "@helpers/index";
import {Button} from "@shared/components/common/Forms";
import {ethers} from "ethers";

type Module = {
  address: string;
  id: string;
};

const GetMiniDao: React.FC = () => {
  const {
    user: {account},
  } = useAppSelector((state) => state);
  const dispatch = useAppDispatch();

  const handleExecution = async (values: {blockHeight: string}) => {
    const {addresses} = getNetworkConfig(account.networkId);
    const factory = attach("DaoFactory", addresses.factory, getNetworkProvider(account.networkId));
    const chainProvider = getNetworkProvider(account.networkId);

    try {
      // Get the block number of the latest block
      const latestBlockNumber = await chainProvider.getBlockNumber();
      const logs = await chainProvider.getLogs({
        fromBlock: Number(values.blockHeight),
        toBlock: latestBlockNumber,
        address: factory.address,
      });

      const decoded = logs
        .map((log) => {
          const decodedLog = factory.interface.parseLog(log);

          // If the event is BaseWalletCreated or ModuleCreated, console.log it
          if (decodedLog.name === "BaseWalletCreated" || decodedLog.name === "ModuleCreated") {
            return {
              log: decodedLog,
              blockNumber: log.blockNumber,
            };
          }
          return null;
        })
        .filter(Boolean)
        .reduce((acc, {log, blockNumber}) => {
          console.log({log, blockNumber});
          if (log.name === "BaseWalletCreated")
            return {
              [blockNumber]: {
                baseWallet: log.args.wallet,
                modules: acc[blockNumber].modules || [],
              },
            };
          else {
            const modInfo = {address: log.args.module};
            return {
              [blockNumber]: {
                ...acc[blockNumber],
                modules: acc[blockNumber]?.modules
                  ? acc[blockNumber].modules.push(modInfo)
                  : [modInfo],
              },
            };
          }
        }, {} as Record<string, {baseWallet: string; blockNumber: number; modules: {address: string}[]}>);

      for (let [blockNumber, info] of Object.entries(decoded)) {
        dispatch(
          onAddMiniDao({
            baseWallet: info.baseWallet,
            modules: info.modules,
            blockNumber,
          } as any)
        );
      }
    } catch (err) {
      console.log("execute proposal", err);
    }
  };

  return (
    <div className="flex flex-col items-start bg-white rounded-lg shadow-md p-6">
      <Formik
        initialValues={{
          blockHeight: "",
        }}
        validationSchema={Yup.object({
          blockHeight: Yup.string().required("Block Height is required"),
        })}
        onSubmit={handleExecution}
      >
        {() => (
          <Form>
            <TextInput
              type="text"
              white
              label="Block Height"
              name="blockHeight"
              classes={{root: "w-full mb-4"}}
              placeholder="Enter Block Height"
            />
            <Button type="submit">Add Mini Dao</Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default GetMiniDao;
