// Helper function to filter data for the last 7 days based on date or timestamp
export default function getLast7Days(dataArray, currentDate){
  const currentDateTime = new Date(currentDate + (currentDate.endsWith('Z') ? '' : 'Z'));
  const sevenDaysAgo = new Date(currentDateTime.getTime() - (7 * 24 * 60 * 60 * 1000));
  
  return dataArray.filter(item => {
    const itemDateStr = item.date || item.timestamp;
    const itemDate = new Date(itemDateStr + (itemDateStr.endsWith('Z') ? '' : 'Z'));
    return itemDate >= sevenDaysAgo && itemDate < currentDateTime;
  });
};