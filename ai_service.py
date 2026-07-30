from openai import OpenAI
from config import settings
from typing import List, Dict, Any, Generator, AsyncGenerator, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


DEFAULT_MODEL = 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning'


def _run_async_in_thread(coro):
    import asyncio
    import threading
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        result = [None]
        exception = [None]
        
        def run_in_thread():
            try:
                new_loop = asyncio.new_event_loop()
                asyncio.set_event_loop(new_loop)
                result[0] = new_loop.run_until_complete(coro)
                new_loop.close()
            except Exception as e:
                exception[0] = e

        t = threading.Thread(target=run_in_thread)
        t.start()
        t.join()
        
        if exception[0]:
            raise exception[0]
        return result[0]
    else:
        return asyncio.run(coro)


class AIService:
    _instance: Optional['AIService'] = None
    _client: Optional[OpenAI] = None

    _MEMORY_SEARCH_TOOL = {
        "type": "function",
        "function": {
            "name": "search_past_conversations_and_journals",
            "description": "Searches the user's past notes, journal entries, Bible study logs, and support sessions to retrieve memories, struggles, and scriptures.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search term or query to find in past notes or messages."
                    }
                },
                "required": ["query"]
            }
        }
    }

    _BIBLE_FETCH_TOOL = {
        "type": "function",
        "function": {
            "name": "fetch_scripture",
            "description": "Retrieves the exact, verified wording of specific Bible verses from the database or external API. Use this whenever you want to quote or reference a scripture.",
            "parameters": {
                "type": "object",
                "properties": {
                    "book": {
                        "type": "string",
                        "description": "The name of the Bible book (e.g. 'John', 'Romans', 'Genesis')."
                    },
                    "chapter": {
                        "type": "integer",
                        "description": "The chapter number."
                    },
                    "verses": {
                        "type": "array",
                        "items": {
                            "type": "integer"
                        },
                        "description": "List of verse numbers to retrieve (e.g. [16] or [1, 2, 3])."
                    },
                    "version": {
                        "type": "string",
                        "description": "The Bible version/translation (approved list: NKJV, KJV, AMP, MSG, TPT). Defaults to NKJV."
                    }
                },
                "required": ["book", "chapter", "verses"]
            }
        }
    }
    
    # Shared translation block injected into every mode prompt
    _TRANSLATIONS_BLOCK = """
## APPROVED BIBLE TRANSLATIONS & SCRIPTURE RELIABILITY
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

## SCRIPTURE RELIABILITY RULE (CRITICAL)
Whenever you quote or reference a scripture, you MUST call the `fetch_scripture(book, chapter, verses, version)` tool to retrieve the exact wording from the database or external API.
Do NOT guess, fabricate, or generate Bible verses from your own memory. Always call the tool first, and then quote the exact returned text.
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
            if settings.nvidia_api_key and settings.nvidia_api_key != "your_nvidia_api_key_here":
                self._client = OpenAI(
                    base_url="https://integrate.api.nvidia.com/v1",
                    api_key=settings.nvidia_api_key
                )
                self.model_name = DEFAULT_MODEL
                logger.info(f"OpenAI client initialized for Nvidia NIM (model: {self.model_name})")
            elif settings.openai_api_key and settings.openai_api_key != "your_openai_api_key_here":
                self._client = OpenAI(
                    api_key=settings.openai_api_key
                )
                self.model_name = "gpt-4o-mini"
                # Update AI_CONFIGS to use standard OpenAI model
                for mode in self.AI_CONFIGS:
                    self.AI_CONFIGS[mode]['model'] = "gpt-4o-mini"
                logger.info("OpenAI client initialized for standard OpenAI (model: gpt-4o-mini)")
            else:
                # No usable provider — do NOT create a client with an empty key: every call
                # would fail with a confusing 401 from Nvidia. Generation methods guard on None.
                self._client = None
                self.model_name = DEFAULT_MODEL
                logger.error(
                    "No AI provider configured — set NVIDIA_API_KEY or OPENAI_API_KEY. "
                    "AI features will return errors until a key is present."
                )
    
    def _build_system_prompt(self, mode: str, custom_instructions: Optional[str] = None) -> str:
        """Assemble the full system prompt: mode prompt + translations block + user context."""
        config = self.AI_CONFIGS[mode]
        parts = [config['system_prompt'], self._TRANSLATIONS_BLOCK]
        if custom_instructions:
            parts.append(f"\n{custom_instructions}")
        return "\n".join(parts)

    def _execute_memory_search_tool(self, user_id: str, arguments_str: str) -> str:
        """Executes the past conversations and journals search tool."""
        try:
            import json
            args = json.loads(arguments_str)
            query = args.get("query", "")
            
            from database import db
            search_results = db.search_user_memory(user_id, query)
            
            formatted_results = []
            for idx, r in enumerate(search_results):
                formatted_results.append(
                    f"[{idx+1}] Source: {r['source']}\nDate: {r['created_at']}\nTitle: {r['title']}\nContent: {r['content']}\n"
                )
            
            return "\n".join(formatted_results) if formatted_results else "No relevant past notes or conversations found."
        except Exception as e:
            logger.exception("Error executing memory search tool")
            return f"Error searching past conversations: {e}"

    def _execute_fetch_scripture_tool(self, arguments_str: str) -> str:
        """Executes the fetch scripture tool."""
        try:
            import json
            args = json.loads(arguments_str)
            book = args.get("book", "")
            chapter = int(args.get("chapter", 1))
            verses = args.get("verses", [])
            version = args.get("version", "NKJV").upper()
            
            from database import db
            chapter_verses = _run_async_in_thread(db.fetch_bible_chapter_from_api(book, chapter, version))
            
            matching_verses = []
            for v in chapter_verses:
                if v.get("verse") in verses:
                    matching_verses.append(v)
                    
            if matching_verses:
                matching_verses.sort(key=lambda x: x.get("verse", 0))
                formatted_text = " ".join([f"{v.get('verse')} {v.get('text')}" for v in matching_verses])
                return f"{book} {chapter}:{','.join(map(str, verses))} ({version}) - {formatted_text}"
            else:
                return f"Scripture not found for {book} {chapter}:{','.join(map(str, verses))} ({version}). Please check reference."
        except Exception as e:
            logger.exception("Error executing fetch scripture tool")
            return f"Error fetching scripture: {e}"

    def _execute_tool(self, tool_name: str, arguments_str: str, user_id: Optional[str] = None) -> str:
        """Dispatches and executes the requested tool."""
        if tool_name == "search_past_conversations_and_journals" and user_id:
            return self._execute_memory_search_tool(user_id, arguments_str)
        elif tool_name == "fetch_scripture":
            return self._execute_fetch_scripture_tool(arguments_str)
        return f"Unknown tool: {tool_name}"

    def _update_reconstructed_tool_call(self, tool_calls_dict: Dict[int, Dict[str, Any]], tc: Any):
        idx = tc.index
        if idx not in tool_calls_dict:
            tool_calls_dict[idx] = {"id": "", "name": "", "arguments": ""}
            
        entry = tool_calls_dict[idx]
        if tc.id:
            entry["id"] = tc.id
            
        if tc.function:
            if tc.function.name:
                entry["name"] += tc.function.name
            if tc.function.arguments:
                entry["arguments"] += tc.function.arguments

    def _reconstruct_tool_calls(self, tool_call_chunks: List[Any]) -> List[Dict[str, Any]]:
        """Reconstructs full tool call objects from stream chunks."""
        tool_calls_dict = {}
        for tc_list in tool_call_chunks:
            for tc in tc_list:
                self._update_reconstructed_tool_call(tool_calls_dict, tc)
                            
        tc_objects = []
        for idx, tc in sorted(tool_calls_dict.items()):
            tc_objects.append({
                "id": tc["id"],
                "type": "function",
                "function": {
                    "name": tc["name"],
                    "arguments": tc["arguments"]
                }
            })
        return tc_objects

    def generate_response(
        self,
        messages: List[Dict[str, str]],
        mode: str,
        custom_instructions: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> str:
        """Generate AI response for the given mode, supporting memory search and Bible tools."""
        if mode not in self.AI_CONFIGS:
            raise ValueError(f"Invalid mode: {mode}")
        if self._client is None:
            raise RuntimeError(
                "AI provider is not configured. Set NVIDIA_API_KEY or OPENAI_API_KEY in the environment."
            )

        config = self.AI_CONFIGS[mode]
        system_prompt = self._build_system_prompt(mode, custom_instructions)
        sanitized_messages = [{'role': m.get('role', 'user'), 'content': m.get('content', '')} for m in messages]

        tools = [self._MEMORY_SEARCH_TOOL, self._BIBLE_FETCH_TOOL]

        enable_tools = bool(user_id and config['model'] != "nvidia/nemotron-mini-4b-instruct")

        try:
            kwargs = {
                "model": config['model'],
                "messages": [
                    {'role': 'system', 'content': system_prompt},
                    *sanitized_messages
                ],
                "temperature": config['temperature'],
                "max_tokens": config['max_tokens']
            }
            if enable_tools:
                kwargs["tools"] = tools
                kwargs["tool_choice"] = "auto"

            response = self._client.chat.completions.create(**kwargs)

            message = response.choices[0].message
            tool_calls = getattr(message, "tool_calls", None)

            if tool_calls and user_id:
                local_messages = [
                    {'role': 'system', 'content': system_prompt},
                    *sanitized_messages
                ]
                local_messages.append(message)

                for tool_call in tool_calls:
                    result_str = self._execute_tool(
                        tool_call.function.name,
                        tool_call.function.arguments,
                        user_id
                    )
                    local_messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "name": tool_call.function.name,
                        "content": result_str
                    })

                response = self._client.chat.completions.create(
                    model=config['model'],
                    messages=local_messages,
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

    def _execute_stream_tool_calls(
        self,
        config: Dict[str, Any],
        system_prompt: str,
        sanitized_messages: List[Dict[str, str]],
        tool_call_chunks: List[Any],
        user_id: str
    ) -> Generator[str, None, None]:
        tc_objects = self._reconstruct_tool_calls(tool_call_chunks)
        
        local_messages = [
            {'role': 'system', 'content': system_prompt},
            *sanitized_messages
        ]
        
        local_messages.append({
            "role": "assistant",
            "content": None,
            "tool_calls": tc_objects
        })
        
        for tc in tc_objects:
            tool_name = tc["function"]["name"]
            arguments_str = tc["function"]["arguments"]
            result_str = self._execute_tool(tool_name, arguments_str, user_id)
            
            local_messages.append({
                "role": "tool",
                "tool_call_id": tc["id"],
                "name": tool_name,
                "content": result_str
            })
        
        second_stream = self._client.chat.completions.create(
            model=config['model'],
            messages=local_messages,
            temperature=config['temperature'],
            max_tokens=config['max_tokens'],
            stream=True
        )
        for chunk in second_stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    def generate_response_stream(
        self,
        messages: List[Dict[str, str]],
        mode: str,
        custom_instructions: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> Generator[str, None, None]:
        """Generate AI response as a stream, supporting memory search and Bible tools."""
        if mode not in self.AI_CONFIGS:
            raise ValueError(f"Invalid mode: {mode}")
        if self._client is None:
            raise RuntimeError(
                "AI provider is not configured. Set NVIDIA_API_KEY or OPENAI_API_KEY in the environment."
            )

        config = self.AI_CONFIGS[mode]
        system_prompt = self._build_system_prompt(mode, custom_instructions)
        sanitized_messages = [{'role': m.get('role', 'user'), 'content': m.get('content', '')} for m in messages]

        tools = [self._MEMORY_SEARCH_TOOL, self._BIBLE_FETCH_TOOL]

        enable_tools = bool(user_id and config['model'] != "nvidia/nemotron-mini-4b-instruct")

        try:
            kwargs = {
                "model": config['model'],
                "messages": [
                    {'role': 'system', 'content': system_prompt},
                    *sanitized_messages
                ],
                "temperature": config['temperature'],
                "max_tokens": config['max_tokens'],
                "stream": True
            }
            if enable_tools:
                kwargs["tools"] = tools
                kwargs["tool_choice"] = "auto"

            stream = self._client.chat.completions.create(**kwargs)

            tool_call_chunks = []
            is_tool_call = False
            
            for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.tool_calls:
                    is_tool_call = True
                    tool_call_chunks.append(chunk.choices[0].delta.tool_calls)
                elif chunk.choices and chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content

            if is_tool_call and user_id:
                yield from self._execute_stream_tool_calls(
                    config, system_prompt, sanitized_messages, tool_call_chunks, user_id
                )
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
                    model=self.model_name,
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
                model=self.model_name,
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

    def synthesize_journey(self, messages: List[Dict[str, str]], session_type: str) -> str:
        """Synthesize a summary of a Bible study or emotional support session."""
        if not messages:
            return ""
        
        # Compile session history
        history_text = "\n".join([f"{m.get('role', 'user')}: {m.get('content', '')}" for m in messages])
        
        prompt = f"""You are a spiritual administrative assistant. Summarize the following {session_type} session between the user and Aria (the AI spiritual companion).
Extract:
1. Core topics or struggles discussed (spiritual or emotional).
2. Key scriptures referenced.
3. Specific prayer points or areas of support needed.

Keep the summary concise, encouraging, and structured (2-3 bullet points). Focus on the USER's profile, struggles, and needs so Aria can remember them.

Session dialogue:
{history_text}

Summary:"""

        try:
            # Call using the small model
            response = self._client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that summarizes conversations to build a spiritual journey profile."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=300
            )
            if response.choices and response.choices[0].message.content:
                return response.choices[0].message.content.strip()
            return ""
        except Exception:
            logger.exception("Error in journey synthesis")
            return ""

    def generate_proactive_devotion(
        self,
        unanswered_prayers: List[str],
        recent_moods: List[str],
        first_name: str
    ) -> Dict[str, Any]:
        """Generate a proactive daily devotion customized to unanswered prayers and recent struggles/moods."""
        prayers_context = "; ".join(unanswered_prayers) if unanswered_prayers else "None"
        moods_context = "; ".join(recent_moods) if recent_moods else "None"
        
        prompt = f"""You are Aria, a Christ-centred spiritual companion. 
The user, {first_name}, has the following active/unanswered prayers:
"{prayers_context}"

And has recently shared these emotional concerns or moods:
"{moods_context}"

Please generate a highly personalized Morning Daily Devotion for {first_name}. 
It must address their current emotional struggles and unanswered prayers with deep empathy, pointing them to Christ.

Respond with ONLY a JSON object containing:
- "verse": A Bible verse (exactly quoted) that directly addresses their current struggle.
- "reference": The book, chapter, and verse reference.
- "insight": A short "Aria Insight" (1-2 sentences) on how this verse speaks to their current concerns.
- "daily_manna": A structured object containing:
  - "title": Evocative title (4-6 words)
  - "reflection": 3 sentences unpacking the verse for their situation
  - "prayer": 2-3 sentences of first-person prayer drawn from their struggle and this verse
  - "application": one concrete action or intention they can live out today

Ensure the response is valid JSON, no markdown formatting fences, and no extra keys."""

        try:
            response = self._client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {'role': 'system', 'content': 'You are a compassionate spiritual companion. Always respond with valid JSON only.'},
                    {'role': 'user', 'content': prompt}
                ],
                temperature=0.7,
                max_tokens=600
            )
            content = response.choices[0].message.content
            if content:
                import json
                import re
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    devotion_data = json.loads(json_match.group())
                    return devotion_data
        except Exception:
            logger.exception("Error generating proactive devotion")
            
        return {
            "verse": "Cast all your anxiety on him because he cares for you.",
            "reference": "1 Peter 5:7",
            "insight": "The Lord cares deeply for every weight you carry. You do not have to carry it alone today.",
            "daily_manna": {
                "title": "Casting Your Care",
                "reflection": "Anxiety tries to convince us that we are the sole protectors of our lives. God invites us to surrender that control to Him. In every moment, His love is steadfast.",
                "prayer": "Father, I lay down the worries about my day and my unresolved prayers at Your feet. I trust Your care. Amen.",
                "application": "Whenever anxiety rises today, whisper: 'I cast this care on You, Lord.'"
            }
        }


# Singleton instance
ai_service = AIService()

