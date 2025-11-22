import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client-side Supabase client (for browser)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (for API routes with service role)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Helper function to upload verification documents
export async function uploadVerificationDocument(
  file: File,
  professionalId: string,
  documentType: string
): Promise<{ url: string; path: string } | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${professionalId}/${documentType}_${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabaseAdmin.storage
      .from('verification-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }

    // Get signed URL (valid for 1 hour)
    const { data: urlData } = await supabaseAdmin.storage
      .from('verification-documents')
      .createSignedUrl(data.path, 3600);

    return {
      url: urlData?.signedUrl || '',
      path: data.path,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
}

// Helper function to get signed URL for a document
export async function getSignedDocumentUrl(
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from('verification-documents')
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Error getting signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Signed URL error:', error);
    return null;
  }
}

// Helper function to delete a document
export async function deleteDocument(path: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.storage
      .from('verification-documents')
      .remove([path]);

    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}
