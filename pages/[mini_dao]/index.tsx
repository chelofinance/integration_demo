import MiniDaoProposal from "@shared/components/app/MiniDaoProposal";
import ShowProposals from "@shared/components/app/ShowProposals";
import BalanceCard from "@shared/components/app/AddressBalance";
import {useRouter} from "next/router";
import {ethers} from "ethers";

const MiniDao = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col">
      <div className="absolute top-3 left-10">
        <BalanceCard userAddress={router.query?.mini_dao || ethers.constants.AddressZero} />
      </div>
      <div className="flex justify-around w-full">
        <MiniDaoProposal />
        <ShowProposals />
      </div>
    </div>
  );
};

export default MiniDao;
