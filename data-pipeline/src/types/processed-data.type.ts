//export type ProcessedData = {
//  bpclNm: string; // 사업장명
//  siteWhlAddr: string; // 지번주소
//  rdnWhlAddr: string; // 도로명주소
//  apvPermYmd: string; // 인허가일자
//  trdStateNm: string; // 영업상태명
//  trdStateGbn: string; // 영업상태코드
//  uptaeNm: string; // 업태구분명
//  siteTel: string; // 전화번호
//  x: string; // 좌표정보(X)
//  y: string; // 좌표정보(Y)
//  lastModTs: string; // 최종수정일자
//};

export type ProcessedData = {
  name: string; // 사업장명 - bpclNm
  address: string; // 도로명(지번) 형태의 주소 - siteWhlAddr, rdnWhlAddr
  category: string; // 업태구분명 - uptaeNm
  x: string; // 좌표정보(X) - x
  y: string; // 좌표정보(Y) - y
  phoneNumber: string; // 전화번호 - siteTel
  lastModTs: string; // 최종수정일자 - lastModTs
};
