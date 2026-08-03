import API from './API';

enum CactusLogsAPI {
  GET_CONTENT = `${API.CACTUS_LOGS}:getContent`,
  GET_INFO = `${API.CACTUS_LOGS}:getInfo`,
  SET_PATH = `${API.CACTUS_LOGS}:setPath`,
}

export default CactusLogsAPI;
