import { parse } from 'url';
import { getServerConfig } from '../configurations';

const ServerConfigs = getServerConfig();

export function getUrlPath(url: string): string | undefined {
  const hostUrl = getUrlHost(url);
  if (hostUrl) {
    return parse(url).path;
  }

  return;
}

export function getUrlHost(url: string): string | undefined {
  const urlObj = parse(url);

  const { hosts = [] } = ServerConfigs.localhost;
  const hostUrl = urlObj.protocol + '//' + urlObj.hostname;
  if (hosts.indexOf(hostUrl) === -1) {
    return;
  }

  return hostUrl;
}

