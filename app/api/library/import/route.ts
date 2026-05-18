import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST /api/library/import - Import library
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'guest';
    const { libraryData } = await request.json();

    if (!libraryData) {
      return NextResponse.json(
        { success: false, error: 'Library data is required' },
        { status: 400 }
      );
    }

    // Validate JSON structure
    if (!libraryData.version || !libraryData.folders || !libraryData.dances) {
      return NextResponse.json(
        { success: false, error: 'Invalid library data format' },
        { status: 400 }
      );
    }

    // Import folders
    const folderIdMap = new Map();
    for (const folder of libraryData.folders) {
      const result = await query(
        'INSERT INTO folders (user_id, name, parent_id, position) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING RETURNING id',
        [userId, folder.name, folder.parent_id || null, folder.position || 0]
      );
      if (result.rows.length > 0) {
        folderIdMap.set(folder.id, result.rows[0].id);
      }
    }

    // Import dances
    const danceIdMap = new Map();
    for (const dance of libraryData.dances) {
      const result = await query(
        'INSERT INTO dances (user_id, name, animation_id, duration_seconds, favorite) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING RETURNING id',
        [userId, dance.name, dance.animation_id || null, dance.duration_seconds || null, dance.favorite || false]
      );
      if (result.rows.length > 0) {
        danceIdMap.set(dance.id, result.rows[0].id);
      }
    }

    // Import dance-folder references
    if (libraryData.danceFolderRefs) {
      for (const ref of libraryData.danceFolderRefs) {
        const newDanceId = danceIdMap.get(ref.dance_id);
        const newFolderId = folderIdMap.get(ref.folder_id);
        if (newDanceId && newFolderId) {
          await query(
            'INSERT INTO dance_folder_refs (dance_id, folder_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [newDanceId, newFolderId]
          );
        }
      }
    }

    // Import sequences
    const sequenceIdMap = new Map();
    if (libraryData.sequences) {
      for (const sequence of libraryData.sequences) {
        const result = await query(
          'INSERT INTO sequences (user_id, name, duration_seconds, loop) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING RETURNING id',
          [userId, sequence.name, sequence.duration_seconds || null, sequence.loop || false]
        );
        if (result.rows.length > 0) {
          sequenceIdMap.set(sequence.id, result.rows[0].id);
        }
      }
    }

    // Import sequence items
    if (libraryData.sequenceItems) {
      for (const item of libraryData.sequenceItems) {
        const newSequenceId = sequenceIdMap.get(item.sequence_id);
        const newDanceId = danceIdMap.get(item.dance_id);
        if (newSequenceId && newDanceId) {
          await query(
            'INSERT INTO sequence_items (sequence_id, dance_id, position) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
            [newSequenceId, newDanceId, item.position]
          );
        }
      }
    }

    // Import options if present
    if (libraryData.options) {
      await query(
        'INSERT INTO user_options (user_id, show_favorites_first, auto_scroll_list, confirm_before_delete, show_button_numbers) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (user_id) DO UPDATE SET show_favorites_first = $2, auto_scroll_list = $3, confirm_before_delete = $4, show_button_numbers = $5, updated_at = CURRENT_TIMESTAMP',
        [userId, libraryData.options.showFavoritesFirst, libraryData.options.autoScrollList, libraryData.options.confirmBeforeDelete, libraryData.options.showButtonNumbers]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Library imported successfully',
    });
  } catch (error) {
    console.error('Error importing library:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to import library' },
      { status: 500 }
    );
  }
}
