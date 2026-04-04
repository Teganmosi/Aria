from openai import OpenAI
from config import settings
from typing import List, Dict, Any, AsyncGenerator, Optional
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
        mode: str
    ) -> str:
        """Generate AI response for the given mode"""
        if mode not in self.AI_CONFIGS:
            raise ValueError(f"Invalid mode: {mode}")
        
        config = self.AI_CONFIGS[mode]
        
        try:
            response = self._client.chat.completions.create(
                model=config['model'],
                messages=[
                    {'role': 'system', 'content': config['system_prompt']},
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
        mode: str
    ) -> AsyncGenerator[str, None]:
        """Generate AI response as a stream"""
        if mode not in self.AI_CONFIGS:
            raise ValueError(f"Invalid mode: {mode}")
        
        config = self.AI_CONFIGS[mode]
        
        try:
            stream = self._client.chat.completions.create(
                model=config['model'],
                messages=[
                    {'role': 'system', 'content': config['system_prompt']},
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
        conversation_history: List[Dict[str, str]] = None
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
        
        return self.generate_response(messages, 'bibleStudy')
    
    def provide_emotional_support(
        self,
        mood: str,
        situation: str,
        conversation_history: List[Dict[str, str]] = None
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
        
        return self.generate_response(messages, 'emotionalSupport')
    
    def guide_devotion(
        self,
        day_plan: str,
        conversation_history: List[Dict[str, str]] = None
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
        
        return self.generate_response(messages, 'devotion')

    def get_personalized_verse(self, user_moods: List[str] = None) -> Dict[str, str]:
        """Get a personalized verse based on user's recent mood/activity"""
        # Default verses for different situations
        default_verses = [
            {"verse": "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.", "reference": "Jeremiah 29:11"},
            {"verse": "The LORD is my shepherd; I shall not want.", "reference": "Psalm 23:1"},
            {"verse": "Trust in the LORD with all your heart and lean not on your own understanding.", "reference": "Proverbs 3:5"},
            {"verse": "I can do all things through Christ who strengthens me.", "reference": "Philippians 4:13"},
            {"verse": "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.", "reference": "John 3:16"},
            {"verse": "Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go.", "reference": "Joshua 1:9"},
            {"verse": "Cast all your anxiety on him because he cares for you.", "reference": "1 Peter 5:7"},
            {"verse": "The LORD is close to the brokenhearted and saves those who are crushed in spirit.", "reference": "Psalm 34:18"},
            {"verse": "But those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, and they will walk and not be faint.", "reference": "Isaiah 40:31"},
            {"verse": "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.", "reference": "Philippians 4:6"},
        ]
        
        # If we have user moods/activity, use AI to generate a personalized verse
        if user_moods and any(mood for mood in user_moods if mood):
            try:
                mood_context = ", ".join([m for m in user_moods if m])
                prompt = f"""Based on a user who has been dealing with: {mood_context}

Please suggest one Bible verse that would be particularly meaningful and comforting for them right now.

Respond with ONLY a JSON object in this exact format:
{{"verse": "[the verse text]", "reference": "[book chapter:verse]"}}

Choose from these themes or similar encouraging verses: peace, comfort, hope, strength, courage, healing, love, grace, faith, trust in God."""
                
                messages = [{'role': 'user', 'content': prompt}]
                
                response = self._client.chat.completions.create(
                    model='gpt-4o',
                    messages=[
                        {'role': 'system', 'content': 'You are a Bible verse recommendation assistant. Always respond with valid JSON only.'},
                        *messages
                    ],
                    temperature=0.5,
                    max_tokens=200
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
            # Morning - encouraging verse
            return {"verse": "This is the day the LORD has made; let us rejoice and be glad in it.", "reference": "Psalm 118:24"}
        elif hour < 17:
            # Afternoon - strength verse
            return {"verse": "But those who hope in the LORD will renew their strength. They will soar on wings like eagles.", "reference": "Isaiah 40:31"}
        else:
            # Evening - peace verse
            return {"verse": "Peace I leave with you; my peace I give you. I do not give to you as the world gives.", "reference": "John 14:27"}


# Singleton instance
ai_service = AIService()
