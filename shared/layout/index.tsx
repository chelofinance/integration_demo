import React from "react";

import Navbar from "@shared/components/common/Navbar";

const Layout: React.FunctionComponent<{}> = ({children}) => {
  return (
    <div className={`bg-neutral-50 w-full`}>
      <div className="flex font-montserrat flex">
        <Navbar />
        <div className={`w-full md:px-20 sm:px-40 pt-32`}>{children}</div>
      </div>
    </div>
  );
};

export default Layout;
