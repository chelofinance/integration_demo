import axios from "axios";
import {BigNumber, ethers} from "ethers";
import {TokenList} from "@uniswap/token-lists";

import {attach} from "@helpers/contracts";
import {getNetworkConfig} from "@helpers/network";

export const DEFAULT_TOKEN_LIST = "https://gateway.ipfs.io/ipns/tokens.uniswap.org";

const listCache = new Map<string, TokenList>();

export const getTokenList = async (): Promise<TokenList> => {
  const cached = listCache?.get(DEFAULT_TOKEN_LIST); // avoid spurious re-fetches
  if (cached) {
    return cached;
  }
  const res = await axios.get(DEFAULT_TOKEN_LIST);
  return res.data;
};

export const addDecimals = async (token: string, value: string, provider: string) => {
  const tokenContract = attach("ERC20", token, provider);
  const decimals = await tokenContract.decimals();
  return addTokenDecimals({value, decimals});
};

export const addTokenDecimals = (args: {value: string; decimals: number}) => {
  const {value, decimals} = args;
  return value + (10 ** decimals).toString().replace("1", "");
};

export const formatValue = async ({
  token,
  value,
  maxDecimals,
}: {
  token: string;
  value: string;
  maxDecimals?: number;
}) => {
  const tokenContract = attach("ERC20", token);
  const decimals = await tokenContract.decimals();

  return formatValueWithDecimals({value, decimals, maxDecimals});
};

export const formatValueWithDecimals = ({
  value,
  decimals,
  maxDecimals,
}: {
  value: string;
  decimals: number;
  maxDecimals?: number;
}) => {
  const bg = ethers.BigNumber.from(value);
  const pow = ethers.BigNumber.from(10).pow(decimals);
  const last = bg.mod(pow).toString();
  return `${bg.div(pow).toString()}.${maxDecimals ? last.slice(0, maxDecimals) : last}`;
};

const ARBITRUM_LIST = "https://bridge.arbitrum.io/token-list-42161.json";

export const getTokensList = async () => {
  const {
    data: {tokens},
  } = await axios.get(ARBITRUM_LIST);
  return tokens.filter((tkn: any) => tkn.chainId === 1);
};

export const loadERC20 = async (token: string, networkId: SupportedNetworks): Promise<ERC20> => {
  const {provider} = getNetworkConfig(networkId);
  const tokenContract = attach("ERC20", token, provider);
  const [symbol, name, totalSupply, decimals] = await Promise.all([
    tokenContract.symbol(),
    tokenContract.name(),
    tokenContract.totalSupply(),
    tokenContract.decimals(),
  ]);

  return {symbol, name, totalSupply: totalSupply.toString(), decimals, address: token};
};

export const prettifyNumber = (number: BigNumber) => {
  const strNumber = number.toString();
  const units = ["k", "M", "B", "T"];
  const length = strNumber.length;
  const unitIndex = Math.floor((length - 1) / 3);

  if (unitIndex === 0) {
    return strNumber;
  } else {
    const integerPart = strNumber.slice(0, length - unitIndex * 3);
    const decimalPart = strNumber.slice(length - unitIndex * 3, length - unitIndex * 3 + 1);
    return integerPart + "." + decimalPart + units[unitIndex - 1];
  }
};
