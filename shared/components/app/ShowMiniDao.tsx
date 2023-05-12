//import React from 'react';
import {useAppSelector} from "@redux/store";

type Module = {
  address: string;
  id: string;
};

type Dao = {
  baseWallet: string;
  modules: Module[];
};

const ShowMiniDao: React.FC = () => {
  const {daos} = useAppSelector((state) => state.daos);

  if (daos.length <= 0) return null;

  return (
    <div className="flex flex-col items-start bg-white rounded-lg shadow-md p-6">
      {daos.map((dao: Dao, index: number) => (
        <div key={index} className="mb-4">
          <h2 className="text-xl font-bold mb-2">Base Wallet: {dao.baseWallet}</h2>
          <div className="flex flex-col">
            <h3 className="text-lg font-bold mb-2">Modules:</h3>
            {dao.modules.map((module: Module, moduleIndex: number) => (
              <p key={moduleIndex} className="ml-4">
                {module.address}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShowMiniDao;
