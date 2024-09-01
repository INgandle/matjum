/**
 * xml 허가 파일들을 처리하는 script
 * xml 파일을 읽어서 필요한 데이터만 추출하여 가공한 후 반환한다.
 */

import * as fs from 'fs/promises';
import { join } from 'path';

import { XMLParser, X2jOptions } from 'fast-xml-parser';

import { excludeCategorySet } from './common/common.constants';
import { ProcessedData } from './types/processed-data.type';
import { RawData } from './types/raw-data.type';

// 전역 변수
const options: X2jOptions = {
  ignoreAttributes: true,
};

const parser = new XMLParser(options);

/**
 * 도로명, 지번 주소를 합쳐서 반환
 *
 * @param siteWhlAddr
 * @param rdnWhlAddr
 */
const formatAddress = (siteWhlAddr: string, rdnWhlAddr: string): string => {
  let address = '';

  if (rdnWhlAddr !== '' && rdnWhlAddr !== undefined && rdnWhlAddr !== null) {
    address += rdnWhlAddr;
    if (siteWhlAddr !== '' && siteWhlAddr !== undefined && siteWhlAddr !== null) {
      address += ` (${siteWhlAddr})`;
    }
  } else {
    address += siteWhlAddr;
  }

  return address;
};

/**
 * 데이터를 가공하여 반환
 * undefined 를 이용해 name, address가 겹치는 경우에 ''이 아닌 필드만 업데이트 한다.
 *
 * @param data
 * @returns
 */
const dataFormatting = (data: RawData[]): Partial<ProcessedData>[] => {
  const processed: Partial<ProcessedData>[] = data.reduce((acc: ProcessedData[], item: RawData) => {
    // 제외 카테고리에 포함되지 않는 항목만 처리
    if (!excludeCategorySet.has(item.uptaeNm)) {
      acc.push({
        name: item.bplcNm,
        address: formatAddress(item.siteWhlAddr, item.rdnWhlAddr),
        category: item.uptaeNm === '' ? undefined : item.uptaeNm,
        phoneNumber: item.siteTel === '' ? undefined : item.siteTel,
        x: item.x === '' ? undefined : item.x,
        y: item.y === '' ? undefined : item.y,
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
const readFile = async (filePath: string): Promise<Partial<ProcessedData>[]> => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    console.log(`Successfully read file: ${filePath}`);
    return dataFormatting(parser.parse(content).result.body.rows.row);
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
const readMultipleFiles = async (fileNames: string[]): Promise<Partial<ProcessedData>[]> => {
  const filePaths = fileNames.map((fileName) => join(__dirname, '..', 'data', fileName));

  try {
    // Promise.all을 사용하여 병렬로 처리
    const fileContents = await Promise.all(filePaths.map(readFile));
    console.log('All files have been read successfully');
    return fileContents.flat();
  } catch (error) {
    console.error('Error reading one or more files:', error);
    throw error;
  }
};

/**
 * xml 파일들을 읽어 가공하여 반환
 * @returns
 */
const processingRawXML = async (): Promise<Partial<ProcessedData>[]> => {
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

export default processingRawXML;
