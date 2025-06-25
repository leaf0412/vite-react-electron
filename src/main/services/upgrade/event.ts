export const UpgradeEvents = {
  CHECK_FOR_UPDATES: 'CHECK_FOR_UPDATES',
  DOWNLOAD_UPDATE: 'SOFTWARE_DOWNLOAD_UPDATE',
  INSTALL_UPDATE: 'SOFTWARE_INSTALL_UPDATE',
  UPGRADE_PROGRESS: 'UPGRADE_PROGRESS',
} as const;

export type UpgradeEventKeys = keyof typeof UpgradeEvents;
