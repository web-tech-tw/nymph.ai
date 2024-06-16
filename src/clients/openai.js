"use strict";
// openai is a client for the OpenAI API

const {getMust} = require("../config");

const OpenAI = require("openai");

const baseUrl = getMust("OPENAI_BASE_URL");
const apiKey = getMust("OPENAI_API_KEY");
const chatModel = getMust("OPENAI_CHAT_MODEL");

const prependPrompts = require("../../prompts.json");

const client = new OpenAI({baseUrl, apiKey});

const chatHistoryMapper = new Map();

/**
 * Randomly choose an element from an array.
 * @param {Array<object>} choices The array of choices.
 * @return {object} The randomly chosen element.
 */
function choose(choices) {
    const seed = Math.random();
    const index = Math.floor(seed * choices.length);
    return choices[index];
}

/**
 * Chat with the AI.
 * @param {string} chatId The chat ID to chat with the AI.
 * @param {string} prompt The prompt to chat with the AI.
 * @return {Promise<string>} The response from the AI.
 */
async function chatWithAI(chatId, prompt) {
    if (!chatHistoryMapper.has(chatId)) {
        chatHistoryMapper.set(chatId, []);
    }

    const chatHistory = chatHistoryMapper.get(chatId);
    const userPromptMessage = {
        role: "user",
        content: prompt,
    };

    const response = await client.chat.completions.create({
        model: chatModel,
        messages: [
            ...prependPrompts,
            ...chatHistory,
            userPromptMessage,
        ],
    });

    const choice = choose(response.choices);
    const reply = choice.message.content;
    const assistantReplyMessage = {
        role: "assistant",
        content: reply,
    };

    chatHistory.push(
        userPromptMessage,
        assistantReplyMessage,
    );
    if (chatHistory.length > 30) {
        chatHistory.shift();
        chatHistory.shift();
    }

    return reply;
}

/**
 * Slice the message content into multiple snippets.
 * @param {string} content - The content to slice.
 * @param {number} maxLength - The maximum length of each snippet.
 * @param {string} separator - The separator to split the content.
 * @return {Array<string>} The sliced snippets.
 */
function sliceContent(content, maxLength, separator="\n") {
    const substrings = content.split(separator);
    const snippets = [];

    let lastSnippet = "";
    for (const text of substrings) {
        if (!text) {
            lastSnippet += separator;
            continue;
        }
        if (text.length + lastSnippet.length < maxLength) {
            lastSnippet += text;
            continue;
        }
        snippets.push(lastSnippet);
        lastSnippet = "";
    }
    if (lastSnippet) {
        snippets.push(lastSnippet);
    }

    return snippets;
}

exports.useClient = () => client;
exports.chatWithAI = chatWithAI;
exports.sliceContent = sliceContent;
