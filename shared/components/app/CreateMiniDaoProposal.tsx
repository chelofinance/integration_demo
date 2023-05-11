import {Form, Formik} from "formik";
import * as Yup from "yup";
import {Button, TextInput} from "@shared/components/common/Forms";

const CreateMiniDaoProposal = () => {
  const handleNormalSubmit = (values) => {
    // To be implemented
  };

  return (
    <div className="font-sans text-center mx-auto">
      <h1 className="text-2xl mb-4">Create Mini DAO Proposal</h1>
      <div className="max-w-md mx-auto text-lg border border-gray-300 rounded-xl p-6 my-2 shadow-sm">
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
