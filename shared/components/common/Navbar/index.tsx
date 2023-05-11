import EthAccount from "@shared/components/common/EthAccount";

const Navbar = () => {
  return (
    <nav className="flex justify-end items-center p-1 bg-neutral-50 absolute w-full py-6 text-black">
      <div className="w-full flex justify-end items-center w-auto">
        <EthAccount className="mr-10" />
      </div>
    </nav>
  );
};

export default Navbar;
