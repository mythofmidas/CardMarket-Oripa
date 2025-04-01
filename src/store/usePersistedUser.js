import { useEffect } from "react";
import { useAtom } from "jotai";
import { UserAtom } from "./user";

const usePersistedUser = () => {
  const [user, setUser] = useAtom(UserAtom);

  // useEffect(() => {
    // if (user) {
      // localStorage.setItem("user", JSON.stringify(user));
    // } else {
      // localStorage.removeItem("user");
      // localStorage.removeItem("testmode");
    // }
  // }, [user]);

  return [user, setUser];
};

export default usePersistedUser;
