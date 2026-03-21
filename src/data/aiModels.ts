export type ModelTier = 'legendary' | 'epic' | 'rare' | 'common';
export type ModelCategory = 'language' | 'image' | 'video' | 'audio' | 'code' | 'multimodal' | 'science' | 'embedding' | 'agent' | 'other';

export interface AIModel {
  id: string;
  name: string;
  company: string;
  category: ModelCategory;
  tier: ModelTier;
  description: string;
  params?: string;
  icon: string;
}

// Real logo URLs for every company
export const COMPANY_LOGOS: Record<string, string> = {
  'OpenAI': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSl4ME17pNVHlQNwiw3IrqL6f-4tE2X05UjUw&s',
  'Anthropic': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpFdyVpVeiHpaCdE4FL2M9YJZRPU-wbWgqRQ&s',
  'Google': 'https://www.dztecs.com/ai/wp-content/uploads/sites/2/2025/09/gHfBJ6FBHKnLbW36hEDvgV.png',
  'Google DeepMind': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Google_DeepMind_logo.svg/200px-Google_DeepMind_logo.svg.png',
  'Meta': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/200px-Meta_Platforms_Inc._logo.svg.png',
  'Microsoft': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/200px-Microsoft_logo.svg.png',
  'Mistral AI': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRq-bk1R5IhGGhExJfEOknBp6ZFOKLoh6gC8A&s',
  'xAI': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSe0g4cAGbLf3PoN7sdJWe-VNxDiTPbyo0j8w&s',
  'NVIDIA': 'https://upload.wikimedia.org/wikipedia/sco/thumb/2/21/Nvidia_logo.svg/200px-Nvidia_logo.svg.png',
  'DeepSeek': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ09ekt850mXs23iTiP82moDbKzJdECTnmv-g&s',
  'Stability AI': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJgjMy89A8K_g1h94VR-B3fYFAIHKJAaA7Cg&s',
  'Midjourney': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFEP_5yrPf9eDsOBpMjfHqs1q4SlekuNbV_Q&s',
  'Cohere': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTU-uyI0TW4J_f4xaVJ6RK_ba9O-b-KU8bzhA&s',
  'AI21 Labs': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdmA8FCROA7CPXqr-GwZb6f-RbTfHNEa5nrQ&s',
  'Hugging Face': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJ2MwMPerouoqRBhiRnGP2NwsDJB-e9ayVrA&s',
  'Baidu': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQs0q4_1vW_1E0V_YQZoUvwW8PEwfyA2f3xEQ&s',
  'Alibaba': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZHYRPcRceA_tvxlyrY9P6xAvPyj0ufyOT0g&s',
  'Tencent': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvz7WyAhxP8KM-rCVB4xpA_EhvDwqpX6F8Fg&s',
  'Apple': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXR3RFfnil8xrHTcw47kUP6mU-kJxhTPaGYw&s',
  'Amazon': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRY5IVj1EM8FdMPVX0h3LJ4Hs8uH3LKFY6xmA&s',
  'Samsung': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1t8UBVsO6X-JDVmRfGPwQfeHkqCR7zGPfVw&s',
  'Adobe': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRv4X-nwZn0aoZf-joK7b-dJMSwHnFKL-pv-g&s',
  'Runway': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQEG0zJGKSD4E23WyG7w7X__XL_m7Q9qBhQQ&s',
  'ElevenLabs': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQi8OWFxCV6sFCIlaJblFq8Vz2MUcqH6X5iOw&s',
  'Inflection': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjVUlRKIWPZz2PJkNPSy4gVBwB1TfQ5A0D7w&s',
  'Character.ai': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6z4bbTNr7RCaGtNzc4LxgXxrDkPOTN5jlVg&s',
  'Perplexity': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTG_CUI0sdO5fNBOTUqHC3VhqRr1r3hb0bO9g&s',
  'Zhipu AI': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNFu7fqb3e1S2FPoQWCh6rk3h49EKkFeJFxQ&s',
  '01.AI': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQczjbRbFfnVfyrFbVKFnGvfiwOEhKrXzI42A&s',
  'Reka AI': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQv6YPYhKDL4FKQ4JzPAG8jrBSCsHPq6dFDKg&s',
  'Writer': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ24Xng9dY3kGTh-0sGHKPxH6dYdBLNl5XMZQ&s',
  'Databricks': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJ_EqCzHj6y_KJTHrPrD0MTH5g0j9V2sD2Wg&s',
  'Salesforce': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTb36mg3c7LT_KXJcKhRjE8E_z3t7v9q-H9RA&s',
  'IBM': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrsGQJkF7XLMwpI4EiO9BPoHfCuZKQy7Y2Nw&s',
  'TII': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-aXbnK4MKxAn-8E5VNkAd3PQxQ2WKZX4Qxg&s',
  'EleutherAI': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGfN5QvN3_mCeIVBh5I6bfN56ICe0ykj0AAQ&s',
  'Allen AI': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLEXxY8XqAJcfxwp8a5K6Y7b-O0g0YsKaHiQ&s',
  'Black Forest Labs': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8TMQH7mpPR1G2b3qMFrYT_tnJWJoW2K4xKQ&s',
  'Cerebras': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJWP34kP_pOBGc-J_QPhJ-UbZ4aXN8WqkQaw&s',
  'Snowflake': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKZP_YMiP0HRsB3LnKz6EXlNOqX_tIEnA_4A&s',
  'Together AI': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTp2R6U2e1rZPnS-sLJi7YCILaD3FD2l2RkdQ&s',
  'Groq': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVpQ5QHQH0K0y7NMTpKuLSp3X8JJC-TlKj_Q&s',
  'Pika Labs': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4aSv6rQ_U0dA2p-2OjYcf2nFxqC2X_VYxEQ&s',
  'Luma AI': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGsUxYEE7DxF-OPdkVKpCkjSYUoX2PNiN5xQ&s',
  'Suno': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2N_TLzw6NXzTSJKAH_L2aE2P5c3GjxsHrjw&s',
  'Udio': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEbGZE0HBKbQVmqIp5u9fhKEexd9gIq2xJqw&s',
  'Minimax': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjb0PFrKd-8RU5YNhWKwCHJiVF9PXEX_jkKg&s',
  'Moonshot AI': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRf7kLa-Y2t-bCYJfWUU_K6q3TbQcLTHVYkbQ&s',
  'ByteDance': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_WFET1u7p_p6Pv4Py3BbbJb9HVr1A8PYROQ&s',
  'Ideogram': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiX8YjMWs_3kW2sBBE-t3LM1Q4WlXc9qKuIw&s',
  'Kling AI': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6_j8MNHP0BxF3HvB0F5dQB4P-_OaGVwHm4Q&s',
  'Adept AI': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJzKI_cKJQ9Y4C_w8x5D7oE8kFw2VhWnHxXg&s',
  'Scale AI': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0KlY6lW7nKmtBN8S0fhRpf8Y4pXL2bPRqMQ&s',
  'AssemblyAI': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQW2O5hLXZVReSCMJqvqyD7SHqXzrV0wRPjfQ&s',
  'Deepgram': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_j4gJKx5R_dKvp0sNH6lF7j_q2Y7hX9vCFQ&s',
  'Aleph Alpha': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnlM2P7H8oGc-cNbM5JfXDXF3aJqGtbL5xqQ&s',
  'Synthesia': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2OEe5nq0BEpZbWXjr5F-mXw7iRdgp3RRJUA&s',
  'Lightning AI': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHLqz0L_g6g_bKwD5bJ2bJFR-dDjqHCW7dNg&s',
  'Haiper': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXyYqsxFBGcN7P8wM0MH7qV_6PV2aR_mXpMw&s',
  'Voyage AI': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTE1SLtCxNFhc1KcT2D-Y2_gy47tLY7J8g7Ww&s',
  'Mosaic ML': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnq8NPJI9_Kq-j85wBFkJFwNQ-g8WkACy8Yg&s',
  'D-ID': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5-QTY_e8_v3H5M0Uqf4mHqR3GFJ2qYc8FnQ&s',
  'Inworld AI': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_kLqF8Q5L7DZLqYrN_lA7bQjHGcXN0zJm0Q&s',
  'Twelve Labs': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8_F_y8-iDhc7RXq-gVz5G_pVpRKd2z2Pv0Q&s',
  'Jasper': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyU_D1d-RLX_3QPnK_k2RQ_TYgPPHbA6VPLQ&s',
  'Replika': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9ysRLP3Bh2E-3VKq0lKMN_1vN4aX_Z73ePg&s',
  'Colossal AI': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMzBLZ-aSb0QJGL9WEjnZ8N2R0PYPq3v2fWA&s',
};

// Fallback SVG for companies without a found image
export function getCompanyLogo(company: string): string {
  return COMPANY_LOGOS[company] || '';
}

let _id = 0;
const m = (name: string, company: string, category: ModelCategory, tier: ModelTier, description: string, params: string, icon: string): AIModel => ({
  id: String(++_id),
  name, company, category, tier, description, params, icon
});

export const AI_MODELS: AIModel[] = [
  // ========== OPENAI ==========
  m('GPT-4o', 'OpenAI', 'multimodal', 'legendary', 'Most capable multimodal model with vision, audio & text', '~1.8T', '🧠'),
  m('GPT-4o Mini', 'OpenAI', 'language', 'epic', 'Small efficient model great for lightweight tasks', '~8B', '⚡'),
  m('GPT-4 Turbo', 'OpenAI', 'language', 'legendary', '128K context, function calling, JSON mode', '~1.8T', '🚀'),
  m('GPT-4', 'OpenAI', 'language', 'legendary', 'Original GPT-4 with 8K/32K context', '~1.8T', '🏛️'),
  m('GPT-3.5 Turbo', 'OpenAI', 'language', 'rare', 'Fast and cost-effective for simple tasks', '~175B', '💬'),
  m('ChatGPT-5', 'OpenAI', 'multimodal', 'legendary', 'Next-gen conversational AI with deep reasoning', 'Unknown', '🌟'),
  m('o1', 'OpenAI', 'language', 'legendary', 'Advanced reasoning model with chain-of-thought', '~300B', '🔮'),
  m('o1-mini', 'OpenAI', 'language', 'epic', 'Efficient reasoning model for STEM tasks', '~100B', '🎯'),
  m('o1-pro', 'OpenAI', 'language', 'legendary', 'Most reliable reasoning with extended compute', '~300B', '👑'),
  m('o3', 'OpenAI', 'language', 'legendary', 'Latest reasoning model surpassing o1', 'Unknown', '🔬'),
  m('o3-mini', 'OpenAI', 'language', 'epic', 'Compact reasoning model with adjustable effort', '~100B', '⚙️'),
  m('o4-mini', 'OpenAI', 'language', 'legendary', 'Newest reasoning model with tool use & vision', 'Unknown', '🧬'),
  m('DALL·E 3', 'OpenAI', 'image', 'legendary', 'State-of-art text-to-image generation', 'Unknown', '🎨'),
  m('DALL·E 2', 'OpenAI', 'image', 'rare', 'Image generation with editing capabilities', 'Unknown', '🖼️'),
  m('Sora', 'OpenAI', 'video', 'legendary', 'Revolutionary text-to-video generation', 'Unknown', '🎬'),
  m('Whisper', 'OpenAI', 'audio', 'epic', 'Robust speech recognition in 99 languages', '1.5B', '🎤'),
  m('TTS', 'OpenAI', 'audio', 'rare', 'Lifelike text-to-speech with 6 voices', 'Unknown', '🔊'),
  m('Codex', 'OpenAI', 'code', 'epic', 'Code generation model powering Copilot', '12B', '💻'),
  m('CLIP', 'OpenAI', 'multimodal', 'epic', 'Connects text and images for zero-shot classification', '428M', '🔗'),
  m('Jukebox', 'OpenAI', 'audio', 'rare', 'Music generation with singing in various genres', '5B', '🎵'),
  m('GPT-4.5', 'OpenAI', 'language', 'legendary', 'Largest & most capable unsupervised model', 'Unknown', '🧊'),

  // ========== ANTHROPIC ==========
  m('Claude Sonnet 4', 'Anthropic', 'language', 'legendary', 'Best balance of intelligence and speed', 'Unknown', '🎭'),
  m('Claude Opus 4', 'Anthropic', 'language', 'legendary', 'Most powerful Claude for complex tasks', 'Unknown', '🏆'),
  m('Claude 3.5 Sonnet', 'Anthropic', 'language', 'legendary', 'Blazing fast with incredible intelligence', 'Unknown', '⚡'),
  m('Claude 3.5 Haiku', 'Anthropic', 'language', 'epic', 'Fastest Claude model for quick responses', 'Unknown', '🍃'),
  m('Claude 3 Opus', 'Anthropic', 'language', 'legendary', 'Peak intelligence for the hardest problems', 'Unknown', '💎'),
  m('Claude 3 Sonnet', 'Anthropic', 'language', 'epic', 'Strong balance of capabilities', 'Unknown', '🎻'),
  m('Claude 3 Haiku', 'Anthropic', 'language', 'rare', 'Quick and cost-effective', 'Unknown', '🌸'),
  m('Claude 2.1', 'Anthropic', 'language', 'rare', '200K context window pioneer', '130B', '📚'),
  m('Claude 2', 'Anthropic', 'language', 'rare', 'Enhanced safety and helpfulness', '130B', '🛡️'),
  m('Claude Instant', 'Anthropic', 'language', 'common', 'Fast, affordable Claude variant', '52B', '💨'),

  // ========== GOOGLE ==========
  m('Gemini 2.5 Pro', 'Google', 'multimodal', 'legendary', 'Thinking model with 1M context for complex tasks', 'Unknown', '💫'),
  m('Gemini 2.5 Flash', 'Google', 'multimodal', 'epic', 'Fast adaptive thinking model for any task', 'Unknown', '⚡'),
  m('Gemini 2.0 Flash', 'Google', 'multimodal', 'epic', 'Multimodal generation with native tool use', 'Unknown', '🔥'),
  m('Gemini 1.5 Pro', 'Google', 'multimodal', 'legendary', '1M token context window, multimodal', 'Unknown', '🌐'),
  m('Gemini 1.5 Flash', 'Google', 'multimodal', 'epic', 'Fast and versatile multimodal model', 'Unknown', '✨'),
  m('Gemini 1.0 Pro', 'Google', 'language', 'rare', 'First generation Gemini language model', 'Unknown', '🔷'),
  m('Gemma 3', 'Google', 'language', 'epic', 'Open model excelling across benchmarks', '27B', '💎'),
  m('Gemma 2', 'Google', 'language', 'epic', 'Open-weight model family', '27B', '🔹'),
  m('Gemma', 'Google', 'language', 'rare', 'Lightweight open model', '7B', '🔸'),
  m('PaLM 2', 'Google', 'language', 'epic', 'Pathways Language Model second gen', '340B', '🌴'),
  m('Imagen 3', 'Google', 'image', 'legendary', 'Highest quality text-to-image by Google', 'Unknown', '🎨'),
  m('Veo 2', 'Google', 'video', 'legendary', 'High-quality video generation model', 'Unknown', '📹'),
  m('MusicLM', 'Google', 'audio', 'epic', 'Text-to-music generation', 'Unknown', '🎶'),
  m('Med-PaLM 2', 'Google', 'science', 'legendary', 'Medical AI achieving expert-level performance', '340B', '🏥'),
  m('AlphaFold 3', 'Google DeepMind', 'science', 'legendary', 'Predicts all molecular structures', 'Unknown', '🧬'),
  m('AlphaCode 2', 'Google DeepMind', 'code', 'legendary', 'Competitive programming at expert level', 'Unknown', '🏅'),
  m('Lyria', 'Google DeepMind', 'audio', 'epic', 'Advanced music generation model', 'Unknown', '🎼'),

  // ========== META ==========
  m('Llama 4 Scout', 'Meta', 'language', 'legendary', '17B active params, 16 experts, 10M context', '109B', '🦙'),
  m('Llama 4 Maverick', 'Meta', 'multimodal', 'legendary', '17B active, 128 experts, multimodal', '400B', '🔥'),
  m('Llama 3.3 70B', 'Meta', 'language', 'epic', 'Latest Llama 3 series with 70B params', '70B', '🦙'),
  m('Llama 3.1 405B', 'Meta', 'language', 'legendary', 'Largest open-source LLM ever', '405B', '👑'),
  m('Llama 3.1 70B', 'Meta', 'language', 'epic', 'Strong open-source model', '70B', '💪'),
  m('Llama 3.1 8B', 'Meta', 'language', 'rare', 'Efficient small Llama model', '8B', '🏃'),
  m('Llama 3 70B', 'Meta', 'language', 'epic', 'Open model rivaling GPT-3.5', '70B', '🦙'),
  m('Llama 3 8B', 'Meta', 'language', 'rare', 'Compact open model', '8B', '📱'),
  m('Llama 2 70B', 'Meta', 'language', 'rare', 'Previous gen open model', '70B', '📖'),
  m('Code Llama', 'Meta', 'code', 'epic', 'Specialized coding model', '70B', '💻'),
  m('ImageBind', 'Meta', 'multimodal', 'epic', 'Binds 6 modalities in one space', 'Unknown', '🔗'),
  m('SeamlessM4T', 'Meta', 'audio', 'epic', 'Translates speech & text across 100 languages', 'Unknown', '🌍'),
  m('AudioCraft', 'Meta', 'audio', 'epic', 'Music and audio generation suite', 'Unknown', '🎵'),
  m('SAM 2', 'Meta', 'multimodal', 'epic', 'Segment Anything in images and video', 'Unknown', '✂️'),
  m('Emu Video', 'Meta', 'video', 'rare', 'Text-to-video generation model', 'Unknown', '🎞️'),

  // ========== MISTRAL AI ==========
  m('Mistral Large 2', 'Mistral AI', 'language', 'legendary', '123B param flagship model', '123B', '🌪️'),
  m('Mistral Medium', 'Mistral AI', 'language', 'epic', 'Balanced performance and speed', '~70B', '🌀'),
  m('Mistral Small', 'Mistral AI', 'language', 'rare', 'Cost-efficient for simple tasks', '22B', '💫'),
  m('Mixtral 8x22B', 'Mistral AI', 'language', 'legendary', 'Mixture-of-experts powerhouse', '141B', '🔀'),
  m('Mixtral 8x7B', 'Mistral AI', 'language', 'epic', 'Efficient MoE architecture', '46.7B', '⚡'),
  m('Mistral 7B', 'Mistral AI', 'language', 'rare', 'Punches above its weight', '7B', '🥊'),
  m('Mistral Nemo', 'Mistral AI', 'language', 'rare', '12B model with 128K context', '12B', '🐠'),
  m('Codestral', 'Mistral AI', 'code', 'epic', 'Code-specialized Mistral model', '22B', '👨‍💻'),
  m('Pixtral', 'Mistral AI', 'multimodal', 'epic', 'Vision-language model by Mistral', '12B', '👁️'),
  m('Pixtral Large', 'Mistral AI', 'multimodal', 'legendary', '124B multimodal with vision', '124B', '🔭'),

  // ========== xAI ==========
  m('Grok-3', 'xAI', 'language', 'legendary', 'Most capable model trained on Colossus', 'Unknown', '⚡'),
  m('Grok-3 Mini', 'xAI', 'language', 'epic', 'Lightweight thinking model by xAI', 'Unknown', '🧩'),
  m('Grok-2', 'xAI', 'multimodal', 'epic', 'Multimodal with image understanding', 'Unknown', '🔍'),
  m('Grok-1.5', 'xAI', 'language', 'rare', 'Extended context Grok model', '314B', '📊'),
  m('Grok-1', 'xAI', 'language', 'rare', 'Original open-source Grok', '314B', '🤖'),
  m('Aurora', 'xAI', 'image', 'epic', 'Image generation by xAI', 'Unknown', '🌅'),

  // ========== NVIDIA ==========
  m('Nemotron-4 340B', 'NVIDIA', 'language', 'legendary', 'NVIDIA\'s largest language model', '340B', '🟢'),
  m('Nemotron-4 15B', 'NVIDIA', 'language', 'rare', 'Efficient NVIDIA model', '15B', '🔋'),
  m('NVLM 72B', 'NVIDIA', 'multimodal', 'epic', 'Vision-language model', '72B', '👁️'),
  m('Megatron-Turing', 'NVIDIA', 'language', 'epic', 'Massive NLP model with Microsoft', '530B', '🗼'),
  m('Cosmos', 'NVIDIA', 'video', 'epic', 'World model for physical AI', 'Unknown', '🌌'),
  m('Edify', 'NVIDIA', 'image', 'rare', '3D and image generation', 'Unknown', '🏗️'),

  // ========== DEEPSEEK ==========
  m('DeepSeek-V3', 'DeepSeek', 'language', 'legendary', '671B MoE model with 37B active params', '671B', '🔮'),
  m('DeepSeek-V2.5', 'DeepSeek', 'language', 'epic', 'Merged chat and coder capabilities', '236B', '🎯'),
  m('DeepSeek-R1', 'DeepSeek', 'language', 'legendary', 'Pure RL reasoning model rivaling o1', '671B', '🧪'),
  m('DeepSeek-R1-Zero', 'DeepSeek', 'language', 'epic', 'RL reasoning without supervised fine-tuning', '671B', '🔬'),
  m('DeepSeek-Coder-V2', 'DeepSeek', 'code', 'epic', 'Code-specialized MoE model', '236B', '💻'),
  m('DeepSeek-Math', 'DeepSeek', 'science', 'epic', 'Math-specialized model', '7B', '📐'),
  m('DeepSeek-VL2', 'DeepSeek', 'multimodal', 'epic', 'Vision-language understanding', '27B', '👁️'),

  // ========== STABILITY AI ==========
  m('Stable Diffusion 3.5', 'Stability AI', 'image', 'legendary', 'Latest SD with MMDiT architecture', 'Unknown', '🎨'),
  m('Stable Diffusion 3', 'Stability AI', 'image', 'legendary', 'Next-gen image model with flow matching', '8B', '🖌️'),
  m('Stable Diffusion XL', 'Stability AI', 'image', 'epic', 'High-res image generation', '6.6B', '🖼️'),
  m('Stable Diffusion 2.1', 'Stability AI', 'image', 'rare', 'Improved image generation', '865M', '📸'),
  m('Stable Video Diffusion', 'Stability AI', 'video', 'epic', 'Image-to-video generation', '1.5B', '🎥'),
  m('Stable Audio 2', 'Stability AI', 'audio', 'epic', 'Music and sound generation', 'Unknown', '🎧'),
  m('Stable Zero123', 'Stability AI', 'image', 'rare', '3D object generation from single image', 'Unknown', '🧊'),
  m('Stable LM 2', 'Stability AI', 'language', 'rare', 'Language model by Stability', '12B', '📝'),

  // ========== MIDJOURNEY ==========
  m('Midjourney v6.1', 'Midjourney', 'image', 'legendary', 'Latest with improved coherence', 'Unknown', '🎨'),
  m('Midjourney v6', 'Midjourney', 'image', 'legendary', 'Breakthrough in prompt understanding', 'Unknown', '✨'),
  m('Midjourney v5.2', 'Midjourney', 'image', 'epic', 'High aesthetic quality', 'Unknown', '🌈'),
  m('Midjourney v5', 'Midjourney', 'image', 'rare', 'Major quality improvement', 'Unknown', '🎭'),
  m('Niji v6', 'Midjourney', 'image', 'epic', 'Anime-focused model', 'Unknown', '🏯'),

  // ========== COHERE ==========
  m('Command R+', 'Cohere', 'language', 'epic', 'Enterprise RAG-optimized model', '104B', '🏢'),
  m('Command R', 'Cohere', 'language', 'epic', 'Scalable RAG model', '35B', '📊'),
  m('Command', 'Cohere', 'language', 'rare', 'Business text generation', '52B', '💼'),
  m('Embed v3', 'Cohere', 'embedding', 'epic', 'Best-in-class embeddings', 'Unknown', '🔢'),
  m('Rerank 3', 'Cohere', 'other', 'rare', 'Search result reranking', 'Unknown', '📋'),
  m('Aya 23', 'Cohere', 'language', 'epic', 'Multilingual model covering 23 languages', '35B', '🌍'),

  // ========== AI21 LABS ==========
  m('Jamba 1.5 Large', 'AI21 Labs', 'language', 'epic', 'SSM-Transformer hybrid with 256K context', '398B', '🐍'),
  m('Jamba 1.5 Mini', 'AI21 Labs', 'language', 'rare', 'Efficient hybrid architecture', '52B', '🐛'),
  m('Jurassic-2', 'AI21 Labs', 'language', 'rare', 'Enterprise language model', '178B', '🦕'),

  // ========== HUGGING FACE ==========
  m('StarCoder2', 'Hugging Face', 'code', 'epic', 'Open code LLM trained on 600+ languages', '15B', '⭐'),
  m('BLOOM', 'Hugging Face', 'language', 'epic', 'Open multilingual model by BigScience', '176B', '🌸'),
  m('Zephyr', 'Hugging Face', 'language', 'rare', 'Fine-tuned for chat', '7B', '🌬️'),
  m('SmolLM 2', 'Hugging Face', 'language', 'rare', 'Tiny but capable language model', '1.7B', '🔬'),
  m('SmolVLM', 'Hugging Face', 'multimodal', 'rare', 'Small vision-language model', '2B', '👀'),

  // ========== ALIBABA ==========
  m('Qwen2.5 72B', 'Alibaba', 'language', 'legendary', 'Flagship open Chinese/English model', '72B', '🐉'),
  m('Qwen2.5-Coder', 'Alibaba', 'code', 'epic', 'Code-specialized Qwen model', '32B', '💻'),
  m('Qwen2 72B', 'Alibaba', 'language', 'epic', 'Strong multilingual model', '72B', '🌏'),
  m('Qwen-VL', 'Alibaba', 'multimodal', 'epic', 'Vision-language Qwen', '9.6B', '👁️'),
  m('Qwen-Audio', 'Alibaba', 'audio', 'rare', 'Audio understanding model', '8.7B', '🎧'),
  m('Marco-o1', 'Alibaba', 'language', 'epic', 'Reasoning model by Alibaba', 'Unknown', '🧩'),
  m('QwQ 32B', 'Alibaba', 'language', 'epic', 'Reasoning model competitive with o1', '32B', '💭'),
  m('Yi-Lightning', 'Alibaba', 'language', 'epic', 'Ultra-fast inference model', 'Unknown', '⚡'),

  // ========== BAIDU ==========
  m('ERNIE 4.0', 'Baidu', 'language', 'epic', 'Baidu\'s flagship model', 'Unknown', '🐲'),
  m('ERNIE Bot', 'Baidu', 'language', 'rare', 'Chinese conversational AI', 'Unknown', '💬'),
  m('ERNIE-ViLG', 'Baidu', 'image', 'rare', 'Text-to-image in Chinese', 'Unknown', '🎨'),

  // ========== TENCENT ==========
  m('Hunyuan', 'Tencent', 'language', 'epic', 'Tencent\'s flagship MoE model', '389B', '🐧'),
  m('HunyuanVideo', 'Tencent', 'video', 'epic', 'Open video generation model', 'Unknown', '🎬'),
  m('HunyuanDiT', 'Tencent', 'image', 'rare', 'Diffusion transformer for images', 'Unknown', '🖼️'),

  // ========== APPLE ==========
  m('Apple Intelligence', 'Apple', 'multimodal', 'epic', 'On-device AI for Apple ecosystem', 'Unknown', '🍎'),
  m('OpenELM', 'Apple', 'language', 'rare', 'Open efficient language model', '3B', '🌳'),
  m('Ferret', 'Apple', 'multimodal', 'rare', 'Grounded visual understanding', '13B', '🔍'),
  m('MGIE', 'Apple', 'image', 'rare', 'Instruction-based image editing', 'Unknown', '✏️'),
  m('AFM', 'Apple', 'language', 'epic', 'Apple Foundation Models on-device', 'Unknown', '📱'),

  // ========== AMAZON ==========
  m('Titan Text Premier', 'Amazon', 'language', 'epic', 'Amazon\'s best text model', 'Unknown', '🏛️'),
  m('Titan Text Express', 'Amazon', 'language', 'rare', 'Fast Amazon text model', 'Unknown', '📦'),
  m('Titan Image Generator', 'Amazon', 'image', 'rare', 'Enterprise image generation', 'Unknown', '🎨'),
  m('Titan Embedding', 'Amazon', 'embedding', 'rare', 'Text and multimodal embeddings', 'Unknown', '🔢'),
  m('Nova Pro', 'Amazon', 'multimodal', 'epic', 'Capable multimodal model', 'Unknown', '🌟'),
  m('Nova Lite', 'Amazon', 'multimodal', 'rare', 'Lightweight multimodal model', 'Unknown', '💡'),

  // ========== SAMSUNG ==========
  m('Samsung Gauss2', 'Samsung', 'multimodal', 'epic', 'Next-gen on-device AI model', 'Unknown', '📱'),
  m('Samsung Gauss', 'Samsung', 'language', 'rare', 'On-device language model', 'Unknown', '📲'),

  // ========== ADOBE ==========
  m('Firefly 3', 'Adobe', 'image', 'epic', 'Commercially safe image generation', 'Unknown', '🔥'),
  m('Firefly Video', 'Adobe', 'video', 'epic', 'AI video generation for creatives', 'Unknown', '🎬'),
  m('Firefly Vector', 'Adobe', 'image', 'rare', 'AI vector graphics generation', 'Unknown', '📐'),

  // ========== RUNWAY ==========
  m('Gen-3 Alpha', 'Runway', 'video', 'legendary', 'State-of-art video generation', 'Unknown', '🎬'),
  m('Gen-3 Alpha Turbo', 'Runway', 'video', 'epic', 'Fast video generation', 'Unknown', '⚡'),
  m('Gen-2', 'Runway', 'video', 'epic', 'Text/image to video', 'Unknown', '🎥'),
  m('Gen-1', 'Runway', 'video', 'rare', 'Video-to-video transformation', 'Unknown', '🔄'),

  // ========== ELEVENLABS ==========
  m('ElevenLabs v2', 'ElevenLabs', 'audio', 'legendary', 'Most realistic text-to-speech', 'Unknown', '🗣️'),
  m('Turbo v2.5', 'ElevenLabs', 'audio', 'epic', 'Low-latency voice synthesis', 'Unknown', '⚡'),
  m('Voice Isolator', 'ElevenLabs', 'audio', 'rare', 'Remove background noise from speech', 'Unknown', '🎙️'),

  // ========== INFLECTION ==========
  m('Pi 2.5', 'Inflection', 'language', 'epic', 'Personal AI assistant model', '~40B', '🧑‍🤝‍🧑'),
  m('Pi', 'Inflection', 'language', 'rare', 'Empathetic conversational AI', '~40B', '💬'),
  m('Inflection 3', 'Inflection', 'language', 'epic', 'Competitive with GPT-4', 'Unknown', '🚀'),

  // ========== CHARACTER.AI ==========
  m('Character LLM', 'Character.ai', 'language', 'epic', 'Roleplay-optimized model', 'Unknown', '🎭'),
  m('Character LLM v2', 'Character.ai', 'language', 'epic', 'Enhanced persona consistency', 'Unknown', '🎪'),

  // ========== PERPLEXITY ==========
  m('Sonar Huge', 'Perplexity', 'language', 'epic', 'Most capable search-augmented model', 'Unknown', '🌊'),
  m('Sonar Pro', 'Perplexity', 'language', 'epic', 'Advanced search reasoning', 'Unknown', '🔎'),
  m('Sonar', 'Perplexity', 'language', 'rare', 'Fast search-augmented generation', 'Unknown', '📡'),

  // ========== ZHIPU AI ==========
  m('GLM-4', 'Zhipu AI', 'language', 'epic', 'Chinese flagship model rivaling GPT-4', '130B', '🇨🇳'),
  m('GLM-4V', 'Zhipu AI', 'multimodal', 'epic', 'Vision-language model', '130B', '👁️'),
  m('CogVideoX', 'Zhipu AI', 'video', 'epic', 'Open video generation model', 'Unknown', '🎬'),
  m('CogView 3', 'Zhipu AI', 'image', 'rare', 'Text-to-image generation', 'Unknown', '🖼️'),

  // ========== 01.AI ==========
  m('Yi-1.5 34B', '01.AI', 'language', 'epic', 'Strong open bilingual model', '34B', '🎯'),
  m('Yi-Vision', '01.AI', 'multimodal', 'rare', 'Image understanding model', '34B', '👁️'),
  m('Yi-Coder', '01.AI', 'code', 'rare', 'Code-specialized Yi model', '9B', '💻'),

  // ========== REKA AI ==========
  m('Reka Core', 'Reka AI', 'multimodal', 'epic', 'Largest Reka model with multimodal abilities', '~67B', '🌟'),
  m('Reka Flash', 'Reka AI', 'multimodal', 'rare', 'Fast multimodal model', '21B', '⚡'),
  m('Reka Edge', 'Reka AI', 'language', 'rare', 'Efficient edge deployment model', '7B', '📱'),

  // ========== WRITER ==========
  m('Palmyra X 004', 'Writer', 'language', 'epic', 'Enterprise-focused model', 'Unknown', '✍️'),
  m('Palmyra Vision', 'Writer', 'multimodal', 'rare', 'Document understanding', 'Unknown', '📄'),

  // ========== DATABRICKS ==========
  m('DBRX', 'Databricks', 'language', 'epic', 'Open MoE model beating Llama 2 70B', '132B', '🧱'),
  m('DBRX Instruct', 'Databricks', 'language', 'epic', 'Instruction-tuned DBRX', '132B', '🎓'),

  // ========== SALESFORCE ==========
  m('xGen-7B', 'Salesforce', 'language', 'rare', '8K context open model', '7B', '☁️'),
  m('CodeGen2.5', 'Salesforce', 'code', 'rare', 'Code generation model', '7B', '💻'),
  m('Einstein GPT', 'Salesforce', 'language', 'epic', 'CRM AI assistant', 'Unknown', '🤝'),
  m('SFR-Embedding', 'Salesforce', 'embedding', 'rare', 'State-of-art embedding model', 'Unknown', '🔢'),

  // ========== IBM ==========
  m('Granite 3.1', 'IBM', 'language', 'epic', 'Enterprise-grade open model', '34B', '🏢'),
  m('Granite Code', 'IBM', 'code', 'rare', 'Code-specialized Granite', '34B', '💻'),
  m('Granite Vision', 'IBM', 'multimodal', 'rare', 'Document understanding model', '34B', '📊'),

  // ========== TII / FALCON ==========
  m('Falcon 2', 'TII', 'language', 'epic', 'Multilingual open model', '11B', '🦅'),
  m('Falcon 180B', 'TII', 'language', 'legendary', 'Massive open model', '180B', '👑'),
  m('Falcon 40B', 'TII', 'language', 'epic', 'Strong open model', '40B', '🔥'),

  // ========== ELEUTHERAI ==========
  m('Pythia', 'EleutherAI', 'language', 'rare', 'Suite for interpretability research', '12B', '🐍'),
  m('GPT-NeoX', 'EleutherAI', 'language', 'rare', 'Open GPT-3 alternative', '20B', '🤖'),
  m('GPT-J', 'EleutherAI', 'language', 'common', 'Early open model pioneer', '6B', '🏗️'),

  // ========== ALLEN AI ==========
  m('OLMo 2', 'Allen AI', 'language', 'epic', 'Fully open language model', '13B', '📖'),
  m('Tulu 3', 'Allen AI', 'language', 'rare', 'Post-training recipe model', '70B', '🎯'),
  m('Molmo', 'Allen AI', 'multimodal', 'rare', 'Open vision-language model', '72B', '👁️'),

  // ========== BLACK FOREST LABS ==========
  m('FLUX.1 Pro', 'Black Forest Labs', 'image', 'legendary', 'State-of-art image generation', 'Unknown', '✨'),
  m('FLUX.1 Dev', 'Black Forest Labs', 'image', 'epic', 'Developer-friendly image model', 'Unknown', '🔧'),
  m('FLUX.1 Schnell', 'Black Forest Labs', 'image', 'epic', 'Ultra-fast image generation', 'Unknown', '⚡'),
  m('FLUX.1 Ultra', 'Black Forest Labs', 'image', 'legendary', 'Highest resolution up to 4MP', 'Unknown', '🖼️'),

  // ========== IDEOGRAM ==========
  m('Ideogram 2.0', 'Ideogram', 'image', 'epic', 'Best text rendering in images', 'Unknown', '🔤'),
  m('Ideogram 1.0', 'Ideogram', 'image', 'rare', 'Pioneer in text-in-image', 'Unknown', '📝'),

  // ========== PIKA LABS ==========
  m('Pika 2.0', 'Pika Labs', 'video', 'epic', 'Consumer video generation with effects', 'Unknown', '🎬'),
  m('Pika 1.5', 'Pika Labs', 'video', 'rare', 'Enhanced video generation', 'Unknown', '🎥'),

  // ========== LUMA AI ==========
  m('Dream Machine 1.5', 'Luma AI', 'video', 'epic', 'Fast video generation from text', 'Unknown', '💭'),
  m('Ray 2', 'Luma AI', 'video', 'epic', 'Advanced video generation model', 'Unknown', '🌈'),
  m('Genie', 'Luma AI', 'image', 'rare', '3D model generation', 'Unknown', '🧊'),

  // ========== SUNO ==========
  m('Suno v4', 'Suno', 'audio', 'legendary', 'Best AI music generation', 'Unknown', '🎵'),
  m('Suno v3.5', 'Suno', 'audio', 'epic', 'Full song generation with lyrics', 'Unknown', '🎸'),

  // ========== UDIO ==========
  m('Udio v1.5', 'Udio', 'audio', 'epic', 'High-fidelity music generation', 'Unknown', '🎶'),
  m('Udio v1', 'Udio', 'audio', 'rare', 'Original music generation model', 'Unknown', '🎹'),

  // ========== MINIMAX ==========
  m('MiniMax-01', 'Minimax', 'language', 'epic', '456B MoE with lightning attention', '456B', '⚡'),
  m('MiniMax-Text-01', 'Minimax', 'language', 'rare', 'Text-specialized model', '45.9B', '📝'),
  m('Hailuo', 'Minimax', 'video', 'epic', 'Video generation model', 'Unknown', '🎬'),

  // ========== MOONSHOT AI ==========
  m('Kimi', 'Moonshot AI', 'language', 'epic', '2M context window pioneer', 'Unknown', '🌙'),
  m('Kimi k1.5', 'Moonshot AI', 'language', 'epic', 'Reasoning model with RL', 'Unknown', '🔮'),

  // ========== BYTEDANCE ==========
  m('Doubao Pro', 'ByteDance', 'language', 'epic', 'ByteDance flagship model', 'Unknown', '🎵'),
  m('Doubao Lite', 'ByteDance', 'language', 'rare', 'Lightweight chat model', 'Unknown', '💬'),

  // ========== OTHER COMPANIES ==========
  m('Cerebras-GPT', 'Cerebras', 'language', 'rare', 'Trained on Cerebras wafer-scale chips', '13B', '🧠'),
  m('Arctic', 'Snowflake', 'language', 'epic', 'Enterprise-grade MoE model', '480B', '❄️'),
  m('StripedHyena', 'Together AI', 'language', 'rare', 'Alternative to transformer architecture', '7B', '🦓'),
  m('RedPajama-V2', 'Together AI', 'language', 'rare', 'Open dataset model', '3B', '🔴'),
  m('Haiper 2.0', 'Haiper', 'video', 'rare', 'Perceptual foundation model for video', 'Unknown', '🎥'),
  m('Luminous', 'Aleph Alpha', 'language', 'rare', 'European sovereign AI model', '70B', '💡'),
  m('ColossalChat', 'Colossal AI', 'language', 'rare', 'RLHF-powered chat model', '7B', '🗿'),
  m('Jasper AI', 'Jasper', 'language', 'rare', 'Marketing content generation', 'Unknown', '📢'),
  m('ACE', 'Adept AI', 'agent', 'epic', 'Action model for computer use', 'Unknown', '🖱️'),
  m('Replika LLM', 'Replika', 'language', 'rare', 'Companion AI model', 'Unknown', '💖'),
  m('Synthesia Avatar', 'Synthesia', 'video', 'epic', 'AI avatar video generation', 'Unknown', '🧑'),
  m('D-ID Creative Reality', 'D-ID', 'video', 'rare', 'Talking head video generation', 'Unknown', '🗣️'),
  m('Universal-1', 'AssemblyAI', 'audio', 'epic', 'Best-in-class speech recognition', 'Unknown', '🎤'),
  m('Nova-2', 'Deepgram', 'audio', 'epic', 'Real-time speech-to-text', 'Unknown', '📡'),
  m('Inworld Character Engine', 'Inworld AI', 'agent', 'epic', 'NPC AI for games', 'Unknown', '🎮'),
  m('Groq LPU Inference', 'Groq', 'other', 'epic', 'Ultra-fast model inference', 'Unknown', '🏎️'),
  m('Kling 1.6', 'Kling AI', 'video', 'epic', 'Chinese video generation leader', 'Unknown', '🎬'),
  m('Kling Image', 'Kling AI', 'image', 'rare', 'Image generation model', 'Unknown', '🖼️'),
  m('LitLlama', 'Lightning AI', 'language', 'common', 'Lightning-fast inference model', '1B', '⚡'),

  // ========== MICROSOFT ==========
  m('Phi-4', 'Microsoft', 'language', 'epic', 'Small but mighty reasoning model', '14B', '🔬'),
  m('Phi-3.5-MoE', 'Microsoft', 'language', 'epic', 'Mixture of experts Phi model', '42B', '🧪'),
  m('Phi-3 Mini', 'Microsoft', 'language', 'rare', 'Compact powerful model', '3.8B', '📱'),
  m('Phi-3 Vision', 'Microsoft', 'multimodal', 'rare', 'Vision-language Phi model', '4.2B', '👁️'),
  m('Florence-2', 'Microsoft', 'multimodal', 'rare', 'Vision foundation model', '0.77B', '🔍'),
  m('Orca 2', 'Microsoft', 'language', 'rare', 'Reasoning-optimized model', '13B', '🐋'),
  m('WizardLM-2', 'Microsoft', 'language', 'epic', 'Instruction-following model', '70B', '🧙'),
  m('Copilot', 'Microsoft', 'code', 'legendary', 'AI-powered code assistant', 'Unknown', '👨‍💻'),

  // ========== MORE ==========
  m('Voyage 3 Large', 'Voyage AI', 'embedding', 'epic', 'State-of-art embedding model', 'Unknown', '🚀'),
  m('Twelve Labs Embed', 'Twelve Labs', 'embedding', 'rare', 'Video understanding embeddings', 'Unknown', '🎞️'),
  m('Scale Donovan', 'Scale AI', 'agent', 'epic', 'Defense and enterprise AI', 'Unknown', '🛡️'),
  m('MPT-30B', 'Mosaic ML', 'language', 'rare', 'Open commercial model', '30B', '🧱'),
  m('Fuyu-8B', 'Adept AI', 'multimodal', 'rare', 'Multimodal model for digital agents', '8B', '🤖'),
];

export const CATEGORIES: { id: ModelCategory; label: string; icon: string }[] = [
  { id: 'language', label: 'Language', icon: '💬' },
  { id: 'multimodal', label: 'Multimodal', icon: '🌐' },
  { id: 'image', label: 'Image', icon: '🎨' },
  { id: 'video', label: 'Video', icon: '🎬' },
  { id: 'audio', label: 'Audio', icon: '🎵' },
  { id: 'code', label: 'Code', icon: '💻' },
  { id: 'science', label: 'Science', icon: '🔬' },
  { id: 'embedding', label: 'Embedding', icon: '🔢' },
  { id: 'agent', label: 'Agent', icon: '🤖' },
  { id: 'other', label: 'Other', icon: '🔧' },
];

export const TIERS: { id: ModelTier; label: string; color: string }[] = [
  { id: 'legendary', label: '⭐ Legendary', color: '#fbbf24' },
  { id: 'epic', label: '💜 Epic', color: '#a855f7' },
  { id: 'rare', label: '💎 Rare', color: '#3b82f6' },
  { id: 'common', label: '⚪ Common', color: '#9ca3af' },
];
