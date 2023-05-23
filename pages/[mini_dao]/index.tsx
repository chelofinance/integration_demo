import MiniDaoProposal from "@shared/components/app/MiniDaoProposal";
import ShowProposals from "@shared/components/app/ShowProposals";

const MiniDao = () => {
  return (
    <div className="flex flex-col">
      <div className="flex justify-around w-full">
        <MiniDaoProposal />
        <ShowProposals />
      </div>
    </div>
  );
};

export default MiniDao;
