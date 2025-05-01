declare module 'read-yaml' {
  function sync(val: string): Record<string, any>;

  export { sync };
}

declare module 'tor-axios' {
  import { AxiosStatic } from 'axios';

  export type TorAxios = {
    torSetup: (params: { ip: string; port: number }) => AxiosStatic;
    torNewSession: () => Promise<void>;
  };

  const setup: TorAxios;

  export default setup;
}
