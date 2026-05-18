import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// PUT /api/library/dances/:id - Update dance (rename/move)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, folderId } = await request.json();
    const userId = request.headers.get('x-user-id') || 'guest';
    const danceId = params.id;

    if (name !== undefined) {
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

      // Update dance name
      await query(
        'UPDATE dances SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3',
        [name.trim(), danceId, userId]
      );
    }

    if (folderId !== undefined) {
      // Move dance to different folder
      // First remove existing folder references
      await query(
        'DELETE FROM dance_folder_refs WHERE dance_id = $1',
        [danceId]
      );

      // Add new folder reference if folderId is not null
      if (folderId) {
        await query(
          'INSERT INTO dance_folder_refs (dance_id, folder_id) VALUES ($1, $2)',
          [danceId, folderId]
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating dance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update dance' },
      { status: 500 }
    );
  }
}

// DELETE /api/library/dances/:id - Delete dance
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id') || 'guest';
    const danceId = params.id;

    // Delete from database (cascade will handle dance_folder_refs)
    await query(
      'DELETE FROM dances WHERE id = $1 AND user_id = $2',
      [danceId, userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting dance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete dance' },
      { status: 500 }
    );
  }
}
