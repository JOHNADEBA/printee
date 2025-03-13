import {
  SET_USER,
  SET_DOCUMENT,
  TOGGLE_SIDEBAR,
  CLOSE_SIDEBAR,
} from "./actions";
import { AppState, Action } from "./types";

export const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        user: action.payload,
      };

    case SET_DOCUMENT:
      return {
        ...state,
        documents: action.payload,
      };

    case CLOSE_SIDEBAR:
      return {
        ...state,
        isSidebar: false,
      };

    case TOGGLE_SIDEBAR:
      return {
        ...state,
        isSidebar: !state.isSidebar,
      };

    default:
      return state;
  }
};
