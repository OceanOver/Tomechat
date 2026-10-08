// Layout metrics shared across app chrome (header, sidebar, chat input).
export const HEADER_HEIGHT = 56;
export const MOBILE_TABBAR_HEIGHT = 48;
export const CHAT_TEXTAREA_MAX_HEIGHT = 800;
export const CHAT_TEXTAREA_HEIGHT = 169;
export const CHAT_TEXTAREA_HEIGHT_MOBILE = 140;
export const CHAT_SIDEBAR_WIDTH = 280;
export const FOLDER_WIDTH = 256;
export const MAX_WIDTH = 1024;
export const MOBILE_HEADER_ICON_SIZE = { blockSize: 36, fontSize: 22 };
export const DESKTOP_HEADER_ICON_SIZE = { fontSize: 24 };
export const HEADER_ICON_SIZE = (mobile?: boolean) =>
  mobile ? MOBILE_HEADER_ICON_SIZE : DESKTOP_HEADER_ICON_SIZE;
