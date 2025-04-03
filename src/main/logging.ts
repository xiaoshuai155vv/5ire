import * as Sentry from '@sentry/electron/main';
import log from 'electron-log';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import Debug from 'debug';
import { captureException as sentryCaptureException } from '@sentry/electron';

// 设置控制台输出编码
if (process.platform === 'win32') {
  // 在 Windows 上设置控制台编码为 UTF-8
  try {
    // 尝试设置控制台代码页为 65001 (UTF-8)
    const { execSync } = require('child_process');
    execSync('chcp 65001', { stdio: 'ignore' });
  } catch (e) {
    console.error('无法设置控制台编码:', e);
  }
}

export function init() {
  if (process.env.SENTRY_DSN && process.env.NODE_ENV !== 'development') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
    });
  }
}

export function captureException(error: Error | string) {
  log.error(error);
  if (process.env.SENTRY_DSN && process.env.NODE_ENV !== 'development') {
    Sentry.captureException(error);
  }
}

export function captureWarning(warning: any) {
  log.warn(warning);
  if (process.env.SENTRY_DSN && process.env.NODE_ENV !== 'development') {
    Sentry.captureMessage(warning, 'warning');
  }
}

export function debug(...messages: any[]) {
  log.debug(messages);
}

export function info(message: string, ...args: any[]) {
  const debug = Debug('5ire:info');
  
  // 确保消息是有效的 UTF-8 字符串
  let safeMessage = message;
  try {
    // 尝试将消息转换为 UTF-8 字符串
    safeMessage = Buffer.from(message, 'utf8').toString('utf8');
  } catch (e) {
    // 如果转换失败，使用原始消息
  }
  
  debug(safeMessage, ...args);
}

export function warn(...messages: any[]) {
  log.warn(...messages);
}

export function error(message: string, ...args: any[]) {
  const debug = Debug('5ire:error');
  
  // 确保消息是有效的 UTF-8 字符串
  let safeMessage = message;
  try {
    safeMessage = Buffer.from(message, 'utf8').toString('utf8');
  } catch (e) {
    // 如果转换失败，使用原始消息
  }
  
  debug(safeMessage, ...args);
}
