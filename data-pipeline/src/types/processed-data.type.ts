export type ProcessedData = {
  name: string; // 사업장명 - bpclNm
  address: string; // 도로명(지번) 형태의 주소 - siteWhlAddr, rdnWhlAddr
  category: string; // 업태구분명 - uptaeNm
  location: () => string; // 좌표정보 계산하는 function
  phoneNumber: string; // 전화번호 - siteTel
  lastModTs: string; // 최종수정일자 - lastModTs
};
