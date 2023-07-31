import React from "react";
import {Form, Formik} from "formik";
import * as Yup from "yup";
import {Button, TextInput} from "@shared/components/common/Forms";
import SelectInput from "@shared/components/common/Forms/SelectInput";
import {useWeb3React} from "@web3-react/core";
import {getNetworkConfig} from "@helpers/network";
import {useAppDispatch} from "@redux/store";

type FormValues = {
  ratio: number;
  tokenType: string;
};

const CreateStakingPool = () => {
  const {chainId, provider} = useWeb3React();
  const addresses = getNetworkConfig(chainId as any)?.addresses;
  const dispatch = useAppDispatch();

  const handleNormalSubmit = async (values: FormValues) => {
    // ... (keep the existing logic for now)
  };

  return (
    <div className="font-sans text-center mx-auto">
      <h1 className="text-2xl mb-4">Create Staking Pool</h1>
      <div className="flex flex-col justify-center items-center bg-white rounded-lg shadow-md p-6">
        <Formik
          onSubmit={handleNormalSubmit}
          initialValues={{
            ratio: 0,
            tokenType: "ERC20",
          }}
          validationSchema={Yup.object({
            ratio: Yup.number().positive().required("Ratio is required"),
            tokenType: Yup.string().required("Token type is required"),
          })}
        >
          {() => (
            <Form className="flex flex-col justify-between w-full">
              <div className="flex w-full">
                <div className="flex flex-col w-full">
                  <div className="px-5 flex flex-col w-full px-20 pt-5">
                    <div className="mb-4">
                      <span className="text-violet-500">Details</span>
                    </div>
                    <TextInput
                      white
                      name="ratio"
                      classes={{root: "w-full mb-4"}}
                      placeholder="Ratio"
                    />
                    <div className="mb-4">
                      <label className="font-bold">Token Type: </label>
                      <SelectInput
                        name="tokenType"
                        items={[{value: "ERC20", label: "ERC20"}]}
                        white
                        placeholder="Select a token type"
                      />
                    </div>
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

export default CreateStakingPool;
