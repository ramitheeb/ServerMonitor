import { Label, RedisTimeSeriesFactory } from "redis-time-series-ts";
import { RedisTimeSeries } from "redis-time-series-ts/lib/redisTimeSeries";

const createDatabase = async (
  client: RedisTimeSeries,
  labels: Label[],
  key: string,
  retention: number
) => {
  //Retention of 9 days
  await client.create(key, labels, retention);
};

const demoFunc = async () => {
  const factory = new RedisTimeSeriesFactory();
  const client = factory.create();
  const metrics = ["cpu-usage", "mem-usage", "disk-usage", "disk-usage"];
  const components = ["current-load", "used", "read", "write"];
  const periods = ["runtime", "short", "medium", "long"];
  // 10 mins - 1 month - 6 months - 4 years
  const retentions = [157700000000, 2628000000, 15770000000, 126100000000];
  for (let i = 0; i < metrics.length; i++) {
    const metric = metrics[i];
    const component = components[i];
    for (let j = 0; j < periods.length; j++) {
      const period = periods[j];
      const retention = retentions[j];
      const key = `${metric}:${component}:${period}`;
      const labels = [
        new Label("Metric", metric),
        new Label("Component", component),
        new Label("Period", period),
      ];
      await createDatabase(client, labels, key, retention);
    }
  }
  console.log("Finished creating databases");

  client.disconnect();
};
demoFunc();