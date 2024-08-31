export type RawData = {
  /** 번호 */
  rowNum: string;
  /** 개방서비스명 */
  opnSvcNm: string;
  /** 개방서비스아이디 */
  opnSvcId: string;
  /** 개방자치단체코드 */
  opnSfTeamCode: string;
  /** 관리번호 */
  mgtNo: string;
  /** 인허가일자 */
  apvPermYmd: string;
  /** 인허가취소일자 */
  apvCancelYmd: string;
  /** 영업상태구분코드 */
  trdStateGbn: string;
  /** 영업상태명 */
  trdStateNm: string;
  /** 상세영업상태코드 */
  dtlStateGbn: string;
  /** 상세영업상태명 */
  dtlStateNm: string;
  /** 폐업일자 */
  dcbYmd: string;
  /** 휴업시작일자 */
  clgStdt: string;
  /** 휴업종료일자 */
  clgEnddt: string;
  /** 재개업일자 */
  ropnYmd: string;
  /** 소재지전화 */
  siteTel: string;
  /** 소재지면적 */
  siteArea: string;
  /** 소재지우편번호 */
  sitePostNo: string;
  /** 소재지전체주소 */
  siteWhlAddr: string;
  /** 도로명전체주소 */
  rdnWhlAddr: string;
  /** 도로명우편번호 */
  rdnPostNo: string;
  /** 사업장명 */
  bplcNm: string;
  /** 최종수정시점 */
  lastModTs: string;
  /** 데이터갱신구분 */
  updateGbn: string;
  /** 데이터갱신일자 */
  updateDt: string;
  /** 업태구분명 */
  uptaeNm: string;
  /** 좌표정보(X) */
  x: string;
  /** 좌표정보(Y) */
  y: string;
  /** 위생업태명 */
  sntUptaeNm: string;
  /** 남성종사자수 */
  manEipCnt: string;
  /** 여성종사자수 */
  wmEipCnt: string;
  /** 영업장주변구분명 */
  trdpJubnSeNm: string;
  /** 등급구분명 */
  lvSeNm: string;
  /** 급수시설구분명 */
  wtrSplyFacilSeNm: string;
  /** 총직원수 */
  totEpNum: string;
  /** 본사직원수 */
  hoffEpCnt: string;
  /** 공장사무직직원수 */
  fctyOwkEpCnt: string;
  /** 공장판매직직원수 */
  fctySilJobEpCnt: string;
  /** 공장생산직직원수 */
  fctyPdtJobEpCnt: string;
  /** 건물소유구분명 */
  bdngOwnSeNm: string;
  /** 보증액 */
  isreAm: string;
  /** 월세액 */
  monAm: string;
  /** 다중이용업소여부 */
  multUsnUpsoYn: string;
  /** 시설총규모 */
  facilTotScp: string;
  /** 전통업소지정번호 */
  jtUpsoAsgnNo: string;
  /** 전통업소주된음식 */
  jtUpsoMainEdf: string;
  /** 홈페이지 */
  homepage: string;
};
