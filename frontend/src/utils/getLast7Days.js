export default function getLast7Days(dataArray, currentDate){
  // console.log("7days, date: ", currentDate) // 7days, date:  2021-05-24T00:00:00Z
  const currentDateTime = new Date(currentDate + (currentDate.endsWith('Z') ? '' : 'Z'));
  const sevenDaysAgo = new Date(currentDateTime.getTime() - (7 * 24 * 60 * 60 * 1000));
  
  return dataArray.filter(item => {
    const itemDateStr = item.date || item.timestamp;
    const itemDate = new Date(itemDateStr + (itemDateStr.endsWith('Z') ? '' : 'Z'));
    return itemDate >= sevenDaysAgo && itemDate < currentDateTime;
  });
};