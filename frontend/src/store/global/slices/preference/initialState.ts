import { SessionDefaultGroup, SessionGroupId } from '@/types/session';

export interface Guide {
  // Topic guide
  topic?: boolean;
}

export interface GlobalPreference {
  // which sessionGroup should expand
  expandSessionGroupKeys: SessionGroupId[];
  guide?: Guide;
  inputHeight: number;
  mobileShowTopic?: boolean;
  sessionsWidth: number;

  showChatSideBar?: boolean;
  showSessionPanel?: boolean;
  showSystemRole?: boolean;
  /**
   * whether to use cmd + enter to send message
   */
  useCmdEnterToSend?: boolean;
}

export interface GlobalPreferenceState {
  /**
   *  User UI preference state
   *  @localStorage
   */
  preference: GlobalPreference;
}

export const initialPreferenceState: GlobalPreferenceState = {
  preference: {
    expandSessionGroupKeys: [SessionDefaultGroup.Pinned, SessionDefaultGroup.Default],
    guide: {},
    inputHeight: 169,
    mobileShowTopic: false,
    sessionsWidth: 320,
    showChatSideBar: true,
    showSessionPanel: true,
    showSystemRole: false,
    useCmdEnterToSend: false,
  },
};
