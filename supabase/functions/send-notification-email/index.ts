import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationEmailPayload {
  notification_id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  entity_type?: string;
  entity_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: NotificationEmailPayload = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's email and preferences
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, email_notifications_enabled')
      .eq('id', payload.user_id)
      .single();

    if (profileError || !profile) {
      console.error('Failed to fetch user profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Check if user has email notifications enabled
    if (!profile.email_notifications_enabled) {
      return new Response(
        JSON.stringify({ message: 'Email notifications disabled for user' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Get user's email from auth
    const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(payload.user_id);
    
    if (authError || !user?.email) {
      console.error('Failed to fetch user email:', authError);
      return new Response(
        JSON.stringify({ error: 'User email not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Construct email content
    const subject = `[Flow] ${payload.title}`;
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${payload.title}</h1>
          </div>
          <div class="content">
            <p>${payload.message}</p>
            ${getActionLink(payload)}
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              You're receiving this email because you have notifications enabled in Flow.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Flow. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email using Resend (or your preferred email service)
    // Note: You'll need to set up RESEND_API_KEY in your Supabase Edge Function secrets
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'notifications@flow.app', // Replace with your verified domain
        to: user.email,
        subject,
        html: htmlBody,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Failed to send email:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in send-notification-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function getActionLink(payload: NotificationEmailPayload): string {
  const baseUrl = Deno.env.get('APP_URL') || 'http://localhost:3000';
  
  if (!payload.entity_type || !payload.entity_id) {
    return '';
  }

  const links: Record<string, string> = {
    task: `${baseUrl}/dashboard/tasks/${payload.entity_id}`,
    document: `${baseUrl}/dashboard/documents/${payload.entity_id}`,
    project: `${baseUrl}/dashboard/projects/${payload.entity_id}`,
    workspace: `${baseUrl}/dashboard/workspaces/${payload.entity_id}`,
  };

  const url = links[payload.entity_type];
  
  return url ? `<a href="${url}" class="button">View in Flow</a>` : '';
}
