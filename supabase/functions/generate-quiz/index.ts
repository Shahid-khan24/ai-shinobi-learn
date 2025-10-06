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
    const { topic, difficulty } = await req.json();
    
    if (!topic || !difficulty) {
      return new Response(
        JSON.stringify({ error: 'Topic and difficulty are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating quiz for:', topic, difficulty);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Call Lovable AI to generate quiz questions
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
            content: `You are an expert quiz creator. Generate educational quiz questions that are engaging, accurate, and at the appropriate difficulty level. Always return valid JSON.`
          },
          {
            role: 'user',
            content: `Generate 5 multiple-choice quiz questions about "${topic}" at "${difficulty}" difficulty level.
            
Return ONLY a valid JSON array of questions. Do NOT use markdown code blocks. Do NOT include any explanatory text before or after the JSON.

Return in this exact format:
[
  {
    "question": "What is...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Detailed explanation of why this is correct"
  }
]

CRITICAL Requirements:
- Return ONLY the JSON array, nothing else
- NO markdown code blocks (no \`\`\`json)
- NO special characters or LaTeX formulas in questions (use plain text)
- Make questions challenging and educational for ${difficulty} level
- Ensure options are plausible distractors
- correctAnswer must be the index (0-3) of the correct option
- Provide clear, educational explanations in plain English`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: `AI API error: ${aiResponse.status} - ${errorText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const generatedContent = aiData.choices[0].message.content;
    
    console.log('AI generated content:', generatedContent);

    // Parse the JSON response
    let questions;
    try {
      // Clean the response - remove markdown code blocks and trim whitespace
      let cleanedContent = generatedContent.trim();
      
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = cleanedContent.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        cleanedContent = jsonMatch[1].trim();
      }
      
      // Remove any remaining backticks
      cleanedContent = cleanedContent.replace(/^`+|`+$/g, '');
      
      console.log('Cleaned content for parsing:', cleanedContent.substring(0, 200));
      questions = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Original content:', generatedContent);
      return new Response(
        JSON.stringify({ error: 'Failed to parse quiz questions. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate the questions
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid quiz questions format');
    }

    // Get or create quiz topic in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Ensure topic exists (create if missing)
    let topicId: string | null = null;
    const { data: topicData, error: topicError } = await supabase
      .from('quiz_topics')
      .select('id')
      .eq('name', topic)
      .maybeSingle();

    if (topicError) {
      console.error('Error fetching topic:', topicError);
      return new Response(
        JSON.stringify({ error: `Database error: ${topicError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (topicData?.id) {
      topicId = topicData.id;
      console.log('Using existing topic:', topicId);
    } else {
      console.log('Creating new topic:', topic);
      const { data: newTopic, error: createTopicError } = await supabase
        .from('quiz_topics')
        .insert({ name: topic, icon: 'BookOpen', description: `Learn about ${topic}` })
        .select('id')
        .single();
      
      if (createTopicError) {
        console.error('Error creating topic:', createTopicError);
        return new Response(
          JSON.stringify({ error: `Failed to create topic: ${createTopicError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      topicId = newTopic.id;
      console.log('Created new topic:', topicId);
    }

    if (!topicId) {
      return new Response(
        JSON.stringify({ error: 'Topic ID is null after creation/fetch' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store quiz in database
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        topic_id: topicId,
        difficulty: difficulty.toLowerCase(),
        questions: questions
      })
      .select()
      .single();

    if (quizError) {
      console.error('Error storing quiz:', quizError);
      throw quizError;
    }

    console.log('Quiz created successfully:', quizData.id);

    return new Response(
      JSON.stringify({ 
        quiz: quizData,
        message: 'Quiz generated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-quiz function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});