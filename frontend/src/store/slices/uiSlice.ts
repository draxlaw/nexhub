import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ModalState {
  isOpen: boolean;
  type: string | null;
  data?: Record<string, unknown>;
}

interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface UiState {
  sidebarOpen: boolean;
  searchOpen: boolean;
  cartOpen: boolean;
  modal: ModalState;
  notifications: NotificationState[];
  loading: {
    global: boolean;
    buttons: Record<string, boolean>;
  };
  theme: 'light' | 'dark';
}

const initialState: UiState = {
  sidebarOpen: false,
  searchOpen: false,
  cartOpen: false,
  modal: {
    isOpen: false,
    type: null,
  },
  notifications: [],
  loading: {
    global: false,
    buttons: {},
  },
  theme: 'light',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleSearch: (state) => {
      state.searchOpen = !state.searchOpen;
    },
    setSearchOpen: (state, action: PayloadAction<boolean>) => {
      state.searchOpen = action.payload;
    },
    toggleCart: (state) => {
      state.cartOpen = !state.cartOpen;
    },
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.cartOpen = action.payload;
    },
    openModal: (state, action: PayloadAction<{ type: string; data?: Record<string, unknown> }>) => {
      state.modal.isOpen = true;
      state.modal.type = action.payload.type;
      state.modal.data = action.payload.data;
    },
    closeModal: (state) => {
      state.modal.isOpen = false;
      state.modal.type = null;
      state.modal.data = undefined;
    },
    addNotification: (state, action: PayloadAction<Omit<NotificationState, 'id'>>) => {
      const notification: NotificationState = {
        id: Date.now().toString(),
        ...action.payload,
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    setButtonLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      state.loading.buttons[action.payload.key] = action.payload.loading;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleSearch,
  setSearchOpen,
  toggleCart,
  setCartOpen,
  openModal,
  closeModal,
  addNotification,
  removeNotification,
  setGlobalLoading,
  setButtonLoading,
  setTheme,
} = uiSlice.actions;

export default uiSlice.reducer;
