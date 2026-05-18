/**
 * API Client Service
 * Handles all HTTP communication with backend API
 */

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl = '/api/library';
  private userId = 'guest'; // In production, get from auth context

  /**
   * GET /api/library/folders
   */
  async getFolders() {
    return this.request('folders', 'GET');
  }

  /**
   * POST /api/library/folders/create
   */
  async createFolder(name: string, parentId?: string) {
    return this.request('folders/create', 'POST', {
      name,
      parentId,
    });
  }

  /**
   * PUT /api/library/folders/:id
   */
  async updateFolder(id: string, name: string, parentId?: string) {
    return this.request(`folders/${id}`, 'PUT', {
      name,
      parentId,
    });
  }

  /**
   * DELETE /api/library/folders/:id
   */
  async deleteFolder(id: string) {
    return this.request(`folders/${id}`, 'DELETE');
  }

  /**
   * GET /api/library/dances
   */
  async getDances(folderId?: string) {
    const url = folderId ? `dances?folderId=${folderId}` : 'dances';
    return this.request(url, 'GET');
  }

  /**
   * POST /api/library/dances
   */
  async createDance(name: string, folderId?: string, animationId?: string) {
    return this.request('dances', 'POST', {
      name,
      folderId,
      animationId,
    });
  }

  /**
   * PUT /api/library/dances/:id
   */
  async updateDance(id: string, data: any) {
    return this.request(`dances/${id}`, 'PUT', data);
  }

  /**
   * DELETE /api/library/dances/:id
   */
  async deleteDance(id: string) {
    return this.request(`dances/${id}`, 'DELETE');
  }

  /**
   * POST /api/library/dances/:id/copy
   */
  async copyDance(id: string, folderId?: string) {
    return this.request(`dances/${id}/copy`, 'POST', { folderId });
  }

  /**
   * Rename item (folder or dance)
   */
  async renameItem(type: 'folder' | 'dance', id: string, name: string) {
    return this.request(`${type}s/${id}`, 'PUT', { name });
  }

  /**
   * Move item to folder
   */
  async moveItem(type: 'folder' | 'dance', id: string, targetFolderId?: string) {
    return this.request(`${type}s/${id}`, 'PUT', { folderId: targetFolderId });
  }

  /**
   * GET /api/library/options
   */
  async getOptions() {
    return this.request('options', 'GET');
  }

  /**
   * PUT /api/library/options
   */
  async updateOptions(options: any) {
    return this.request('options', 'PUT', options);
  }

  /**
   * GET /api/library/backups
   */
  async getBackups() {
    return this.request('backups', 'GET');
  }

  /**
   * POST /api/library/backups
   */
  async createBackup(backupName: string, libraryData: any) {
    return this.request('backups', 'POST', {
      backupName,
      libraryData,
    });
  }

  /**
   * POST /api/library/import
   */
  async importLibrary(libraryData: any) {
    return this.request('import', 'POST', {
      libraryData,
    });
  }

  /**
   * GET /api/library/export
   */
  async exportLibrary() {
    return this.request('export', 'GET');
  }

  /**
   * Internal request handler
   */
  private async request(endpoint: string, method: string, body?: any) {
    try {
      const url = `${this.baseUrl}/${endpoint}`;
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': this.userId,
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
