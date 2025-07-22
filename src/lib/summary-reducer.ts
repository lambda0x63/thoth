import { VideoMetadata } from '@/types/video';

export interface SummaryState {
  // Content states
  summary: string;
  displaySummary: string;
  metadata: VideoMetadata | null;
  
  // UI states
  status: string;
  error: string;
  isStreaming: boolean;
  copied: boolean;
  
  // Buffer for streaming
  buffer: string;
}

export const initialState: SummaryState = {
  summary: '',
  displaySummary: '',
  metadata: null,
  status: '',
  error: '',
  isStreaming: true,
  copied: false,
  buffer: '',
};

export type SummaryAction =
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_CACHED_DATA'; payload: { summary: string; metadata: VideoMetadata | null } }
  | { type: 'START_STREAMING' }
  | { type: 'SET_METADATA'; payload: VideoMetadata }
  | { type: 'SET_STATUS'; payload: string }
  | { type: 'APPEND_CONTENT'; payload: string }
  | { type: 'UPDATE_DISPLAY' }
  | { type: 'COMPLETE_STREAMING' }
  | { type: 'SET_COPIED'; payload: boolean }
  | { type: 'RESET' };

export function summaryReducer(state: SummaryState, action: SummaryAction): SummaryState {
  switch (action.type) {
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isStreaming: false,
      };
      
    case 'SET_CACHED_DATA':
      return {
        ...state,
        summary: action.payload.summary,
        displaySummary: action.payload.summary,
        metadata: action.payload.metadata,
        isStreaming: false,
      };
      
    case 'START_STREAMING':
      return {
        ...initialState,
        isStreaming: true,
      };
      
    case 'SET_METADATA':
      return {
        ...state,
        metadata: action.payload,
      };
      
    case 'SET_STATUS':
      return {
        ...state,
        status: action.payload,
      };
      
    case 'APPEND_CONTENT':
      return {
        ...state,
        buffer: state.buffer + action.payload,
        summary: state.buffer + action.payload,
      };
      
    case 'UPDATE_DISPLAY':
      return {
        ...state,
        displaySummary: state.buffer,
      };
      
    case 'COMPLETE_STREAMING':
      return {
        ...state,
        isStreaming: false,
        displaySummary: state.buffer,
      };
      
    case 'SET_COPIED':
      return {
        ...state,
        copied: action.payload,
      };
      
    case 'RESET':
      return initialState;
      
    default:
      return state;
  }
}