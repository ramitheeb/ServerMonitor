import getCPUData from "./getCPUData";
import getTimeData from "./getTimeData";
import getCpuCacheData from "./getCpuCacheData";
import getSystemData from "./getSystemData";
import getBiosData from "./getBiosData";
import getCpuCurrentSpeedData from "./getCpuCurrentSpeedData";
import getCpuTemperatureData from "./getCpuTemperatureData";
import getMemData from "./getMemData";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { UserInputError, AuthenticationError } from "apollo-server-express";
import config from "../config";
import { GetTokenProps, UserCredentials } from "./types";

const getToken = ({ username, password }) =>
  jwt.sign(
    {
      username,
      password,
    },
    config.SECRET,
    { expiresIn: "20d" }
  );

const resolvers = {
  Query: {
    time: getTimeData,
    cpu: getCPUData,
    cpuCache: getCpuCacheData,
    system: getSystemData,
    bios: getBiosData,
    CpuCurrentSpeedData: getCpuCurrentSpeedData,
    CpuTemperatureData: getCpuTemperatureData,
    MemData: getMemData,
  },
  Mutation: {
    async login(_, { username, password }, { res }) {
      const user = {
        username: "admin",
        password: "admin",
      };
      if (user.username !== username)
        throw new AuthenticationError("this user is not found!");

      const match = password === user.password;
      if (!match) throw new AuthenticationError("wrong password!");

      const accessToken = getToken(user);
      res.cookie("access-token", accessToken);
      return {
        id: user.username,
      };
    },
  },
};
export default resolvers;
