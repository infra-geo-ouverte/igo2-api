import { parse } from 'url';

import { AppInstance } from '../app.interface';

export function getUrlHost(url: string, hosts: string[]): string | undefined {
  const urlObj = parse(url);

  const hostUrl = urlObj.protocol + '//' + urlObj.hostname;
  if (hosts.indexOf(hostUrl) === -1) {
    return;
  }

  return hostUrl;
}

export function addRoutingTagHook(
  app: AppInstance,
  newTags: string[],
  filterTags: string[] = []
) {
  app.addHook('onRoute', (options) => {
    if (!options.schema) {
      return;
    }

    const { tags = [] } = options.schema;
    options.schema = {
      ...options.schema,
      tags: [...tags.filter((tag) => !filterTags.includes(tag)), ...newTags]
    };
  });
}
