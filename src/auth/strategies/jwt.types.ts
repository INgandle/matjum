// 향후 확장 가능성(예: 추가 필드)을 고려할 때 interface 선언
export interface JwtPayload {
  sub: number;
  accountName: string;
  name: string;
}

export interface JwtUser {
  id: number;
  accountName: string;
  name: string;
}
