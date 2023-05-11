import { useEffect, useState } from "react";
import { ethers } from "ethers";

const CastVote = () => {
  const [address, setAddress] = useState("");
  const [voteWeight, setVoteWeight] = useState("");
  const [proposal, setProposal] = useState("");
  const [vote, setVote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
    } else {
      console.error("Ethereum is not connected. Connect your Ethereum wallet or install one.");
    }
  }, []);

  return (
    <div className="font-sans text-center mx-auto">
      <h1 className="text-2xl mb-4">Cast My Vote</h1>
      <div className="max-w-md mx-auto text-lg border border-gray-300 rounded-xl p-6 my-2 shadow-sm">
        <div>
          <label className="font-bold">My Address: </label>
          <span>{address}</span>
        </div>
        <div>
          <label className="font-bold">My Vote Weight: </label>
          <span>{voteWeight}</span>
        </div>
        <div>
          <label className="font-bold">Proposal: </label>
          <select value={proposal} onChange={(e) => setProposal(e.target.value)} className="mx-2">
            {/* Options */}
          </select>
        </div>
        <div>
          <label className="font-bold">Vote: </label>
          <div>
            <input
              type="radio"
              id="for"
              name="vote"
              value="for"
              onChange={(e) => setVote(e.target.value)}
              className="mx-1"
            />
            <label htmlFor="for" className="mx-2">
              For
            </label>
            <input
              type="radio"
              id="against"
              name="vote"
              value="against"
              onChange={(e) => setVote(e.target.value)}
              className="mx-1"
            />
            <label htmlFor="against" className="mx-2">
              Against
            </label>
            <input
              type="radio"
              id="abstain"
              name="vote"
              value="abstain"
              onChange={(e) => setVote(e.target.value)}
              className="mx-1"
            />
            <label htmlFor="abstain" className="mx-2">
              Abstain
            </label>
          </div>
        </div>
        {loading ? (
          <div className="flex flex-col items-center mt-3">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
            <span>Ethereum transactions may take a few minutes to be mined.</span>
          </div>
        ) : null}
        <button
          onClick={() => {
            /* Send vote */
          }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Cast Vote
        </button>
      </div>
    </div>
  );
};

export default CastVote;
