import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/library/export - Export library
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'guest';

    // Get all folders
    const foldersResult = await query(
      'SELECT id, name, parent_id, position FROM folders WHERE user_id = $1 ORDER BY position',
      [userId]
    );

    // Get all dances
    const dancesResult = await query(
      'SELECT id, name, animation_id, duration_seconds, favorite FROM dances WHERE user_id = $1 ORDER BY name',
      [userId]
    );

    // Get dance-folder references
    const refsResult = await query(
      'SELECT dance_id, folder_id FROM dance_folder_refs WHERE dance_id IN (SELECT id FROM dances WHERE user_id = $1)',
      [userId]
    );

    // Get sequences
    const sequencesResult = await query(
      'SELECT id, name, duration_seconds, loop FROM sequences WHERE user_id = $1 ORDER BY name',
      [userId]
    );

    // Get sequence items
    const sequenceItemsResult = await query(
      'SELECT sequence_id, dance_id, position FROM sequence_items WHERE sequence_id IN (SELECT id FROM sequences WHERE user_id = $1)',
      [userId]
    );

    // Get options
    const optionsResult = await query(
      'SELECT show_favorites_first, auto_scroll_list, confirm_before_delete, show_button_numbers FROM user_options WHERE user_id = $1',
      [userId]
    );

    const options = optionsResult.rows.length > 0 ? {
      showFavoritesFirst: optionsResult.rows[0].show_favorites_first,
      autoScrollList: optionsResult.rows[0].auto_scroll_list,
      confirmBeforeDelete: optionsResult.rows[0].confirm_before_delete,
      showButtonNumbers: optionsResult.rows[0].show_button_numbers,
    } : {
      showFavoritesFirst: true,
      autoScrollList: true,
      confirmBeforeDelete: true,
      showButtonNumbers: true,
    };

    const libraryData = {
      version: '1.0',
      exported: new Date().toISOString(),
      userId,
      folders: foldersResult.rows,
      dances: dancesResult.rows,
      danceFolderRefs: refsResult.rows,
      sequences: sequencesResult.rows,
      sequenceItems: sequenceItemsResult.rows,
      options,
    };

    return NextResponse.json({
      success: true,
      libraryData,
    });
  } catch (error) {
    console.error('Error exporting library:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export library' },
      { status: 500 }
    );
  }
}
