import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '../types';
import api from '../utils/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // 登录/注册
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  
  // 用户信息
  fetchUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  
  // 权限检查
  isAdmin: () => boolean;
  isArtist: () => boolean;
  isArtistOrAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (username: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', { username, password });
          const { token, user } = response.data;
          
          localStorage.setItem('token', token);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.response?.data?.message || '登录失败');
        }
      },

      register: async (username: string, email: string, password: string, role: UserRole = 'USER') => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/register', { 
            username, 
            email, 
            password, 
            role 
          });
          const { token, user } = response.data;
          
          localStorage.setItem('token', token);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.response?.data?.message || '注册失败');
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      fetchUser: async () => {
        try {
          const response = await api.get('/users/me');
          set({ user: response.data });
        } catch (error) {
          // Token 无效，登出
          get().logout();
        }
      },

      updateUser: async (data: Partial<User>) => {
        try {
          const response = await api.put('/users/me', data);
          set({ user: { ...get().user!, ...response.data } });
        } catch (error: any) {
          throw new Error(error.response?.data?.message || '更新失败');
        }
      },

      isAdmin: () => get().user?.role === 'ADMIN',
      isArtist: () => get().user?.role === 'ARTIST',
      isArtistOrAdmin: () => ['ARTIST', 'ADMIN'].includes(get().user?.role || ''),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
