export type JwtPayload = {
  sub: string;
  accountName: string;
  name: string;
};

export type JwtUser = {
  id: string;
  accountName: string;
  name: string;
};
