import CreateMiniDaoProposal from "@shared/components/app/CreateMiniDaoProposal";
import CreateStakingPool from "@shared/components/app/CreateStakingPool";
import CastVote from "@shared/components/app/CastVote";
import ExecuteProposal from "@shared/components/app/ExecuteProposal";
import GetMiniDao from "@shared/components/app/GetMiniDao";
import ShowMiniDao from "@shared/components/app/ShowMiniDao";
import BalanceCard from "@shared/components/app/AddressBalance";
import {getNetworkConfig} from "@helpers/network";
import {useWeb3React} from "@web3-react/core";
import {ethers} from "ethers";

const MyPage = () => {
  const {chainId} = useWeb3React();
  const addresses = getNetworkConfig(chainId as any)?.addresses || {
    timelock: ethers.constants.AddressZero,
  };

  return (
    <div className="flex flex-col">
      <div className="absolute top-3 left-10">
        <BalanceCard userAddress={addresses.timelock} />
      </div>
      <div className="flex justify-between w-full pt-10">
        <div className="">
          <CreateMiniDaoProposal />
        </div>
        <div className="">
          <CreateStakingPool />
        </div>
        <div className="flex flex-col ">
          <CastVote />
          <ExecuteProposal />
        </div>
      </div>
      <div className="flex w-full justify-around mb-10">
        <GetMiniDao />
        <ShowMiniDao />
      </div>
    </div>
  );
};

export default MyPage;
