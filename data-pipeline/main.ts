import { insertData } from './src/insert-data';
import { processingRawXML } from './src/processing-raw-xml';

const main = async () => {
  // 최초 1회 실행
  const dataList = await processingRawXML();
  await insertData(dataList);
};
//name category phone address location lating
main();
