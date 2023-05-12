import {useAppSelector} from "@redux/store";

export const useRole = (): Record<RoleNames, boolean> => {
  const {account} = useAppSelector((state) => state.user);
  const roles = account.roles.reduce(
    (acc, cur) => ({
      ...acc,
      [cur.name]: true,
    }),
    {} as Record<RoleNames, boolean>
  );

  return roles;
};
