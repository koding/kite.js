/* global window, navigator */

const os = {
  totalmem: () => 0,
  freemem: () => 0,
  platform: () => navigator.platform,
  homedir: () => '/browser',
}

export default os
