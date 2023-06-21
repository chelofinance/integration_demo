import React, {useState} from "react";
import {BigNumber} from "ethers";
import {useWeb3React} from "@web3-react/core";
import {getNetworkConfig} from "@helpers/network";
import {attach} from "@helpers/contracts";
import EthAddress from "../common/EthAddress";

const BalanceCard = ({userAddress}) => {
  const {chainId} = useWeb3React();
  const [balance, setBalance] = useState("0");
  const {addresses} = getNetworkConfig(chainId as any);

  const updateBalance = async () => {
    const tokenContract = attach("ERC20", addresses.mockToken);
    const newBalance: BigNumber = await tokenContract.balanceOf(userAddress);
    setBalance(newBalance.toString());
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-2">
      <div className="flex justify-between gap-4">
        <h2 className="text-md mb-2">Token Balance</h2>
        <button
          onClick={updateBalance}
          className="px-4 py-1 bg-blue-600 text-white rounded text-sm"
        >
          Update
        </button>
      </div>
      <div className="flex">
        <div className="flex flex-col">
          <p className="text-sm">
            Token Address: <EthAddress address={addresses.mockToken} clipboard length={10} />
          </p>
          <p className="text-sm">
            Account: <EthAddress address={userAddress} clipboard length={10} />
          </p>
          <p className="text-sm">Balance: {balance}</p>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
