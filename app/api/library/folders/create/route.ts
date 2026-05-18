import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { name, parentId } = await request.json();
    const userId = request.headers.get('x-user-id') || 'guest';

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

    // Check for duplicate names under parent
    const duplicateCheck = await query(
      'SELECT id FROM folders WHERE user_id = $1 AND parent_id $2 AND name = $3',
      [userId, parentId || null, name.trim()]
    );

    if (duplicateCheck.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'A folder with this name already exists in this location' },
        { status: 409 }
      );
    }

    // Get next position
    const positionResult = await query(
      'SELECT COALESCE(MAX(position), 0) + 1 as next_position FROM folders WHERE user_id = $1 AND parent_id $2',
      [userId, parentId || null]
    );
    const nextPosition = positionResult.rows[0]?.next_position || 0;

    // Insert into database
    const result = await query(
      'INSERT INTO folders (user_id, name, parent_id, position) VALUES ($1, $2, $3, $4) RETURNING id, name, parent_id, position',
      [userId, name.trim(), parentId || null, nextPosition]
    );

    return NextResponse.json({
      success: true,
      folder: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        parentId: result.rows[0].parent_id,
        position: result.rows[0].position,
      },
    });
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create folder' },
      { status: 500 }
    );
  }
}
