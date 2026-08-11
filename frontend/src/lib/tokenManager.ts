export let currentToken: string | null = null;

export const setApiToken = (token: string | null) => {
  currentToken = token;
};

export const getApiToken = () => {
  return currentToken;
};
