import {
  dayQueryLength,
  longTimeSeriesPeriod,
  mediumTimeSeriesPeriod,
  monthQueryLength,
  redisReadTSData,
  shortTimeSeriesPeriod,
  TRAFFIC_TS_KEY,
  weekQueryLength,
  yearQueryLength,
} from "../Redis";

const getTrafficHistoryData = async (_, args, context) => {
  if (!context.req.username) return;

  let resolution: number = 150;
  let startDate: number = 0;
  let endDate: number = 0;
  let period: string;

  switch (args.option) {
    case "Day":
      endDate = new Date().getTime();
      startDate = endDate - dayQueryLength;
      break;
    case "Week":
      endDate = new Date().getTime();
      startDate = endDate - weekQueryLength;
      break;
    case "Month":
      endDate = new Date().getTime();
      startDate = endDate - monthQueryLength;
      break;
    case "Year":
      endDate = new Date().getTime();
      startDate = endDate - yearQueryLength;
      break;
    case "Custom":
      endDate = args.toDate;
      startDate = args.fromDate;
      break;
    default:
      return;
  }

  if (endDate - startDate < shortTimeSeriesPeriod) period = "short";
  else if (endDate - startDate < mediumTimeSeriesPeriod) period = "medium";
  else if (endDate - startDate < longTimeSeriesPeriod) period = "long";
  else return;

  const samples = await redisReadTSData(
    TRAFFIC_TS_KEY,
    "all",
    period,
    startDate,
    endDate,
    resolution,
    "SUM"
  );

  const data = [{}];
  for (let i = 0; i < samples.length; i++) {
    const element = samples[i];

    data[i] = {
      traffic: element.getValue(),
      timestamp: element.getTimestamp(),
    };
  }

  return {
    fromDate: startDate,
    toDate: endDate,
    data: data,
  };
};

export default getTrafficHistoryData;
