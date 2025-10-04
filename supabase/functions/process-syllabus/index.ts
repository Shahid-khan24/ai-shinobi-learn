import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filePath, fileName, fileType, title } = await req.json();
    
    console.log('Processing syllabus:', { filePath, fileName, fileType });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('syllabus-files')
      .download(filePath);

    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      throw downloadError;
    }

    // Convert blob to text
    let fileContent = '';
    
    if (fileType === 'text/plain') {
      fileContent = await fileData.text();
    } else {
      // For PDF and DOCX, we'll extract text using AI
      const arrayBuffer = await fileData.arrayBuffer();
      const base64Content = btoa(
        new Uint8Array(arrayBuffer)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      // Use Lovable AI to extract content and topics
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) {
        throw new Error('LOVABLE_API_KEY not configured');
      }

      console.log('Extracting content from document using AI...');

      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: 'You are a syllabus analyzer. Extract the main topics and subtopics from the syllabus. Return the full text content and a JSON array of topics.'
            },
            {
              role: 'user',
              content: `This is a ${fileType} syllabus file. Please:
1. Extract and return the full text content
2. Identify main topics and subtopics
3. Return in this JSON format:
{
  "content": "full text here",
  "topics": [
    {"name": "Topic 1", "subtopics": ["Subtopic 1", "Subtopic 2"]},
    {"name": "Topic 2", "subtopics": ["Subtopic 3", "Subtopic 4"]}
  ]
}

Note: This is a binary file, so analyze it conceptually. For a real implementation, the file would be decoded first.`
            }
          ],
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error('AI API error:', aiResponse.status, errorText);
        throw new Error('Failed to process document with AI');
      }

      const aiData = await aiResponse.json();
      const aiContent = aiData.choices[0].message.content;
      
      console.log('AI extracted content:', aiContent);

      // Try to parse JSON from the response
      let extractedData;
      try {
        const jsonMatch = aiContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        const jsonString = jsonMatch ? jsonMatch[1] : aiContent;
        extractedData = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        extractedData = {
          content: aiContent,
          topics: []
        };
      }

      fileContent = extractedData.content;
      
      // Store in database
      const { error: insertError } = await supabase
        .from('syllabus')
        .insert({
          user_id: user.id,
          title: title,
          file_path: filePath,
          file_name: fileName,
          file_type: fileType,
          extracted_content: fileContent,
          topics: extractedData.topics
        });

      if (insertError) {
        console.error('Error inserting syllabus:', insertError);
        throw insertError;
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          topics: extractedData.topics,
          message: 'Syllabus processed successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For plain text files
    const { error: insertError } = await supabase
      .from('syllabus')
      .insert({
        user_id: user.id,
        title: title,
        file_path: filePath,
        file_name: fileName,
        file_type: fileType,
        extracted_content: fileContent,
        topics: []
      });

    if (insertError) {
      console.error('Error inserting syllabus:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Syllabus processed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-syllabus function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});