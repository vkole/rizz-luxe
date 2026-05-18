import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface OptionsRow {
  show_favorites_first: boolean;
  auto_scroll_list: boolean;
  confirm_before_delete: boolean;
  show_button_numbers: boolean;
}

// GET /api/library/options - Get user options
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'guest';

    const result = await query(
      'SELECT * FROM user_options WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      // Create default options for user
      const defaultOptions = {
        showFavoritesFirst: true,
        autoScrollList: true,
        confirmBeforeDelete: true,
        showButtonNumbers: true,
      };

      await query(
        'INSERT INTO user_options (user_id, show_favorites_first, auto_scroll_list, confirm_before_delete, show_button_numbers) VALUES ($1, $2, $3, $4, $5)',
        [userId, defaultOptions.showFavoritesFirst, defaultOptions.autoScrollList, defaultOptions.confirmBeforeDelete, defaultOptions.showButtonNumbers]
      );

      return NextResponse.json({ success: true, options: defaultOptions });
    }

    const row: OptionsRow = result.rows[0];

    const options = {
      showFavoritesFirst: row.show_favorites_first,
      autoScrollList: row.auto_scroll_list,
      confirmBeforeDelete: row.confirm_before_delete,
      showButtonNumbers: row.show_button_numbers,
    };

    return NextResponse.json({ success: true, options });
  } catch (error) {
    console.error('Error fetching options:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch options' },
      { status: 500 }
    );
  }
}

// PUT /api/library/options - Update user options
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'guest';
    const options = await request.json();

    await query(
      'INSERT INTO user_options (user_id, show_favorites_first, auto_scroll_list, confirm_before_delete, show_button_numbers) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (user_id) DO UPDATE SET show_favorites_first = $2, auto_scroll_list = $3, confirm_before_delete = $4, show_button_numbers = $5, updated_at = CURRENT_TIMESTAMP',
      [userId, options.showFavoritesFirst, options.autoScrollList, options.confirmBeforeDelete, options.showButtonNumbers]
    );

    return NextResponse.json({ success: true, options });
  } catch (error) {
    console.error('Error updating options:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update options' },
      { status: 500 }
    );
  }
}
