import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST /api/library/dances/:id/copy - Copy dance
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { folderId } = await request.json();
    const userId = request.headers.get('x-user-id') || 'guest';
    const danceId = params.id;

    // Get original dance
    const originalResult = await query(
      'SELECT name, animation_id, duration_seconds, favorite FROM dances WHERE id = $1 AND user_id = $2',
      [danceId, userId]
    );

    if (originalResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Dance not found' },
        { status: 404 }
      );
    }

    const original = originalResult.rows[0];

    // Create copy with "(Copy)" suffix
    const copyName = `${original.name} (Copy)`;

    // Insert new dance
    const result = await query(
      'INSERT INTO dances (user_id, name, animation_id, duration_seconds, favorite) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [userId, copyName, original.animation_id, original.duration_seconds, original.favorite]
    );

    const newDanceId = result.rows[0].id;

    // If folderId provided, add to folder
    if (folderId) {
      await query(
        'INSERT INTO dance_folder_refs (dance_id, folder_id) VALUES ($1, $2)',
        [newDanceId, folderId]
      );
    }

    return NextResponse.json({
      success: true,
      dance: {
        id: newDanceId,
        name: copyName,
        animationId: original.animation_id,
        favorite: original.favorite,
      },
    });
  } catch (error) {
    console.error('Error copying dance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to copy dance' },
      { status: 500 }
    );
  }
}
