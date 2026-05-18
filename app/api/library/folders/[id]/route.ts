import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// PUT /api/library/folders/:id - Update folder (rename/move)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, parentId } = await request.json();
    const userId = request.headers.get('x-user-id') || 'guest';
    const folderId = params.id;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Folder name is required' },
        { status: 400 }
      );
    }

    if (name.length > 255) {
      return NextResponse.json(
        { success: false, error: 'Folder name too long (max 255 characters)' },
        { status: 400 }
      );
    }

    // Check for duplicate names under new parent (if changing parent or name)
    if (parentId !== undefined || name) {
      const duplicateCheck = await query(
        'SELECT id FROM folders WHERE user_id = $1 AND parent_id $2 AND name = $3 AND id != $4',
        [userId, parentId || null, name.trim(), folderId]
      );

      if (duplicateCheck.rows.length > 0) {
        return NextResponse.json(
          { success: false, error: 'A folder with this name already exists in this location' },
          { status: 409 }
        );
      }
    }

    // Update in database
    await query(
      'UPDATE folders SET name = $1, parent_id = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4',
      [name.trim(), parentId || null, folderId, userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating folder:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update folder' },
      { status: 500 }
    );
  }
}

// DELETE /api/library/folders/:id - Delete folder
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id') || 'guest';
    const folderId = params.id;

    // Delete from database (cascade will handle children and dance_folder_refs)
    await query(
      'DELETE FROM folders WHERE id = $1 AND user_id = $2',
      [folderId, userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete folder' },
      { status: 500 }
    );
  }
}
