import {Form, Formik} from "formik";
import * as Yup from "yup";
import {Button, TextInput} from "@shared/components/common/Forms";
import {attach} from "@helpers/contracts";
import {useWeb3React} from "@web3-react/core";
import {getNetworkConfig} from "@helpers/network";
import {getNetworkProvider, hash} from "@helpers/index";
import {ethers} from "ethers";
import {DEFAULT_DAO_SETTINGS} from "@shared/constants";
import {useAppDispatch} from "@redux/store";
import {onAddProposal} from "@redux/actions";

type FormValues = {
  name: string;
  votingPeriod: string;
  quorum: string;
};

const daoInitUpdates = async (args: {
  wallet?: string;
  factory?: string;
  registry: string;
  token: string;
  owner: string;
  settings: any;
}) => {
  const coreIface = new ethers.utils.Interface([
    "function initialize((string name, uint256 lifetime, uint256 votingPeriod, uint256 votingDelay, uint256 quorum, uint256 proposalThreshold), address initToken, address _baseWallet, address _registry)",
    "function grantRole(bytes32 role, address account)",
    "function renounceRole(bytes32 role, address account)",
  ]);

  const settings = args.settings;
  const initCall = coreIface.encodeFunctionData("initialize", [
    [
      settings.name || DEFAULT_DAO_SETTINGS.name,
      settings.lifetime || DEFAULT_DAO_SETTINGS.lifetime,
      settings.votingPeriod || DEFAULT_DAO_SETTINGS.votingPeriod,
      settings.votingDelay || DEFAULT_DAO_SETTINGS.votingDelay,
      settings.quorum || DEFAULT_DAO_SETTINGS.quorum,
      settings.proposalThreshold || DEFAULT_DAO_SETTINGS.proposalThreshold,
    ],
    args.token,
    args.wallet,
    args.registry,
  ]);
  const roles = [hash("MANAGER_ROLE"), hash("DEFAULT_ADMIN_ROLE"), hash("UPGRADER_ROLE")];
  const grantCalls = roles.map((role) =>
    coreIface.encodeFunctionData("grantRole", [role, args.owner])
  );
  const renounceCalls = roles.map((role) =>
    coreIface.encodeFunctionData("renounceRole", [role, args.factory])
  );

  return [initCall, ...grantCalls, ...renounceCalls];
};

const CreateMiniDaoProposal = () => {
  const {chainId, provider} = useWeb3React();
  const addresses = getNetworkConfig(chainId as any)?.addresses;
  const dispatch = useAppDispatch();

  const getMiniDaoTx = async (values: FormValues) => {
    const factory = attach("DaoFactory", addresses.factory, getNetworkProvider(chainId as any));
    const namehash = hash(values.name);
    const walletAddress = await factory.precomputeWalletAddress(namehash);
    const moduleSettings = [
      {
        implId: hash("coremodule"),
        deployment: ethers.constants.AddressZero,
        initialUpdates: await daoInitUpdates({
          wallet: walletAddress,
          factory: factory.address,
          owner: addresses.timelock,
          registry: addresses.registry,
          token: addresses.token,
          settings: DEFAULT_DAO_SETTINGS,
        }),
      },
    ];

    return await factory.populateTransaction.createMiniDao(moduleSettings, [], values.name);
  };

  const handleNormalSubmit = async (values: FormValues) => {
    try {
      const call = await getMiniDaoTx(values);
      const govBravo = attach("GovernorBravoDelegate", addresses.govBravo, provider.getSigner());

      const description = "mini dao creation proposal";
      const proposalId = await govBravo.callStatic.propose(
        [call.to],
        [0],
        [""],
        [call.data],
        description
      );
      await govBravo.propose([call.to], [0], [""], [call.data], "mini dao creation proposal");
      dispatch(
        onAddProposal({
          id: proposalId.toString(),
          targets: [call.to],
          values: [0],
          data: [call.data],
          description,
        })
      );
    } catch (err) {
      console.log("ERROR", err);
    }
  };

  return (
    <div className="font-sans text-center mx-auto">
      <h1 className="text-2xl mb-4">Create Mini DAO Proposal</h1>
      <div className="flex flex-col justify-center items-center bg-white rounded-lg shadow-md p-6">
        <Formik
          onSubmit={handleNormalSubmit}
          initialValues={{
            name: "",
            votingPeriod: "",
            quorum: "",
          }}
          validationSchema={Yup.object({
            name: Yup.string().required("Name of Mini DAO required"),
            votingPeriod: Yup.number().required("Voting period required"),
            quorum: Yup.number().required("Quorum required"),
          })}
        >
          {({errors, ...props}) => (
            <Form className="flex flex-col justify-between w-full">
              <div className="flex w-full">
                <div className="flex flex-col w-full">
                  <div className="px-5 flex flex-col w-full px-20 pt-5">
                    <div className="mb-4">
                      <span className="text-violet-500">Details</span>
                    </div>
                    <TextInput
                      white
                      name="name"
                      classes={{root: "w-full mb-4"}}
                      placeholder="Name of Mini DAO"
                    />
                    <TextInput
                      white
                      name="votingPeriod"
                      classes={{root: "w-full mb-4"}}
                      placeholder="Voting Period"
                    />
                    <TextInput
                      white
                      name="quorum"
                      classes={{root: "w-full mb-4"}}
                      placeholder="Quorum"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Button
                  type="submit"
                  classes={{root: "mt-4 px-4 py-2 bg-blue-600 text-white rounded"}}
                >
                  Submit
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreateMiniDaoProposal;
