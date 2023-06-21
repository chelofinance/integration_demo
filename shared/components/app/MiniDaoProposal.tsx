import {Form, Formik} from "formik";
import * as Yup from "yup";
import {Button, TextInput} from "@shared/components/common/Forms";
import {useRouter} from "next/router";
import {useAppDispatch, useAppSelector} from "@redux/store";
import {getNetworkConfig} from "@helpers/network";
import {useWeb3React} from "@web3-react/core";
import {getNetworkProvider} from "@helpers/index";
import {attach, getLogs, getReceipt} from "mini-daos-sdk";
import {ethers} from "ethers";
import {onAddMiniDaoProposal} from "@redux/actions";

type FormValues = {
  address: string;
  value: string;
  functionSignature: string;
  arguments: string;
};

const MiniDaoProposal = () => {
  const {chainId, provider} = useWeb3React();
  const {
    daos: {mini_daos},
    user: {account},
  } = useAppSelector((state) => state);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const addresses = getNetworkConfig(chainId || (31337 as any))?.addresses;

  const handleNormalSubmit = async (values: FormValues) => {
    try {
      const args = values.arguments.split(",").map((el) => el.trim());
      const miniDao = mini_daos.find((dao) => dao.id === router.query.mini_dao);
      const iface = new ethers.utils.Interface([`function ${values.functionSignature}`]);
      const calldata = iface.encodeFunctionData(values.functionSignature, args);

      const dao = attach(provider.getSigner(), "DaoModule", miniDao.modules[0].address);
      const description = "Proposal from mini dao";
      const proposalLog = getLogs(
        dao,
        await getReceipt(dao.propose([values.address], [values.value], [calldata], description))
      ).find((log) => log.name === "ProposalCreated");

      dispatch(
        onAddMiniDaoProposal({
          id: proposalLog.args.proposalId.toString(),
          targets: [values.address],
          data: [calldata],
          values: [Number(values.value)],
          description: description,
          dao: miniDao.id,
          status: 0,
        })
      );
    } catch (err) {
      console.log("ERROR", err);
    }
  };

  return (
    <div className="font-sans text-center mx-auto">
      <h1 className="text-2xl mb-4">Create Proposal</h1>
      <div className="flex flex-col justify-center items-center bg-white rounded-lg shadow-md p-6">
        <Formik
          onSubmit={handleNormalSubmit}
          initialValues={{
            address: addresses?.mockToken || "",
            value: "0",
            functionSignature: "transfer(address,uint)",
            arguments: `${account.address}, 0`,
          }}
          validationSchema={Yup.object({
            address: Yup.string()
              .matches(/^(0x)?[0-9a-f]{40}$/i, "Invalid Ethereum address")
              .required("Address required"),
            value: Yup.number().required("Value required"),
            functionSignature: Yup.string().required("Function signature required"),
            arguments: Yup.string().required("Arguments required"),
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
                      name="address"
                      classes={{root: "w-full mb-4"}}
                      placeholder="Address"
                    />
                    <TextInput
                      white
                      name="value"
                      classes={{root: "w-full mb-4"}}
                      placeholder="Value"
                    />
                    <TextInput
                      white
                      name="functionSignature"
                      classes={{root: "w-full mb-4"}}
                      placeholder="Function Signature"
                    />
                    <TextInput
                      white
                      name="arguments"
                      classes={{root: "w-full mb-4"}}
                      placeholder="Arguments (separated by comma)"
                    />{" "}
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

export default MiniDaoProposal;
