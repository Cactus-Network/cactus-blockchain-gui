type LogInfo = {
  path: string;
  exists: boolean;
  size: number;
  readable: boolean;
  defaultPath: string;
  debugInfo: {
    cactusRoot: string;
    logDir: string;
    rootExists: boolean;
    logDirExists: boolean;
    fileReadable: boolean;
  };
};

type LogContent =
  | {
      content: string;
      path: string;
      size: number;
    }
  | {
      error: string;
    };

type LogInfoResponse =
  | LogInfo
  | {
      error: string;
    };

type CactusLogsService = {
  getContent: () => Promise<LogContent>;
  getInfo: () => Promise<LogInfoResponse>;
  setPath: () => Promise<{ success: boolean }>;
};

export default CactusLogsService;
