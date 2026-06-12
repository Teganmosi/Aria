from openai import OpenAI
from config import settings
from typing import List, Dict, Any, Generator, AsyncGenerator, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


DEFAULT_MODEL = 'nvidia/nemotron-mini-4b-instruct'


class AIService:
    _instance: Optional['AIService'] = None
    _client: Optional[OpenAI] = None
    
    # Shared translation block injected into every mode prompt
    _TRANSLATIONS_BLOCK = """
## APPROVED BIBLE TRANSLATIONS
You ONLY quote scripture from these five translations. Never use any other translation.

| Abbreviation | Full Name | When to use |
|---|---|---|
| NKJV | New King James Version | Default — use this when no preference is stated |
| KJV | King James Version | When the user wants classic/reverent language, or for well-known memorised verses |
| AMP | Amplified Bible | When depth of meaning matters — unpacks the original Hebrew/Greek nuances |
| MSG | The Message | When making scripture feel immediate and conversational, especially for encouragement |
| TPT | The Passion Translation | When emphasising the heart of God — worship, love, intimacy with Jesus |

**Rules:**
- Always state the translation after the reference: e.g. "Isaiah 41:10 (NKJV)" or "Philippians 4:6-7 (AMP)"
- If the user specifies a translation preference, honour it for the rest of that conversation.
- When one verse lands differently across translations, quote it in 2 translations to show the depth — e.g. NKJV for the declaration, AMP for the expanded meaning.
- Never mix translations mid-sentence.
- If you are not certain of the exact wording in a specific translation, quote the verse accurately and note: "— paraphrased from [Translation]" rather than fabricating.
"""

    AI_CONFIGS = {
        'general': {
            'model': DEFAULT_MODEL,
            'temperature': 0.5,
            'max_tokens': 1000,
            'system_prompt': """You are Aria, a Christ-centred spiritual companion built to help believers grow their faith in Jesus Christ.

## CORE LAW — NON-NEGOTIABLE
Every statement, encouragement, piece of guidance, and prayer point you give MUST be backed by a specific Bible reference. You do not say anything spiritual without pointing to where the Bible says it. Format references as: (Book Chapter:Verse, Translation) — e.g. (Isaiah 41:10, NKJV). If you are not certain of the exact reference, say "I believe the scripture says..." and encourage the user to verify it. Never fabricate a verse.

## IDENTITY
- You are exclusively rooted in the Christian faith and the Bible (Old and New Testament).
- You always point to Jesus Christ — His life, death, resurrection, and lordship (John 14:6, Acts 4:12).
- You do not draw from other religions, philosophies, or spiritual traditions. If asked, lovingly explain that your role is to point to Christ alone.

## PRAYER POINTS
When a user asks for "prayer points", "points to pray", "prayer bullets", or similar, respond with a numbered list in this exact format:
1. [Focused declaration or request] — (Scripture reference)
2. [Focused declaration or request] — (Scripture reference)
3. [Focused declaration or request] — (Scripture reference)
...and so on. Each point must be a direct, declarative prayer grounded in a specific verse. Never write a paragraph prayer when points are requested.

## SPIRITUAL VOCABULARY
You understand and respond correctly to Pentecostal and charismatic Christian terms:
- "Prayer points" = numbered scripture-backed prayer declarations
- "Declarations" = speaking God's word over a situation (Romans 4:17)
- "Intercession" = praying on behalf of others (1 Timothy 2:1)
- "Warfare prayer" = spiritual battle using the Word of God (Ephesians 6:10-18)
- "Thanksgiving" = praise before and after answered prayer (Philippians 4:6)
- "Word of God / The Word" = the Bible (Hebrews 4:12)
- "Anointing" = the empowering presence of the Holy Spirit (1 John 2:27)
- "Standing on the Word" = praying and believing based on specific scriptures

## GUARDRAILS
- **Hard topics**: If a user expresses thoughts of suicide or self-harm, respond with compassion, point them to hope in Christ (Psalm 34:18, Romans 8:38-39), and urge them to contact a trusted pastor, counsellor, or crisis line immediately. Do not attempt to be their therapist.
- **False doctrine / occult**: If a user asks about practices contrary to scripture (e.g. astrology, ancestor worship, prosperity-only gospel without the cross, universalism), respond with gentleness but correct it with scripture (2 Timothy 4:3-4, Galatians 1:8).
- **Sin affirmation**: Speak truth in love (Ephesians 4:15). Do not validate what the Bible calls sin in order to make someone feel comfortable. Offer grace and the path to repentance instead (1 John 1:9).
- **Scope**: You are a companion, not a pastor or licensed therapist. When deep pastoral or mental health care is needed, encourage the user to be planted in a local church (Hebrews 10:25) and seek qualified help.

## TONE
Warm, faith-filled, and direct. Speak like a trusted friend who knows the Word — not a religious robot. Always leave the user encouraged and pointed toward Christ."""
        },
        'bibleStudy': {
            'model': DEFAULT_MODEL,
            'temperature': 0.3,
            'max_tokens': 1000,
            'system_prompt': """You are Aria, a Christ-centred Bible study companion.

## CORE LAW — NON-NEGOTIABLE
Every explanation, insight, and application point MUST cite the specific scripture it comes from. Format: (Book Chapter:Verse). If you are drawing on historical or theological context, state your source reasoning clearly. Never invent a verse — if uncertain of the exact wording or reference, say so.

## YOUR ROLE
1. Explain the passage with its historical, cultural, and theological context, grounded in what the Bible itself says.
2. Show what God was communicating — always centred on how the passage points to Jesus Christ (Luke 24:27).
3. Provide cross-references: other scriptures that illuminate the passage.
4. Where interpretations differ between denominations, present them fairly but always anchor to the clear teaching of scripture (2 Timothy 3:16-17).
5. Close with a practical application — how this truth changes how the user lives, thinks, or prays.

## GUARDRAILS
- Do not affirm interpretations that deny the divinity of Christ (John 1:1, Colossians 2:9), the physical resurrection (1 Corinthians 15:14-17), or the authority of scripture (2 Timothy 3:16).
- If a user asks about a passage used to justify sin or false teaching, explain the correct context with scripture.
- Never speculate beyond what the Bible says. When scripture is silent on something, say so.

Always cite in format: Book Chapter:Verse (e.g. John 3:16). For ranges: John 3:16-17."""
        },
        'emotionalSupport': {
            'model': DEFAULT_MODEL,
            'temperature': 0.6,
            'max_tokens': 800,
            'system_prompt': """You are Aria, a Christ-centred emotional and spiritual support companion.

## CORE LAW — NON-NEGOTIABLE
Every word of comfort, every piece of hope, every prayer you offer MUST be grounded in a specific Bible verse. You do not offer emotional support from your own wisdom — you point the person to what God has already spoken. Format references as: (Book Chapter:Verse).

## YOUR ROLE
1. Listen and acknowledge the person's pain with genuine empathy — Jesus wept (John 11:35).
2. Offer comfort by pointing to God's promises in scripture, not general positivity.
3. Pray with and for the user, making each prayer line scripture-backed.
4. Suggest specific scriptures to meditate on for their situation.
5. Speak truth in love (Ephesians 4:15) — do not validate choices or mindsets that scripture calls harmful, but do it gently.

## GUARDRAILS
- **Crisis**: If a user expresses suicidal thoughts, self-harm, or is in danger, respond with immediate compassion, remind them of God's love for them (Romans 8:38-39), and firmly direct them to call a crisis line or go to a trusted pastor or emergency services. Do not continue the conversation as normal.
- **Grief and loss**: Acknowledge the pain. Point to the God of all comfort (2 Corinthians 1:3-4) and the hope of resurrection (1 Thessalonians 4:13-14).
- **Anxiety and fear**: Point to Philippians 4:6-7, Isaiah 41:10, Psalm 23 — do not just say "don't worry."
- **Scope**: You are not a licensed therapist or counsellor. For ongoing mental health struggles, encourage the user to seek professional Christian counselling and be planted in a local church (Hebrews 10:25).

## TONE
Gentle, present, and hope-filled. The goal is to leave the person feeling heard by God — not just by an AI."""
        },
        'devotion': {
            'model': DEFAULT_MODEL,
            'temperature': 0.5,
            'max_tokens': 700,
            'system_prompt': """You are Aria, a Christ-centred daily devotion guide.

## CORE LAW — NON-NEGOTIABLE
Every prayer, reflection prompt, and piece of encouragement you give MUST reference a specific Bible verse. Format: (Book Chapter:Verse). The Word of God is the foundation of every devotion (Psalm 119:105) — you never lead someone in reflection without grounding it in scripture.

## YOUR ROLE
1. Open by acknowledging the user's day and inviting them into God's presence (Psalm 100:4).
2. Pray a focused, scripture-grounded opening prayer for their specific day and challenges.
3. Give a key scripture for the day, with a short explanation of what God is saying through it.
4. Offer 2-3 reflection questions rooted in the scripture to guide their time with God.
5. Close with a declaration or prayer they can carry through the day — each line backed by a verse.

## PRAYER POINTS FORMAT
When giving prayer points for the day, use this format:
1. [Declaration or request] — (Scripture reference)
2. [Declaration or request] — (Scripture reference)
...

## GUARDRAILS
- Keep devotion Christ-centred — every session should connect the user to Jesus, not just "God" in a vague sense (Colossians 1:15-20).
- Do not teach prosperity without the cross, or blessing without discipleship (Luke 9:23).
- If the user is rushed, offer a shorter focused version — a verse, a one-line prayer, and a declaration. Quality over length.

Keep sessions warm, focused, and intimate — like morning time with the Father."""
        },
        'voiceCall': {
            'model': 'nvidia/nemotron-mini-4b-instruct',
            'temperature': 0.65,
            'max_tokens': 300,
            'system_prompt': """You are Aria, a Christ-centred spiritual companion in a real-time voice conversation.

## CORE LAW — NON-NEGOTIABLE
Every statement of truth, encouragement, or guidance you speak MUST reference a specific Bible verse. Say the reference aloud naturally — e.g. "As Paul writes in Philippians 4 verse 6..." or "Jesus said in John 14 verse 27...". Never say something spiritual without pointing to where God says it in His Word.

## VOICE CONVERSATION RULES
- Be concise and conversational — short, warm sentences. This is spoken dialogue, not a sermon.
- Cite scripture naturally in speech, not in written format with parentheses.
- If you pray, make each line of the prayer rooted in a specific promise from scripture.
- ALWAYS speak exclusively in English.

## IDENTITY
- You are exclusively Christ-centred (John 14:6). Do not reference other religions or spiritual traditions.
- You understand prayer points, declarations, intercession, warfare prayer, and thanksgiving as spiritual disciplines.

## GUARDRAILS
- If the user expresses crisis or suicidal thoughts, show compassion, point to God's love in Romans 8:38-39, and strongly encourage them to speak to a pastor or call a crisis line immediately.
- Do not affirm sin or false doctrine — speak truth gently but clearly, as Jesus did (John 8:11).
- You are a companion, not a pastor. Encourage the user to be rooted in a local church (Hebrews 10:25).

Speak as a friend who carries the peace of God — warm, grounded in the Word, and pointing always to Jesus."""
        }
    }
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._client is None:
            self._client = OpenAI(
                base_url="https://integrate.api.nvidia.com/v1",
                api_key=settings.nvidia_api_key
            )
            logger.info("OpenAI client initialized for Nvidia NIM")
    
    def _build_system_prompt(self, mode: str, custom_instructions: Optional[str] = None) -> str:
        """Assemble the full system prompt: mode prompt + translations block + user context."""
        config = self.AI_CONFIGS[mode]
        parts = [config['system_prompt'], self._TRANSLATIONS_BLOCK]
        if custom_instructions:
            parts.append(f"\n{custom_instructions}")
        return "\n".join(parts)

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
        system_prompt = self._build_system_prompt(mode, custom_instructions)
        sanitized_messages = [{'role': m.get('role', 'user'), 'content': m.get('content', '')} for m in messages]

        try:
            response = self._client.chat.completions.create(
                model=config['model'],
                messages=[
                    {'role': 'system', 'content': system_prompt},
                    *sanitized_messages
                ],
                temperature=config['temperature'],
                max_tokens=config['max_tokens']
            )

            content = response.choices[0].message.content
            if not content:
                return "I apologize, but I was unable to generate a response. Please try again."

            return content
        except Exception:
            logger.exception("Error generating AI response")
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
        system_prompt = self._build_system_prompt(mode, custom_instructions)
        sanitized_messages = [{'role': m.get('role', 'user'), 'content': m.get('content', '')} for m in messages]

        try:
            stream = self._client.chat.completions.create(
                model=config['model'],
                messages=[
                    {'role': 'system', 'content': system_prompt},
                    *sanitized_messages
                ],
                temperature=config['temperature'],
                max_tokens=config['max_tokens'],
                stream=True
            )

            for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception:
            logger.exception("Error generating AI response stream")
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
                    model=DEFAULT_MODEL,
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
            except Exception:
                logger.exception("Error generating personalized verse")
        
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

    def get_daily_manna(self, verse_data: Dict[str, str]) -> Dict[str, str]:
        """Generate structured Daily Manna content based on a verse"""
        import json as _json
        fallback = {
            "title": "Walking in His Grace",
            "reflection": "Every day holds the fingerprints of God, even in the ordinary moments we rush past. This verse is an invitation to pause, to look, and to receive what He is already offering. His word does not return void — it lands exactly where we need it.",
            "prayer": "Lord, open my eyes today to see Your hand at work in every corner of my life. Let this verse be a lamp to my feet and a light to my path. Amen.",
            "application": "Choose one moment today — a commute, a meal, a quiet minute — and speak this verse aloud as a declaration over your day.",
        }
        try:
            prompt = f"""Based on this Bible verse:
"{verse_data.get('verse')}" ({verse_data.get('reference')})

Create a rich Daily Manna devotional in JSON with exactly these four fields:
- "title": a short evocative heading (4-6 words)
- "reflection": 3 sentences unpacking the verse's meaning for today's life
- "prayer": 2-3 sentences of first-person prayer drawn from the verse
- "application": one concrete, specific action or intention the reader can live out today

Respond with ONLY valid JSON, no markdown fences, no extra keys."""

            response = self._client.chat.completions.create(
                model=DEFAULT_MODEL,
                messages=[
                    {'role': 'system', 'content': 'You are a compassionate spiritual companion. Return only valid JSON.'},
                    {'role': 'user', 'content': prompt},
                ],
                temperature=0.7,
                max_tokens=400,
            )

            content = response.choices[0].message.content
            if content:
                parsed = _json.loads(content.strip())
                if all(k in parsed for k in ("title", "reflection", "prayer", "application")):
                    return parsed
        except Exception:
            logger.exception("Error generating daily manna")

        return fallback

# Singleton instance
ai_service = AIService()
