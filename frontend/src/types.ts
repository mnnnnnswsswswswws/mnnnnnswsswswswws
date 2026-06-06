export interface Photo {
  id: string;
  filename: string;
  caption: string;
  order: number;
  uploadedAt: string;
}

export interface Book {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  photos: Photo[];
}

export interface LocalBook {
  id: string;
  editToken: string;
  title: string;
  createdAt: string;
}
