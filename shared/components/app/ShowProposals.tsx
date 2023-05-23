//import React from 'react';
import {useAppSelector, useAppDispatch} from "@redux/store";
import Link from "next/link";
import {useRouter} from "next/router";
import {getNetworkProvider} from "@helpers/index";
import {onAddMiniDaoProposal, onAddProposal} from "@redux/actions";
import {getNetworkConfig} from "@helpers/network";
import {attach} from "@helpers/contracts";
import {hash} from "mini-daos-sdk";
import {useWeb3React} from "@web3-react/core";

const proposalState = {
  0: "Pending",
  1: "Active",
  2: "Canceled",
  3: "Defeated",
  4: "Succeeded",
  5: "Queued",
  6: "Expired",
  7: "Executed",
};

const ShowProposals: React.FC = () => {
  const {
    daos: {mini_daos},
    user: {account},
  } = useAppSelector((state) => state);
  const {provider} = useWeb3React();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {addresses} = getNetworkConfig(account.networkId || 31337);
  const miniDao = mini_daos.find((mini) => mini.id === router.query.mini_dao);
  const proposals = miniDao?.proposals.map((prop) => ({id: prop.id.toString(), ...prop}));

  const handleLoadProposals = async () => {
    const dao = attach(
      "DaoModule",
      miniDao.modules[0].address,
      getNetworkProvider(account.networkId)
    );

    try {
      const latestBlockNumber = await dao.provider.getBlockNumber();
      const logs = await dao.provider.getLogs({
        fromBlock: Number(miniDao.creationBlock),
        toBlock: latestBlockNumber,
        address: miniDao.modules[0].address,
      });

      const decoded = logs
        .map((log) => {
          try {
            const decodedLog = dao.interface.parseLog(log);

            // If the event is ProposalCreated, return it
            if (decodedLog.name === "ProposalCreated") {
              return decodedLog;
            }
          } catch (err) {}
          return null;
        })
        .filter(Boolean);

      for (let proposalLog of decoded) {
        const description = proposalLog.args.description;
        const calldata = proposalLog.args.calldatas[0];
        const miniDao = mini_daos.find((mini) => mini.id === router.query.mini_dao);
        const id = proposalLog.args.proposalId.toString();
        const status: number = await dao.state(id);

        dispatch(
          onAddMiniDaoProposal({
            id: proposalLog.args.proposalId.toString(),
            targets: [proposalLog.args.targets[0]],
            data: [calldata],
            values: [0],
            description: description,
            dao: miniDao.id,
            status,
          })
        );
      }
    } catch (err) {
      console.log("load proposals", err);
    }
  };

  const handleRevoke = async (proposal: MiniDaoProposal) => {
    try {
      const govBravo = attach("GovernorBravoDelegate", addresses.govBravo, provider.getSigner());
      const miniDaoContract = attach("DaoModule", miniDao.modules[0].address, provider.getSigner());
      const args = [proposal.targets, proposal.values, proposal.data, hash(proposal.description)];
      const calldata = miniDaoContract.interface.encodeFunctionData("cancel", args);
      const description = "Cancel mini dao proposal (Revoke)";

      const proposalId = await govBravo.callStatic.propose(
        [miniDao.id],
        [0],
        [""],
        [calldata],
        description
      );

      //const id = await miniDaoContract.hashProposal(...args);
      //console.log({
      //hash: id,
      //state: await miniDaoContract.state(id),
      //});
      //return;

      await govBravo.propose([miniDao.modules[0].address], [0], [""], [calldata], description);

      dispatch(
        onAddProposal({
          id: proposalId.toString(),
          targets: [miniDao.id],
          values: [0],
          data: [calldata],
          description,
        })
      );
    } catch (err) {
      console.log("ERROR", err);
    }
  };

  return (
    <div className="flex flex-col items-start bg-white rounded-lg shadow-md p-6">
      <span> Proposals</span>
      {proposals?.map((proposal: MiniDaoProposal, index: number) => (
        <div key={index} className="mb-4">
          <h2 className="text-xl font-bold mb-2">
            Proposal ID:{" "}
            {proposal?.id ? proposal.id?.slice(0, 8) + "..." + proposal.id?.slice(-8) : "..."}
          </h2>
          <div className="flex flex-col">
            <h3 className="text-lg font-bold mb-2">Description:</h3>
            <span className="">{proposal.description}</span>
          </div>
          <div className="flex flex-col">
            <h3 className="text-lg font-bold mb-2">Target Addresses:</h3>
            {proposal.targets.map((target: string, targetIndex: number) => (
              <p key={targetIndex} className="ml-4">
                {target}
              </p>
            ))}
          </div>
          <div className="flex flex-col">
            <h3 className="text-lg font-bold mb-2">Status:</h3>
            <span className="">{proposalState[proposal.status]}</span>
          </div>

          <div className="flex justify-between mt-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={() => handleRevoke(proposal)}
            >
              Revoke
            </button>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded"
              onClick={() => {
                /* Implement vote action here */
              }}
            >
              Vote
            </button>
          </div>
        </div>
      ))}
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded mt-4"
        onClick={handleLoadProposals}
      >
        Load Proposals
      </button>
    </div>
  );
};

export default ShowProposals;
