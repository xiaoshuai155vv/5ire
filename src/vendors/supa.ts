import useAuthStore from 'stores/useAuthStore';
import Debug from 'debug';
import { createClient } from '@supabase/supabase-js';
import { captureException } from '../renderer/logging';

const debug = Debug('5ire:vendors:supa');

// 添加调试日志
debug('环境变量:', {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_KEY: process.env.SUPABASE_KEY?.slice(0, 10) + '...',  // 只显示前10位
});

// 检查必要的环境变量
const requiredEnvVars = {
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_KEY: process.env.SUPABASE_KEY || '',
};

// 验证环境变量
if (!requiredEnvVars.SUPABASE_URL || !requiredEnvVars.SUPABASE_KEY) {
  console.warn('Supabase 环境变量未正确设置，某些功能可能不可用');
  console.warn('请确保设置了 SUPABASE_URL 和 SUPABASE_KEY');
}

// 创建 Supabase 客户端
export const supabase = createClient(
  requiredEnvVars.SUPABASE_URL,
  requiredEnvVars.SUPABASE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);

export async function fetchById<Type>(
  table: string,
  id: number,
  columns: string = '*',
): Promise<Type> {
  const { data, error } = await supabase
    .from(table)
    .select(columns)
    .eq('id', id)
    .single();
  if (error) {
    debug(error);
    captureException(error);
    throw error;
  }
  return data as Type;
}

export async function fetchMime<Type>(
  table: string,
  columns: string = '*',
): Promise<Type[]> {
  const { user } = useAuthStore.getState();
  if (!user) {
    throw Error('Your session is expired, please sign in.');
  }
  const { data, error } = await supabase
    .from(table)
    .select(columns)
    .eq('created_by', user.id);
  if (error) {
    debug(error);
    captureException(error);
    throw error;
  }
  return data as Type[];
}

export default supabase;
