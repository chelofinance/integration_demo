import {Form, Formik} from "formik";
import * as Yup from "yup";
import {Button, TextInput} from "@shared/components/common/Forms";
import {attach} from "@helpers/contracts";
import {useWeb3React} from "@web3-react/core";
import {getNetworkConfig} from "@helpers/network";
import {getNetworkProvider, hash} from "@helpers/index";
import {ethers} from "ethers";
import {useAppDispatch} from "@redux/store";
import {onAddProposal} from "@redux/actions";
import {getMiniDaoCall} from "mini-daos-sdk";

type FormValues = {
  name: string;
  votingPeriod: string;
  description: string;
};

const CreateMiniDaoProposal = () => {
  const {chainId, provider, account} = useWeb3React();
  const addresses = getNetworkConfig(chainId as any)?.addresses;
  const dispatch = useAppDispatch();

  const delegateToSelf = async () => {
    const comp = attach("Comp", addresses.comp, provider.getSigner());
    const delegated = await comp.delegates(account);

    console.log({delegated});
    if (delegated === ethers.constants.AddressZero) {
      await (await comp.delegate(account)).wait();
    }
  };

  const handleNormalSubmit = async (values: FormValues) => {
    try {
      const factory = attach("DaoFactory", addresses.factory, getNetworkProvider(chainId as any));
      const govBravo = attach("GovernorBravoDelegate", addresses.govBravo, provider.getSigner());
      const votingPeriod = Number(values.votingPeriod) * 60; //minutes
      const call = await getMiniDaoCall(factory as any, {
        name: values.name,
        modules: [
          {
            implId: "DAO_MODULE",
            settings: {
              registry: addresses.registry,
              token: addresses.token,
              owner: addresses.timelock,
              settings: {
                name: values.name,
                votingPeriod: votingPeriod.toString(),
                votingDelay: String(0),
                quorum: 0,
                proposalThreshold: 0,
              },
            },
          },
        ],
      });

      await delegateToSelf();

      const proposalId = await govBravo.callStatic.propose(
        [call.to],
        [0],
        [""],
        [call.data],
        values.description
      );
      await govBravo.propose([call.to], [0], [""], [call.data], values.description);
      dispatch(
        onAddProposal({
          id: proposalId.toString(),
          targets: [call.to],
          values: [0],
          data: [call.data.toString()],
          description: values.description,
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
            description: "",
          }}
          validationSchema={Yup.object({
            name: Yup.string().required("Name of Mini DAO required"),
            votingPeriod: Yup.number().required("Voting period required"),
            description: Yup.string().required("Description required"),
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
                      name="description"
                      classes={{root: "w-full mb-4"}}
                      placeholder="Description"
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
