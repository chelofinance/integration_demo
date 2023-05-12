import React from "react";
import {useAppSelector} from "@redux/store";
import {Formik, Form, Field} from "formik";
import * as Yup from "yup";
import SelectInput from "@shared/components/common/Forms/SelectInput";
import {useWeb3React} from "@web3-react/core";
import {getNetworkConfig} from "@helpers/network";
import {attach} from "@helpers/contracts";

const CastVote = () => {
  const [loading, setLoading] = React.useState(false);
  const {proposals} = useAppSelector((state) => state.daos);
  const {chainId, provider} = useWeb3React();
  const addresses = getNetworkConfig(chainId as any)?.addresses;

  const handleVote = async (values: {proposalId: string; vote: string}) => {
    const govBravo = attach("GovernorBravoDelegate", addresses.govBravo, provider.getSigner());
    const voteMapping = {
      against: 0,
      for: 1,
      abstain: 2,
    };

    try {
      await govBravo.castVote(values.proposalId, voteMapping[values.vote]);
    } catch (err) {
      console.log("cast vote", err);
    }
  };

  const checkState = async () => {
    const govBravo = attach("GovernorBravoDelegate", addresses.govBravo, provider.getSigner());
    const endBlock = await govBravo.proposals(proposals[0].id).endBlock;

    const state = await govBravo.state(proposals[0].id);
    console.log("STATE", state, endBlock);
  };

  React.useEffect(() => {
    //if (proposals.length > 0) setInterval(checkState, 1000);
  }, [proposals?.length]);

  return (
    <div className="font-sans text-center mx-auto">
      <h1 className="text-2xl mb-4">Cast My Vote</h1>
      <div className="flex flex-col justify-center items-center bg-white rounded-lg shadow-md p-6">
        <Formik
          initialValues={{
            proposalId: "",
            vote: "",
          }}
          validationSchema={Yup.object({
            proposalId: Yup.string().required("Proposal ID is required"),
            vote: Yup.string().required("Vote is required"),
          })}
          onSubmit={handleVote}
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
              <div>
                <label className="font-bold">Vote: </label>
                <div>
                  <label>
                    <Field type="radio" name="vote" value="for" />
                    For
                  </label>
                  <label>
                    <Field type="radio" name="vote" value="against" />
                    Against
                  </label>
                  <label>
                    <Field type="radio" name="vote" value="abstain" />
                    Abstain
                  </label>
                </div>
                {loading ? (
                  <div className="flex flex-col items-center mt-3">
                    <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
                    <span>Ethereum transactions may take a few minutes to be mined.</span>
                  </div>
                ) : null}
                <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
                  Cast Vote
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CastVote;
