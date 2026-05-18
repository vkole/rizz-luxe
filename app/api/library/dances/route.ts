import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface DanceRow {
  id: string;
  name: string;
  animation_id: string | null;
  duration_seconds: number | null;
  favorite: boolean;
  created_at: string;
  updated_at: string;
}

// GET /api/library/dances - Get all dances
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'guest';
    const folderId = request.nextUrl.searchParams.get('folderId');

    let queryText: string;
    let params: any[];

    if (folderId) {
      queryText = `
        SELECT d.* FROM dances d
        JOIN dance_folder_refs df ON d.id = df.dance_id
        WHERE d.user_id = $1 AND df.folder_id = $2
        ORDER BY d.name
      `;
      params = [userId, folderId];
    } else {
      queryText = 'SELECT * FROM dances WHERE user_id = $1 ORDER BY name';
      params = [userId];
    }

    const result = await query(queryText, params);

    const dances = result.rows.map((row: DanceRow) => ({
      id: row.id,
      name: row.name,
      animationId: row.animation_id,
      durationSeconds: row.duration_seconds,
      favorite: row.favorite,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ success: true, dances });
  } catch (error) {
    console.error('Error fetching dances:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dances' },
      { status: 500 }
    );
  }
}

// POST /api/library/dances - Create dance
export async function POST(request: NextRequest) {
  try {
    const { name, folderId, animationId } = await request.json();
    const userId = request.headers.get('x-user-id') || 'guest';

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Dance name is required' },
        { status: 400 }
      );
    }

    if (name.length > 255) {
      return NextResponse.json(
        { success: false, error: 'Dance name too long (max 255 characters)' },
        { status: 400 }
      );
    }

    // Insert into database
    const result = await query(
      'INSERT INTO dances (user_id, name, animation_id) VALUES ($1, $2, $3) RETURNING *',
      [userId, name.trim(), animationId || null]
    );

    const danceId = result.rows[0].id;

    // If folderId provided, add to folder
    if (folderId) {
      await query(
        'INSERT INTO dance_folder_refs (dance_id, folder_id) VALUES ($1, $2)',
        [danceId, folderId]
      );
    }

    return NextResponse.json({
      success: true,
      dance: {
        id: danceId,
        name: result.rows[0].name,
        animationId: result.rows[0].animation_id,
        favorite: result.rows[0].favorite,
      },
    });
  } catch (error) {
    console.error('Error creating dance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create dance' },
      { status: 500 }
    );
  }
}
