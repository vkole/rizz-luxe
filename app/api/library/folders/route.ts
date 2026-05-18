import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface FolderRow {
  id: string;
  name: string;
  parent_id: string | null;
  position: number;
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'guest';

    const result = await query(
      'SELECT id, name, parent_id, position FROM folders WHERE user_id = $1 ORDER BY position, name',
      [userId]
    );

    const folders = result.rows.map((row: FolderRow) => ({
      id: row.id,
      name: row.name,
      parentId: row.parent_id,
      position: row.position,
    }));

    return NextResponse.json({ success: true, folders });
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch folders' },
      { status: 500 }
    );
  }
}
