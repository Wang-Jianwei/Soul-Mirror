import * as SQLite from 'expo-sqlite';
import { DB_NAME, CREATE_TABLES, Thought, DailyAnswer, MoodRecord } from '../constants/database';

let db: SQLite.SQLiteDatabase | null = null;

// 初始化数据库
export function initDatabase(): SQLite.SQLiteDatabase {
  if (db) return db;
  
  db = SQLite.openDatabase(DB_NAME);
  
  // 执行建表语句
  db.transaction(tx => {
    CREATE_TABLES.split(';').forEach(statement => {
      if (statement.trim()) {
        tx.executeSql(statement.trim());
      }
    });
  });
  
  return db;
}

// 获取数据库实例
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

// 执行 SQL 查询（Promise 包装）
function executeSql(
  db: SQLite.SQLiteDatabase,
  sql: string,
  params: any[] = []
): Promise<any> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        sql,
        params,
        (_, result) => resolve(result),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
}

// ==================== 念头记录 CRUD ====================

export async function createThought(thought: Omit<Thought, 'id'>): Promise<Thought> {
  const database = getDatabase();
  const id = generateUUID();
  
  await executeSql(
    database,
    'INSERT INTO thoughts (id, content, intensity, type, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, thought.content, thought.intensity, thought.type || null, thought.createdAt]
  );
  
  return { ...thought, id };
}

export async function getThoughts(limit: number = 50): Promise<Thought[]> {
  const database = getDatabase();
  
  const result: any = await executeSql(
    database,
    'SELECT * FROM thoughts ORDER BY created_at DESC LIMIT ?',
    [limit]
  );
  
  return result.rows?._array || [];
}

export async function getThoughtsByType(type: string): Promise<Thought[]> {
  const database = getDatabase();
  
  const result: any = await executeSql(
    database,
    'SELECT * FROM thoughts WHERE type = ? ORDER BY created_at DESC',
    [type]
  );
  
  return result.rows?._array || [];
}

export async function getThoughtStats(): Promise<{ type: string; count: number }[]> {
  const database = getDatabase();
  
  const result: any = await executeSql(
    database,
    `SELECT type, COUNT(*) as count 
     FROM thoughts 
     WHERE type IS NOT NULL 
     GROUP BY type 
     ORDER BY count DESC`
  );
  
  return result.rows?._array || [];
}

export async function deleteThought(id: string): Promise<void> {
  const database = getDatabase();
  await executeSql(database, 'DELETE FROM thoughts WHERE id = ?', [id]);
}

// ==================== 每日回答 CRUD ====================

export async function saveDailyAnswer(answer: Omit<DailyAnswer, 'id'>): Promise<DailyAnswer> {
  const database = getDatabase();
  const id = generateUUID();
  
  // 检查是否已存在该天的回答
  const existingResult: any = await executeSql(
    database,
    'SELECT id FROM daily_answers WHERE day_number = ?',
    [answer.dayNumber]
  );
  
  const existing = existingResult.rows?._array?.[0];
  
  if (existing) {
    // 更新现有回答
    await executeSql(
      database,
      'UPDATE daily_answers SET answer = ?, created_at = ? WHERE id = ?',
      [answer.answer, answer.createdAt, existing.id]
    );
    return { ...answer, id: existing.id };
  }
  
  // 创建新回答
  await executeSql(
    database,
    'INSERT INTO daily_answers (id, day_number, question, answer, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, answer.dayNumber, answer.question, answer.answer, answer.createdAt]
  );
  
  return { ...answer, id };
}

export async function getDailyAnswer(dayNumber: number): Promise<DailyAnswer | null> {
  const database = getDatabase();
  
  const result: any = await executeSql(
    database,
    'SELECT * FROM daily_answers WHERE day_number = ?',
    [dayNumber]
  );
  
  return result.rows?._array?.[0] || null;
}

export async function getRecentAnswers(limit: number = 7): Promise<DailyAnswer[]> {
  const database = getDatabase();
  
  const result: any = await executeSql(
    database,
    'SELECT * FROM daily_answers ORDER BY created_at DESC LIMIT ?',
    [limit]
  );
  
  return result.rows?._array || [];
}

// ==================== 心安状态 CRUD ====================

export async function recordMood(mood: Omit<MoodRecord, 'id'>): Promise<MoodRecord> {
  const database = getDatabase();
  const id = generateUUID();
  
  await executeSql(
    database,
    'INSERT INTO mood_records (id, mood, created_at) VALUES (?, ?, ?)',
    [id, mood.mood, mood.createdAt]
  );
  
  return { ...mood, id };
}

export async function getTodayMood(): Promise<MoodRecord | null> {
  const database = getDatabase();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfDay = today.getTime();
  
  const result: any = await executeSql(
    database,
    'SELECT * FROM mood_records WHERE created_at >= ? ORDER BY created_at DESC LIMIT 1',
    [startOfDay]
  );
  
  return result.rows?._array?.[0] || null;
}

// ==================== 统计数据 ====================

export async function getStats(): Promise<{
  totalThoughts: number;
  totalAnswers: number;
  streakDays: number;
}> {
  const database = getDatabase();
  
  const thoughtsResult: any = await executeSql(database, 'SELECT COUNT(*) as count FROM thoughts');
  const answersResult: any = await executeSql(database, 'SELECT COUNT(*) as count FROM daily_answers');
  
  // 计算连续记录天数（简化版：有记录即算）
  const streakResult: any = await executeSql(
    database,
    `SELECT COUNT(DISTINCT date(created_at/1000, 'unixepoch')) as count 
     FROM thoughts 
     WHERE created_at >= ?`,
    [Date.now() - 30 * 24 * 60 * 60 * 1000]
  );
  
  return {
    totalThoughts: thoughtsResult.rows?._array?.[0]?.count || 0,
    totalAnswers: answersResult.rows?._array?.[0]?.count || 0,
    streakDays: Math.min(streakResult.rows?._array?.[0]?.count || 0, 30),
  };
}

// ==================== 数据导出 ====================

export async function exportAllData(): Promise<{
  thoughts: Thought[];
  answers: DailyAnswer[];
  moods: MoodRecord[];
}> {
  const database = getDatabase();
  
  const [thoughtsResult, answersResult, moodsResult] = await Promise.all([
    executeSql(database, 'SELECT * FROM thoughts ORDER BY created_at DESC'),
    executeSql(database, 'SELECT * FROM daily_answers ORDER BY created_at DESC'),
    executeSql(database, 'SELECT * FROM mood_records ORDER BY created_at DESC'),
  ]);
  
  return {
    thoughts: thoughtsResult.rows?._array || [],
    answers: answersResult.rows?._array || [],
    moods: moodsResult.rows?._array || [],
  };
}

// ==================== 数据清空 ====================

export async function clearAllData(): Promise<void> {
  const database = getDatabase();
  
  await executeSql(database, 'DELETE FROM thoughts');
  await executeSql(database, 'DELETE FROM daily_answers');
  await executeSql(database, 'DELETE FROM mood_records');
}

// ==================== 工具函数 ====================

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
