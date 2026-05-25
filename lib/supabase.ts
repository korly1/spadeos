import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type AssessmentSubmission = {
  id?: string;
  created_at?: string;
  role: string;
  company_size: string;
  pain_points: string[];
  urgency: string;
  tried_so_far: string;
  email: string;
};
