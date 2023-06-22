//import React from 'react';
import {useAppSelector, useAppDispatch} from "@redux/store";
import {useRouter} from "next/router";
import {getNetworkProvider} from "@helpers/index";
import {onAddMiniDaoProposal, onAddProposal} from "@redux/actions";
import {getNetworkConfig} from "@helpers/network";
import {attach} from "@helpers/contracts";
import {hash} from "mini-daos-sdk";
import {useWeb3React} from "@web3-react/core";
import {ethers} from "ethers";

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

  const moduleProposals = async () => {
    const dao = attach(
      "DaoModule",
      miniDao.modules[0].address,
      getNetworkProvider(account.networkId)
    );
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

    return decoded.map((log) => ({
      id: log.args.proposalId.toString(),
      target: log.args.targets[0],
      description: log.args.description,
      calldata: log.args.calldatas[0],
      value: 0,
      isWallet: false,
    }));
  };

  const walletProposals = async () => {
    const wallet = attach("BaseWallet", miniDao.id, getNetworkProvider(account.networkId));
    const latestBlockNumber = await wallet.provider.getBlockNumber();
    const logs = await wallet.provider.getLogs({
      fromBlock: Number(miniDao.creationBlock),
      toBlock: latestBlockNumber,
      address: miniDao.id,
    });

    const decoded = logs
      .map((log) => {
        try {
          const decodedLog = wallet.interface.parseLog(log);

          console.log(decodedLog);
          // If the event is ProposalCreated, return it
          if (decodedLog.name === "CallScheduled") {
            return decodedLog;
          }
        } catch (err) {}
        return null;
      })
      .filter(Boolean);

    return decoded.map((log) => ({
      target: log.args.target,
      description: "",
      calldata: log.args.data,
      value: 0,
      id: hash(log.args.target),
      isWallet: true,
    }));
  };

  const handleLoadProposals = async () => {
    try {
      const dao = attach(
        "DaoModule",
        miniDao.modules[0].address,
        getNetworkProvider(account.networkId)
      );
      const moduleLogs = await moduleProposals();
      const walletLogs = await walletProposals();
      const decoded = moduleLogs.concat(walletLogs);

      for (let proposalLog of decoded) {
        const description = proposalLog.description;
        const calldata = proposalLog.calldata;
        const miniDao = mini_daos.find((mini) => mini.id === router.query.mini_dao);
        const id = proposalLog.id;
        const status: number = proposalLog.isWallet ? 4 : await dao.state(id);

        dispatch(
          onAddMiniDaoProposal({
            id: proposalLog.id,
            targets: [proposalLog.target],
            data: [calldata],
            values: [0],
            description: description,
            dao: miniDao.id,
            isWallet: proposalLog.isWallet,
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
        [miniDao.modules[0].address],
        [0],
        [""],
        [calldata],
        description
      );

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

  const handleWithdrawFunds = async () => {
    try {
      const govBravo = attach("GovernorBravoDelegate", addresses.govBravo, provider.getSigner());
      const miniDaoContract = attach("BaseWallet", miniDao.id, provider.getSigner());
      const mockToken = attach("ERC20", addresses.mockToken, provider.getSigner());

      const balance = (await mockToken.balanceOf(miniDao.id)).toString();
      const args = [
        mockToken.address,
        0,
        mockToken.interface.encodeFunctionData("transfer", [addresses.timelock, balance]),
        ethers.constants.HashZero,
        ethers.constants.HashZero,
        await miniDaoContract.getMinDelay(),
      ];
      const calldata = miniDaoContract.interface.encodeFunctionData("schedule", args);
      const description = "Withdraw funds";

      const proposalId = await govBravo.callStatic.propose(
        [miniDao.id],
        [0],
        [""],
        [calldata],
        description
      );

      await govBravo.propose([miniDao.id], [0], [""], [calldata], description);

      dispatch(
        onAddProposal({
          id: proposalId.toString(),
          targets: [miniDao.id],
          values: [0],
          data: [calldata],
          description,
          timelock: true,
        })
      );
    } catch (err) {
      console.log("ERROR", err);
    }
  };

  const handleVote = async (proposal: MiniDaoProposal) => {
    const miniDaoContract = attach("DaoModule", miniDao.modules[0].address, provider.getSigner());

    await miniDaoContract.castVote(proposal.id, 1);
  };

  const handleTimelockExecute = async (prop: MiniDaoProposal) => {
    const govBravo = attach("GovernorBravoDelegate", addresses.govBravo, provider.getSigner());
    const miniDaoContract = attach("BaseWallet", miniDao.id, provider.getSigner());
    const mockToken = attach("ERC20", addresses.mockToken, provider.getSigner());

    const balance = (await mockToken.balanceOf(miniDao.id)).toString();
    const args = [
      mockToken.address,
      0,
      mockToken.interface.encodeFunctionData("transfer", [addresses.timelock, balance]),
      ethers.constants.HashZero,
      ethers.constants.HashZero,
    ];
    await miniDaoContract.execute(...args);
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

          {proposal.isWallet ? (
            <div className="flex justify-between mt-4">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={() => handleTimelockExecute(proposal)}
              >
                Execute
              </button>
            </div>
          ) : (
            <div className="flex justify-between mt-4">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={() => handleRevoke(proposal)}
              >
                Revoke
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={() => handleVote(proposal)}
              >
                {proposal.status === 4 ? "Queue" : "Vote"}
              </button>
            </div>
          )}
        </div>
      ))}

      <div className="flex justify-between mt-4 w-full">
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleLoadProposals}>
          Load Proposals
        </button>
        <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={handleWithdrawFunds}>
          Withdraw Funds
        </button>
      </div>
    </div>
  );
};

export default ShowProposals;
