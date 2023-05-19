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

type Dao = {
  baseWallet: string;
  modules: Module[];
};

const GetMiniDao: React.FC = () => {
  const {
    daos: {daos},
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
            return decodedLog;
          }
          return null;
        })
        .filter(Boolean)
        .reduce((acc, cur) => {
          if (cur.name === "BaseWalletCreated")
            return [
              ...acc,
              {
                baseWallet: cur.args.wallet,
                blockNumber: values.blockHeight,
                modules: [] as {address: string}[],
              },
            ];

          const last = acc.length - 1;
          acc[last].modules.push({address: cur.args.module});

          return acc;
        }, [] as {baseWallet: string; blockNumber: number; modules: {address: string}[]}[]);

      for (let mini of decoded) {
        console.log(mini);
        dispatch(
          onAddMiniDao({
            baseWallet: mini.baseWallet,
            modules: mini.modules,
            blockNumber: mini.blockNumber,
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
