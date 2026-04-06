from openai import OpenAI
from config import settings
from typing import List, Dict, Any, Generator, AsyncGenerator, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AIService:
    _instance: Optional['AIService'] = None
    _client: Optional[OpenAI] = None
    
    AI_CONFIGS = {
        'general': {
            'model': 'gpt-4o',
            'temperature': 0.7,
            'max_tokens': 1000,
            'system_prompt': """You are a compassionate, wise spiritual companion. Your role is to:
1. Have meaningful conversations about faith, life, and spirituality
2. Provide gentle guidance grounded in biblical principles
3. Listen with empathy and respond with kindness
4. Share relevant scripture when appropriate
5. Encourage users in their spiritual journey

Be warm, conversational, and supportive. Draw from the Bible and Christian tradition when helpful."""
        },
        'bibleStudy': {
            'model': 'gpt-4o',
            'temperature': 0.3,
            'max_tokens': 1000,
            'system_prompt': """You are a compassionate, knowledgeable Bible study assistant. Your role is to:
1. Explain Bible verses with historical and theological context
2. Help users understand what God was communicating in the passage
3. Provide relevant cross-references
4. Be respectful of different interpretations
5. Encourage personal reflection and application

Always cite verses in format: Book Chapter:Verse (e.g., John 3:16)"""
        },
        'emotionalSupport': {
            'model': 'gpt-4o',
            'temperature': 0.7,
            'max_tokens': 800,
            'system_prompt': """You are an empathetic spiritual companion. Your role is to:
1. Listen with compassion and understanding
2. Provide comfort through relevant scriptures
3. Offer practical spiritual guidance
4. Pray for and with the user
5. Suggest appropriate scripture readings for their situation
6. Never replace professional mental health help when needed

Be warm, encouraging, and supportive while maintaining appropriate boundaries."""
        },
        'devotion': {
            'model': 'gpt-4o',
            'temperature': 0.5,
            'max_tokens': 600,
            'system_prompt': """You are a devotion guide helping users start their day with God. Your role is to:
1. Ask about their day and upcoming challenges
2. Pray specifically for their day
3. Suggest scripture readings relevant to their schedule
4. Help them reflect on God's word
5. Encourage daily spiritual growth

Keep devotion sessions focused and uplifting (10-15 minutes)."""
        },
        'voiceCall': {
            'model': 'gpt-4o-realtime-preview-2024-10-01',
            'temperature': 0.8,
            'system_prompt': """You are Aria, a compassionate spiritual companion in a real-time voice conversation. Your role is to:
1. Listen deeply and respond with warmth, like a close friend and spiritual mentor.
2. Ground your wisdom in the Bible. ALWAYS support your key points with relevant Bible verses.
3. Be concise and conversational—don't provide long monologues, as this is a live spoken dialogue.
4. If the user is struggling, pray for them briefly.
5. Use a calm, steady, and encouraging tone.

You are currently in a sacred space of reflection. Speak as one who carries the peace of God."""
        }
    }
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._client is None:
            self._client = OpenAI(api_key=settings.openai_api_key)
            logger.info("OpenAI client initialized")
    
    def generate_response(
        self,
        messages: List[Dict[str, str]],
        mode: str,
        custom_instructions: Optional[str] = None
    ) -> str:
        """Generate AI response for the given mode"""
        if mode not in self.AI_CONFIGS:
            raise ValueError(f"Invalid mode: {mode}")
        
        config = self.AI_CONFIGS[mode]
        system_prompt = config['system_prompt']
        if custom_instructions:
            system_prompt = f"{system_prompt}\n\nUSER CUSTOMIZATION:\n{custom_instructions}"
        
        try:
            response = self._client.chat.completions.create(
                model=config['model'],
                messages=[
                    {'role': 'system', 'content': system_prompt},
                    *messages
                ],
                temperature=config['temperature'],
                max_tokens=config['max_tokens']
            )
            
            content = response.choices[0].message.content
            if not content:
                return "I apologize, but I was unable to generate a response. Please try again."
            
            return content
        except Exception as e:
            logger.error(f"Error generating AI response: {e}")
            return "I apologize, but I encountered an error. Please try again."
    
    def generate_response_stream(
        self,
        messages: List[Dict[str, str]],
        mode: str,
        custom_instructions: Optional[str] = None
    ) -> Generator[str, None, None]:
        """Generate AI response as a stream"""
        if mode not in self.AI_CONFIGS:
            raise ValueError(f"Invalid mode: {mode}")
        
        config = self.AI_CONFIGS[mode]
        system_prompt = config['system_prompt']
        if custom_instructions:
            system_prompt = f"{system_prompt}\n\nUSER CUSTOMIZATION:\n{custom_instructions}"
        
        try:
            stream = self._client.chat.completions.create(
                model=config['model'],
                messages=[
                    {'role': 'system', 'content': system_prompt},
                    *messages
                ],
                temperature=config['temperature'],
                max_tokens=config['max_tokens'],
                stream=True
            )
            
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            logger.error(f"Error generating AI response stream: {e}")
            yield "I apologize, but I encountered an error. Please try again."
    
    def explain_bible_verse(
        self,
        book: str,
        chapter: int,
        verses: List[int],
        selected_text: str,
        conversation_history: List[Dict[str, str]] = None,
        custom_instructions: Optional[str] = None
    ) -> str:
        """Generate explanation for a Bible verse"""
        messages = []
        
        if conversation_history:
            messages.extend(conversation_history)
        
        prompt = f"""Please explain the following Bible passage:
Book: {book}
Chapter: {chapter}
Verses: {', '.join(map(str, verses))}
Selected Text: "{selected_text}"

Provide:
1. Historical and theological context
2. What God was communicating in this passage
3. Relevant cross-references
4. Practical application for today"""
        
        messages.append({'role': 'user', 'content': prompt})
        
        return self.generate_response(messages, 'bibleStudy', custom_instructions)
    
    def provide_emotional_support(
        self,
        mood: str,
        situation: str,
        conversation_history: List[Dict[str, str]] = None,
        custom_instructions: Optional[str] = None
    ) -> str:
        """Provide emotional support with scriptures"""
        messages = []
        
        if conversation_history:
            messages.extend(conversation_history)
        
        prompt = f"""I'm feeling {mood}. Here's my situation:
"{situation}"

Please provide:
1. Empathetic understanding and comfort
2. Relevant scriptures that speak to this situation
3. Practical spiritual guidance
4. A prayer for this situation"""
        
        messages.append({'role': 'user', 'content': prompt})
        
        return self.generate_response(messages, 'emotionalSupport', custom_instructions)
    
    def guide_devotion(
        self,
        day_plan: str,
        conversation_history: List[Dict[str, str]] = None,
        custom_instructions: Optional[str] = None
    ) -> str:
        """Guide daily devotion"""
        messages = []
        
        if conversation_history:
            messages.extend(conversation_history)
        
        prompt = f"""Here's my plan for today:
"{day_plan}"

Please provide:
1. A personalized prayer for my day
2. Scripture reading relevant to my day
3. Reflection prompt for the day
4. Encouragement for spiritual growth"""
        
        messages.append({'role': 'user', 'content': prompt})
        
        return self.generate_response(messages, 'devotion', custom_instructions)

    def get_personalized_verse(self, user_moods: List[str] = None) -> Dict[str, str]:
        """Get a personalized verse and AI insight based on user's recent mood/activity"""
        # If we have user moods/activity, use AI to generate a personalized verse
        if user_moods and any(mood for mood in user_moods if mood):
            try:
                mood_context = ", ".join([m for m in user_moods if m])
                prompt = f"""Based on a user who has been dealing with: {mood_context}

Please suggest one Bible verse that would be particularly meaningful and comforting for them right now. 
Also provide a unique, compassionate reflection called "Aria Insight." This should be your own spiritual understanding of the verse and why it brings peace or strength in this specific context.

Respond with ONLY a JSON object in this exact format:
{{"verse": "[the verse text]", "reference": "[book chapter:verse]", "insight": "[your compassionate reflection]"}}

Choose from these themes or similar encouraging verses: peace, comfort, hope, strength, courage, healing, love, grace, faith, trust in God."""
                
                messages = [{'role': 'user', 'content': prompt}]
                
                response = self._client.chat.completions.create(
                    model='gpt-4',
                    messages=[
                        {'role': 'system', 'content': 'You are a compassionate spiritual companion. Always respond with valid JSON only.'},
                        *messages
                    ],
                    temperature=0.7,
                    max_tokens=250
                )
                
                content = response.choices[0].message.content
                if content:
                    import json
                    import re
                    # Try to extract JSON from response
                    json_match = re.search(r'\{.*\}', content, re.DOTALL)
                    if json_match:
                        verse_data = json.loads(json_match.group())
                        return verse_data
            except Exception as e:
                logger.error(f"Error generating personalized verse: {e}")
        
        # Fallback: return a verse based on time of day
        from datetime import datetime
        hour = datetime.now().hour
        
        if hour < 12:
            return {
                "verse": "This is the day the LORD has made; let us rejoice and be glad in it.", 
                "reference": "Psalm 118:24",
                "insight": "Every sunrise is a fresh invitation from God to find joy in His presence and the gift of a new day."
            }
        elif hour < 17:
            return {
                "verse": "But those who hope in the LORD will renew their strength. They will soar on wings like eagles.", 
                "reference": "Isaiah 40:31",
                "insight": "When your energy fades, remember that hope in Him isn't just a feeling—it's a supernatural power source."
            }
        else:
            return {
                "verse": "Peace I leave with you; my peace I give you. I do not give to you as the world gives.", 
                "reference": "John 14:27",
                "insight": "As you wind down, let His peace settle over your heart. It's a gift that remains even when the world is loud."
            }


# Singleton instance
ai_service = AIService()
