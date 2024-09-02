/**
 * localdata.kr 에서 download 받은 xml 파일들을 처리하는 script
 * xml 파일을 읽어서 필요한 데이터만 추출하여 가공한 후 반환한다.
 */

import * as fs from 'fs/promises';
import { join } from 'path';

import { XMLParser, X2jOptions } from 'fast-xml-parser';

import { excludeCategorySet } from './common/common.constants';
import { ProcessedData } from './types/processed-data.type';
import { RawData } from './types/raw-data.type';

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
 * ''인 필드는 null 로 처리.
 *
 * @param data
 * @returns
 */
const dataFormatting = (data: RawData[]): ProcessedData[] => {
  const processed: ProcessedData[] = data.reduce((acc: ProcessedData[], item: RawData) => {
    // 제외 카테고리에 포함되지 않는 항목만 처리
    if (!excludeCategorySet.has(item.uptaeNm)) {
      acc.push({
        name: item.bplcNm, // not null
        address: formatAddress(item.siteWhlAddr, item.rdnWhlAddr),
        category: item.uptaeNm === '' ? null : item.uptaeNm,
        phoneNumber: item.siteTel === '' ? null : item.siteTel,
        location:
          item.x && item.x !== '' && item.y && item.y !== ''
            ? () => `ST_SetSRID(ST_Transform(ST_SetSRID(ST_MakePoint(${item.x}, ${item.y}), 5174), 4326), 4326)`
            : null,
        lastModTs: item.lastModTs,
      });
    }
    return acc;
  }, []);

  return processed;
};

/**
 * 파일을 읽어서 데이터를 가공한 후 반환
 *
 * @param filePath
 * @returns
 */
const readFile = async (parser: XMLParser, filePath: string): Promise<ProcessedData[]> => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    console.log(`Successfully read file: ${filePath}`);

    const parsedData = parser.parse(content).result.body.rows.row;
    return dataFormatting(parsedData);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    throw error;
  }
};

/**
 * 여러 파일을 읽어서 데이터를 가공한 후 반환
 *
 * @param fileNames
 * @returns
 */
const readMultipleFiles = async (fileNames: string[]): Promise<ProcessedData[]> => {
  const filePaths = fileNames.map((fileName) => join(__dirname, '..', 'data', fileName));

  // 전역 변수
  const options: X2jOptions = {
    ignoreAttributes: true,
  };

  const parser = new XMLParser(options);

  try {
    // Promise.all을 사용하여 병렬로 처리
    const fileContents = await Promise.all(filePaths.map((filePath) => readFile(parser, filePath)));
    console.log('All files have been read successfully');
    return fileContents.flat();
  } catch (error) {
    console.error('Error reading one or more files:', error);
    throw error;
  }
};

/**
 * xml 파일들을 읽어 가공하여 반환
 * @returns ProcessedData 배열
 */
const processingRawXML = async (): Promise<ProcessedData[]> => {
  // TODO: 파일명 정리
  const fileNames = [
    'seoul_20200801-20240831.xml',
    'seoul_19000101-20200731.xml',
    'gg_20200801-20240831.xml',
    'gg_19000101-20200731.xml',
    'seoul_rest.xml', // 휴게음식점
    'gg_rest.xml',
  ];

  const results = await readMultipleFiles(fileNames);
  console.log(results.length, 'items in total');
  return results;
};

export { processingRawXML };
