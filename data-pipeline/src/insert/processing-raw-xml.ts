/**
 * localdata.kr 에서 download 받은 xml 파일들을 처리하는 script
 * xml 파일을 읽어서 필요한 데이터만 추출하여 가공한 후 반환한다.
 */

import * as fs from 'fs/promises';
import { join } from 'path';

import { XMLParser } from 'fast-xml-parser';

import { dataFormatting } from '../common/format-raw-data';
import { ProcessedData } from '../types/processed-data.type';

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
    const { opened } = dataFormatting(parsedData);
    console.log(opened.length);
    return opened;
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
    throw err;
  }
};

/**
 * 여러 파일을 읽어서 데이터를 가공한 후 반환
 *
 * @param fileNames
 * @returns
 */
const readMultipleFiles = async (fileNames: string[]): Promise<ProcessedData[]> => {
  const filePaths = fileNames.map((fileName) => join(__dirname, '.. ', '..', '..', '..', 'data', fileName));
  const parser = new XMLParser({ ignoreAttributes: true, parseTagValue: false });

  try {
    // Promise.all을 사용하여 병렬로 처리
    const fileContents = await Promise.all(filePaths.map((filePath) => readFile(parser, filePath)));
    console.log('All files have been read successfully');
    return fileContents.flat();
  } catch (err) {
    console.error('Error reading one or more files:', err);
    throw err;
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
