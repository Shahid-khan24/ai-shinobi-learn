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
    const { syllabusId, topics, difficulty, context } = await req.json();
    
    if (!syllabusId || !topics || !difficulty || !context) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating quiz for syllabus:', syllabusId, 'Topics:', topics, 'Difficulty:', difficulty);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Call Lovable AI to generate quiz questions based on syllabus
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
            content: `You are an expert quiz creator. Generate educational quiz questions based on the provided syllabus content. Focus specifically on the selected topics. Always return valid JSON.`
          },
          {
            role: 'user',
            content: `Based on this syllabus content, generate 5 multiple-choice quiz questions at "${difficulty}" difficulty level.

Focus on these topics: ${topics.join(', ')}

Syllabus Content:
${context}

Return ONLY a JSON array of questions in this exact format:
[
  {
    "question": "What is...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Detailed explanation of why this is correct"
  }
]

Requirements:
- Questions must be directly related to the syllabus content
- Focus on the selected topics
- Make questions challenging and educational at ${difficulty} level
- Ensure options are plausible distractors
- correctAnswer is the index (0-3) of the correct option
- Provide clear, educational explanations`
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

      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const generatedContent = aiData.choices[0].message.content;
    
    console.log('AI generated content:', generatedContent);

    // Parse the JSON response
    let questions;
    try {
      const jsonMatch = generatedContent.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : generatedContent;
      questions = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse quiz questions from AI response');
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid quiz questions format');
    }

    // Store quiz in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create a custom topic for this syllabus-based quiz
    const topicName = `Syllabus: ${topics.join(', ')}`;
    
    let topicId;
    const { data: existingTopic } = await supabase
      .from('quiz_topics')
      .select('id')
      .eq('name', topicName)
      .single();

    if (existingTopic) {
      topicId = existingTopic.id;
    } else {
      const { data: newTopic, error: topicError } = await supabase
        .from('quiz_topics')
        .insert({
          name: topicName,
          icon: 'FileText',
          description: `Quiz based on uploaded syllabus`
        })
        .select()
        .single();

      if (topicError) {
        console.error('Error creating topic:', topicError);
        throw topicError;
      }
      topicId = newTopic.id;
    }

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
        message: 'Quiz generated successfully from syllabus'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-syllabus-quiz function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});