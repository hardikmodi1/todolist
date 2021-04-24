import { TokenManager } from "../TokenManager";

export const updateHeader = (options?: any) => {
  const update = { ...options };
  const accessToken = TokenManager.getToken();
  update.headers = {
    ...update.headers,
    Authorization: `Bearer ${accessToken}`,
  };
  return update;
};
