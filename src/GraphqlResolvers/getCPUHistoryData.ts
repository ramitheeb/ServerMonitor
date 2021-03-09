import {
  Aggregation,
  RedisTimeSeriesFactory,
  TimestampRange,
} from "redis-time-series-ts";

const getCPUHistoryData = async (_, args, context) => {
  if (!context.req.username) return;

  const factory = new RedisTimeSeriesFactory();
  const client = factory.create();
  var resolution: number = 150;
  var startDate: number = 0;
  var endDate: number = 0;
  var key: string;

  switch (args.option) {
    case "Day":
      endDate = new Date().getTime();
      startDate = endDate - 7 * 24 * 60 * 60 * 1000;
      break;
    case "Week":
      endDate = new Date().getTime();
      startDate = endDate - 5 * 7 * 24 * 60 * 60 * 1000;
      break;
    case "Month":
      endDate = new Date().getTime();
      startDate = endDate - 12 * 30 * 24 * 60 * 60 * 1000;
      break;
    case "Year":
      endDate = new Date().getTime();
      startDate = endDate - 5 * 12 * 30 * 24 * 60 * 60 * 1000;
      break;
    case "Custom":
      endDate = args.toDate;
      startDate = args.fromDate;
      break;
    default:
      return;
  }

  if (endDate - startDate < 2628000000) key = "cpu-usage:current-load:short";
  else if (endDate - startDate < 15770000000)
    key = "cpu-usage:current-load:medium";
  else if (endDate - startDate < 126100000000)
    key = "cpu-usage:current-load:long";
  else return;

  const samples = await client.range(
    key,
    new TimestampRange(startDate, endDate),
    undefined,
    new Aggregation("AVG", Math.floor((endDate - startDate) / resolution))
  );

  const data = [{}];
  for (let i = 0; i < samples.length; i++) {
    const element = samples[i];

    data[i] = {
      avgLoad: null,
      currentLoad: element.getValue(),
      currentLoadUser: null,
      currentLoadSystem: null,
      currentLoadNice: null,
      currentLoadIdle: null,
      currentLoadIrq: null,
      rawCurrentLoad: null,
      rawCurrentLoadUser: null,
      rawCurrentLoadSystem: null,
      rawCurrentLoadNice: null,
      rawCurrentLoadIdle: null,
      rawCurrentLoadIrq: null,
      cpus: [],
      timestamp: element.getTimestamp(),
    };
  }

  return {
    fromDate: args.fromDate,
    toDate: args.toDate,
    data: data,
  };
};

export default getCPUHistoryData;