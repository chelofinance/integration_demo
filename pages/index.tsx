import CreateMiniDaoProposal from "@shared/components/app/CreateMiniDaoProposal";
import CastVote from "@shared/components/app/CastVote";

const MyPage = () => {
  return (
    <div className="flex w-full">
      <div className="w-1/2 p-4">
        <CreateMiniDaoProposal />
      </div>
      <div className="w-1/2 p-4">
        <CastVote />
      </div>
    </div>
  );
};

export default MyPage;
