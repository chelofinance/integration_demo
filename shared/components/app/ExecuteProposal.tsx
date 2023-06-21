import React from "react";
import {useAppDispatch, useAppSelector} from "@redux/store";
import {Formik, Form} from "formik";
import * as Yup from "yup";
import SelectInput from "@shared/components/common/Forms/SelectInput";
import {useWeb3React} from "@web3-react/core";
import {getNetworkConfig} from "@helpers/network";
import {attach} from "@helpers/contracts";
import {getLogs, getNetworkProvider} from "@helpers/index";
import {onAddMiniDao} from "@redux/actions";
import {ContractTransaction} from "ethers";

const ExecuteProposal = () => {
  const [loading, setLoading] = React.useState(false);
  const [contracts, setContracts] = React.useState({});
  const {proposals} = useAppSelector((state) => state.daos);
  const {chainId, provider} = useWeb3React();
  const dispatch = useAppDispatch();
  const addresses = getNetworkConfig(chainId as any)?.addresses;

  const handleExecution = async (values: {proposalId: string}) => {
    const govBravo = attach("GovernorBravoDelegate", addresses.govBravo, provider.getSigner());
    const factory = attach("DaoFactory", addresses.factory, getNetworkProvider(chainId as any));

    console.log({state: await govBravo.state(values.proposalId)});
    try {
      await (await govBravo.queue(values.proposalId)).wait();
    } catch (err) {
      console.log("queued", err);
    }

    try {
      const tx: ContractTransaction = await govBravo.execute(values.proposalId);
      const logs = getLogs(factory, await tx.wait());
      const baseWallet = logs.find((log) => log.name === "BaseWalletCreated").args.wallet;
      const modules = logs
        .filter((log) => log.name === "ModuleCreated")
        .map((log) => ({address: log.args.module, id: log.args.implId}));

      dispatch(onAddMiniDao({baseWallet, modules, blockNumber: tx.blockNumber}));
    } catch (err) {
      console.log("execute proposal", err);
    }
  };

  return (
    <div className="font-sans text-center mx-auto">
      <h1 className="text-2xl mb-4">Execute Proposal</h1>
      <div className="flex flex-col justify-center items-center bg-white rounded-lg shadow-md p-6">
        <Formik
          initialValues={{
            proposalId: "",
          }}
          validationSchema={Yup.object({
            proposalId: Yup.string().required("Proposal ID is required"),
          })}
          onSubmit={handleExecution}
        >
          {() => (
            <Form>
              <div>
                <label className="font-bold">Proposal: </label>
                <SelectInput
                  name="proposalId"
                  items={proposals.map(({id}) => ({value: id, label: id}))}
                  white
                  placeholder="Select a proposal"
                />
              </div>
              {loading ? (
                <div className="flex flex-col items-center mt-3">
                  <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
                  <span>Ethereum transactions may take a few minutes to be mined.</span>
                </div>
              ) : null}
              <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
                Execute Proposal
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ExecuteProposal;
