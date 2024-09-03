import { ProcessedData } from '../types/processed-data.type';
import { RawData } from '../types/raw-data.type';

import { EXCLUDE_CATEGORY_SET } from './common.constants';

/**
 * 도로명, 지번 주소를 합쳐서 반환
 *
 * @param siteWhlAddr 지번 주소
 * @param rdnWhlAddr 도로명 주소
 */
const formatAddress = (siteWhlAddr?: string, rdnWhlAddr?: string): string | null => {
  // undefined, ''이면 null로 처리
  const validRdnWhlAddr = rdnWhlAddr && rdnWhlAddr !== '' ? rdnWhlAddr : null;
  const validSiteWhlAddr = siteWhlAddr && siteWhlAddr !== '' ? siteWhlAddr : null;

  // 두 주소가 모두 유효하면 도로명 주소 (지번 주소) 형식으로 반환
  if (validRdnWhlAddr && validSiteWhlAddr) {
    return `${validRdnWhlAddr} (${validSiteWhlAddr})`;
  }

  // 둘 중 하나만 유효하면 유효한 주소만 반환, 둘 다 유효하지 않으면 null 반환
  return validRdnWhlAddr || validSiteWhlAddr;
};

/**
 * 데이터를 가공하여 반환
 * '' 인 경우 null로 처리
 *
 * @param data
 * @returns
 */
const dataFormatting = (data: RawData[]): { opened: ProcessedData[]; closed: ProcessedData[] } => {
  const [opened, closed] = data.reduce(
    (acc, item: RawData) => {
      // 제외 카테고리에 포함되지 않는 항목만 처리
      if (!item.uptaeNm) {
        console.log(item);
      }

      if (!EXCLUDE_CATEGORY_SET.has(item.uptaeNm)) {
        const processed = {
          name: item.bplcNm, // not null
          address: formatAddress(item.siteWhlAddr, item.rdnWhlAddr),
          category: item.uptaeNm === '' ? null : item.uptaeNm,
          phoneNumber: item.siteTel === '' ? null : item.siteTel,
          location:
            item.x && item.x !== '' && item.y && item.y !== ''
              ? () => `ST_Transform(ST_SetSRID(ST_MakePoint(${item.x}, ${item.y}), 5174), 4326)`
              : null,
          lastModTs: item.lastModTs,
        };

        // 영업중인 배열을 [0], 폐업한 배열을 [1]에 추가
        if (item.trdStateGbn === '01') {
          acc[0].push(processed);
        } else {
          acc[1].push(processed);
        }
      }
      return acc;
    },
    [[] as ProcessedData[], [] as ProcessedData[]],
  );

  return { opened, closed };
};

export { dataFormatting };
