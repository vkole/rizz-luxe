/**
 * Data Storage Service
 * Handles local storage and state management for dance library
 */

export interface DanceData {
  id: string;
  name: string;
  category: string;
  favorite: boolean;
  duration?: number;
  lastPlayed?: string;
  playCount?: number;
}

export interface SequenceData {
  id: string;
  name: string;
  dances: string[];
  duration: number;
  loop: boolean;
  created: string;
}

export interface FolderData {
  id: string;
  name: string;
  parent?: string;
  children?: string[];
}

class StorageService {
  private prefix = 'rizz-luxe:';

  /**
   * Save dances to local storage
   */
  public saveDances(dances: DanceData[]) {
    try {
      localStorage.setItem(`${this.prefix}dances`, JSON.stringify(dances));
    } catch (error) {
      console.error('Error saving dances:', error);
    }
  }

  /**
   * Load dances from local storage
   */
  public loadDances(): DanceData[] {
    try {
      const data = localStorage.getItem(`${this.prefix}dances`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading dances:', error);
      return [];
    }
  }

  /**
   * Save sequences to local storage
   */
  public saveSequences(sequences: SequenceData[]) {
    try {
      localStorage.setItem(`${this.prefix}sequences`, JSON.stringify(sequences));
    } catch (error) {
      console.error('Error saving sequences:', error);
    }
  }

  /**
   * Load sequences from local storage
   */
  public loadSequences(): SequenceData[] {
    try {
      const data = localStorage.getItem(`${this.prefix}sequences`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading sequences:', error);
      return [];
    }
  }

  /**
   * Save folders to local storage
   */
  public saveFolders(folders: FolderData[]) {
    try {
      localStorage.setItem(`${this.prefix}folders`, JSON.stringify(folders));
    } catch (error) {
      console.error('Error saving folders:', error);
    }
  }

  /**
   * Load folders from local storage
   */
  public loadFolders(): FolderData[] {
    try {
      const data = localStorage.getItem(`${this.prefix}folders`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading folders:', error);
      return [];
    }
  }

  /**
   * Export full library as JSON
   */
  public exportLibrary() {
    const library = {
      version: '1.0',
      exported: new Date().toISOString(),
      dances: this.loadDances(),
      sequences: this.loadSequences(),
      folders: this.loadFolders(),
    };
    return JSON.stringify(library, null, 2);
  }

  /**
   * Import library from JSON
   */
  public importLibrary(jsonData: string) {
    try {
      const library = JSON.parse(jsonData);
      if (library.dances) this.saveDances(library.dances);
      if (library.sequences) this.saveSequences(library.sequences);
      if (library.folders) this.saveFolders(library.folders);
      return true;
    } catch (error) {
      console.error('Error importing library:', error);
      return false;
    }
  }

  /**
   * Clear all data
   */
  public clearAll() {
    try {
      localStorage.removeItem(`${this.prefix}dances`);
      localStorage.removeItem(`${this.prefix}sequences`);
      localStorage.removeItem(`${this.prefix}folders`);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
}

export const storageService = new StorageService();
