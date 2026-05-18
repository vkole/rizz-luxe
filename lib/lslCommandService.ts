/**
 * LSL Command Service
 * Handles JSON communication between MOAP HUD and LSL scripts
 */

export interface LSLCommand {
  action: string;
  timestamp?: string;
  [key: string]: any;
}

export interface LSLResponse {
  status: 'success' | 'error';
  action: string;
  data?: any;
  error?: string;
}

class LSLCommandService {
  private commandQueue: LSLCommand[] = [];
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeMessageListener();
  }

  /**
   * Initialize listener for LSL responses
   */
  private initializeMessageListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('message', (event) => {
        const data = event.data;
        if (data && data.action) {
          this.handleLSLResponse(data);
        }
      });
    }
  }

  /**
   * Send command to LSL script
   */
  public sendCommand(action: string, data?: Record<string, any>): Promise<LSLResponse> {
    return new Promise((resolve, reject) => {
      const command: LSLCommand = {
        action,
        timestamp: new Date().toISOString(),
        ...data,
      };

      console.log('[LSL Command]', JSON.stringify(command));

      // In MOAP environment, use parent.postMessage
      if (typeof window !== 'undefined' && window.parent) {
        try {
          window.parent.postMessage(command, '*');
          
          // Set timeout for response
          const timeout = setTimeout(() => {
            reject(new Error(`Command timeout: ${action}`));
          }, 5000);

          // Register response listener
          this.onResponse(action, (response: LSLResponse) => {
            clearTimeout(timeout);
            if (response.status === 'success') {
              resolve(response);
            } else {
              reject(new Error(response.error || 'Unknown error'));
            }
          });
        } catch (error) {
          reject(error);
        }
      }
    });
  }

  /**
   * Handle LSL responses
   */
  private handleLSLResponse(response: LSLResponse) {
    console.log('[LSL Response]', JSON.stringify(response));
    
    const listeners = this.listeners.get(response.action) || [];
    listeners.forEach(listener => listener(response));
    
    // Clear listeners after calling
    if (listeners.length > 0) {
      this.listeners.delete(response.action);
    }
  }

  /**
   * Register response listener
   */
  private onResponse(action: string, callback: Function) {
    if (!this.listeners.has(action)) {
      this.listeners.set(action, []);
    }
    this.listeners.get(action)!.push(callback);
  }

  /**
   * Scan inventory for dances
   */
  public async scanInventory() {
    return this.sendCommand('SCAN_INVENTORY');
  }

  /**
   * Play a dance
   */
  public async playDance(danceId: string) {
    return this.sendCommand('PLAY_DANCE', { danceId });
  }

  /**
   * Stop current dance
   */
  public async stopDance() {
    return this.sendCommand('STOP_DANCE');
  }

  /**
   * Pause current dance
   */
  public async pauseDance() {
    return this.sendCommand('PAUSE_DANCE');
  }

  /**
   * Toggle loop
   */
  public async toggleLoop() {
    return this.sendCommand('TOGGLE_LOOP');
  }

  /**
   * Toggle favorite
   */
  public async toggleFavorite(danceId: string) {
    return this.sendCommand('TOGGLE_FAVORITE', { danceId });
  }

  /**
   * Create folder
   */
  public async createFolder(folderName: string, parentId?: string) {
    return this.sendCommand('CREATE_FOLDER', { folderName, parentId });
  }

  /**
   * Delete folder
   */
  public async deleteFolder(folderId: string) {
    return this.sendCommand('DELETE_FOLDER', { folderId });
  }

  /**
   * Create sequence
   */
  public async createSequence(sequenceName: string, danceIds: string[]) {
    return this.sendCommand('CREATE_SEQUENCE', { sequenceName, danceIds });
  }

  /**
   * Play sequence
   */
  public async playSequence(sequenceId: string) {
    return this.sendCommand('PLAY_SEQUENCE', { sequenceId });
  }

  /**
   * Scan nearby avatars
   */
  public async scanNearby() {
    return this.sendCommand('GET_NEARBY');
  }

  /**
   * Invite avatar
   */
  public async inviteAvatar(avatarKey: string) {
    return this.sendCommand('INVITE_AVATAR', { avatarKey });
  }

  /**
   * Export library
   */
  public async exportLibrary() {
    return this.sendCommand('EXPORT_LIBRARY');
  }

  /**
   * Import library
   */
  public async importLibrary(libraryData: any) {
    return this.sendCommand('IMPORT_LIBRARY', { libraryData });
  }
}

export const lslCommandService = new LSLCommandService();
