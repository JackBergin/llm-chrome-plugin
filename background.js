// Initialize chat history
let chatHistory;

// Listen for when the extension is installed
chrome.runtime.onInstalled.addListener(function () {
    // Set default API model
    let defaultModel = "gpt-4o";
    chrome.storage.local.set({ apiModel: defaultModel });

    // Set empty chat history
    chrome.storage.local.set({ chatHistory: [] });

    // Open the options page
    chrome.runtime.openOptionsPage();
});

function formatResponseFromChat(assistantResponse) {
    let formattedResponse = assistantResponse;

    // Replace bold (**text**)
    formattedResponse = formattedResponse.replace(/\*\*(.+?)\*\*/g, function (match, boldText) {
        return `<strong>${boldText}</strong>`;
    });

    // Replace italic (*text*)
    formattedResponse = formattedResponse.replace(/\*(.+?)\*/g, function (match, italicText) {
        return `<em>${italicText}</em>`;
    });

    // Replace inline code (using single backticks)
    formattedResponse = formattedResponse.replace(/`([^`]+)`/g, function (match, codeText) {
        return `<code>${codeText}</code>`;
    });

    return formattedResponse;
}



// Listen for messages from the popup script
chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {

    if (message.userInput) {

        // Get the API key from local storage
        const { apiKey } = await getStorageData(["apiKey"]);
        // Get the model from local storage
        const { apiModel } = await getStorageData(["apiModel"]);

        // get the chat history from local storage
        const result = await getStorageData(["chatHistory"]);

        if (!result.chatHistory || result.chatHistory.length === 0) {
            chatHistory = [
                { role: "system", content: "I'm your helpful chat bot! I provide helpful and concise answers." },
            ];
        } else {
            chatHistory = result.chatHistory;
        }

        // Format the user's message before saving it
        const formattedUserMessage = formatMessageContent(message.userInput);

        // Save user's formatted message to message array
        chatHistory.push({ role: "user", content: formattedUserMessage });

        if (apiModel === "dall-e-3") {
            // Send the user's message to the OpenAI API (image generation model)
            const response = await fetchImage(message.userInput, apiKey, apiModel);

            if (response && response.data && response.data.length > 0) {
                // Get the image URL
                const imageUrl = response.data[0].url;

                // Add the assistant's response (image URL) to the message array
                chatHistory.push({ role: "assistant", content: imageUrl });

                // Save message array to local storage
                chrome.storage.local.set({ chatHistory: chatHistory });

                // Send the image URL to the popup script
                chrome.runtime.sendMessage({ imageUrl: imageUrl });

                console.log("Sent image URL to popup:", imageUrl);
            }
            return true; // Enable response callback
        } else {
            // Send the user's message to the OpenAI API (chat model)
            const response = await fetchChatCompletion(chatHistory, apiKey, apiModel);

            if (response && response.choices && response.choices.length > 0) {

                // Get the assistant's response
                const assistantResponse = response.choices[0].message.content;

                // Format the assistant's response before saving it
                const formattedAssistantResponse = formatResponseFromChat(assistantResponse);

                // Add the assistant's formatted response to the message array
                chatHistory.push({ role: "assistant", content: formattedAssistantResponse });

                // Save message array to local storage
                chrome.storage.local.set({ chatHistory: chatHistory });

                // Send the assistant's formatted response to the popup script
                chrome.runtime.sendMessage({ answer: formattedAssistantResponse });

                console.log("Sent formatted response to popup:", formattedAssistantResponse);
            }
            return true; // Enable response callback
        }
    }

    return true; // Enable response callback
});

// Fetch data from the OpenAI Chat Completion API
async function fetchChatCompletion(messages, apiKey, apiModel) {
    try {
        /*
          TODO:
          - Add a way to handle embedding get requests in the messages array
          - Send this embedding response to the request to our chat endpoint

        const embeddingsResponse = await fetch('http://127.0.0.1:54321/functions/v1/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                "messages": messages,
                "model": apiModel,
            })
        });
        
        const response = await fetch('http://127.0.0.1:54321/functions/v1/chat', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${apiKey}`
              },
              body: JSON.stringify({
                  "messages": messages,
                  "model": apiModel,
              })
          });
        */
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                "messages": messages,
                "model": apiModel,
            })
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Unauthorized - Incorrect API key
                throw new Error("Looks like your API key is incorrect. Please check your API key and try again.");
            } else {
                throw new Error(`Failed to fetch. Status code: ${response.status}`);
            }
        }

        return await response.json();
    } catch (error) {
        // Send a response to the popup script
        chrome.runtime.sendMessage({ error: error.message });

        console.error(error);
    }
}

// Fetch Image from the OpenAI DALL-E API
async function fetchImage(prompt, apiKey, apiModel) {
    try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                "prompt": prompt,
                "model": apiModel,
                "n": 1,
                "size": "1024x1024",
            })
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Unauthorized - Incorrect API key
                throw new Error("Looks like your API key is incorrect. Please check your API key and try again.");
            } else {
                throw new Error(`Failed to fetch. Status code: ${response.status}`);
            }
        }

        return await response.json();
    } catch (error) {
        // Send a response to the popup script
        chrome.runtime.sendMessage({ error: error.message });

        console.error(error);
    }
}

// Get data from local storage
function getStorageData(keys) {
    return new Promise((resolve) => {
        chrome.storage.local.get(keys, (result) => resolve(result));
    });
}
