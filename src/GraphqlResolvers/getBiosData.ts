import systemInformation from "systeminformation";

const getBiosData = () => {
  return systemInformation.bios();
};

export default getBiosData;