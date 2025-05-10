// src/services/fileApi.js
export default {
    async getFiles(path) {
      // Normaliziraj path (osigurava da path uvijek počinje sa /)
      const normalizedPath = path.startsWith('/') ? path : `/${path}`;
      
      // Simuliramo kašnjenje mreže
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Struktura po folderima
      const database = {
        '/': [
          { 
            name: 'Documents', 
            type: 'dir', 
            path: '/Documents',
            modified: new Date('2023-10-15T08:30:00'),
            icon: 'folder'
          },
          { 
            name: 'Images', 
            type: 'dir', 
            path: '/Images',
            modified: new Date('2023-10-14T15:20:00'),
            icon: 'folder'
          },
          { 
            name: 'Project.pdf', 
            type: 'file', 
            size: 2456789,
            path: '/Project.pdf',
            modified: new Date('2023-10-10T09:15:00'),
            icon: 'picture_as_pdf'
          }
        ],
        '/Documents': [
          {
            name: 'Work',
            type: 'dir',
            path: '/Documents/Work',
            modified: new Date('2023-10-12T11:45:00'),
            icon: 'folder'
          },
          {
            name: 'Personal',
            type: 'dir',
            path: '/Documents/Personal',
            modified: new Date('2023-09-28T14:30:00'),
            icon: 'folder'
          },
          {
            name: 'Notes.txt',
            type: 'file',
            size: 1024,
            path: '/Documents/Notes.txt',
            modified: new Date('2023-10-15T10:20:00'),
            icon: 'description'
          }
        ],
        '/Images': [
          {
            name: 'Vacation.jpg',
            type: 'file',
            size: 3456789,
            path: '/Images/Vacation.jpg',
            modified: new Date('2023-08-20T16:40:00'),
            icon: 'image'
          },
          {
            name: 'Profile.png',
            type: 'file',
            size: 1234567,
            path: '/Images/Profile.png',
            modified: new Date('2023-09-05T12:15:00'),
            icon: 'portrait'
          }
        ],
        '/Documents/Work': [
          {
            name: 'Presentation.pptx',
            type: 'file',
            size: 4567890,
            path: '/Documents/Work/Presentation.pptx',
            modified: new Date('2023-10-11T13:25:00'),
            icon: 'slideshow'
          },
          {
            name: 'Budget.xlsx',
            type: 'file',
            size: 2345678,
            path: '/Documents/Work/Budget.xlsx',
            modified: new Date('2023-10-14T17:10:00'),
            icon: 'table_chart'
          }
        ],
        '/Documents/Personal': [
          {
            name: 'Resume.pdf',
            type: 'file',
            size: 1234567,
            path: '/Documents/Personal/Resume.pdf',
            modified: new Date('2023-09-15T10:30:00'),
            icon: 'picture_as_pdf'
          }
        ]
      };
  
      // Vraćamo podatke za traženi path ili prazan niz
      return database[normalizedPath] || [];
    },
    
    // Dodatna metoda za pretraživanje
    async searchFiles(query) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const allFiles = Object.values(this.database).flat();
      return allFiles.filter(file => 
        file.name.toLowerCase().includes(query.toLowerCase())
      );
    }
  };