import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface BackupRow {
  id: string;
  backup_name: string;
  created_at: string;
}

// GET /api/library/backups - Get all backups
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'guest';

    const result = await query(
      'SELECT id, backup_name, created_at FROM backups WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
      [userId]
    );

    const backups = result.rows.map((row: BackupRow) => ({
      id: row.id,
      backupName: row.backup_name,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ success: true, backups });
  } catch (error) {
    console.error('Error fetching backups:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch backups' },
      { status: 500 }
    );
  }
}

// POST /api/library/backups - Create backup
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'guest';
    const { backupName, libraryData } = await request.json();

    if (!backupName || backupName.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Backup name is required' },
        { status: 400 }
      );
    }

    if (backupName.length > 255) {
      return NextResponse.json(
        { success: false, error: 'Backup name too long (max 255 characters)' },
        { status: 400 }
      );
    }

    const result = await query(
      'INSERT INTO backups (user_id, backup_name, backup_data) VALUES ($1, $2, $3) RETURNING id, backup_name, created_at',
      [userId, backupName.trim(), JSON.stringify(libraryData)]
    );

    return NextResponse.json({
      success: true,
      backup: {
        id: result.rows[0].id,
        backupName: result.rows[0].backup_name,
        createdAt: result.rows[0].created_at,
      },
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create backup' },
      { status: 500 }
    );
  }
}
