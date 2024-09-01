import { upsertData } from './src/upsert-data';
import processingRawXML from './src/processing-raw-xml';

const main = async () => {
  const dataList = await processingRawXML();
  await upsertData(dataList);
};
//name category phone address location lating
main();
