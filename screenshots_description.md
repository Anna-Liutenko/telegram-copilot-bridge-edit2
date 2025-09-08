# Screenshots Description

## Screenshot 1: Copilot Studio - T.Buddy Agent Configuration

**Platform:** Microsoft Copilot Studio
**Agent Name:** T.Buddy (with green checkmark indicating active status)

### Main Interface Elements:
- **Navigation Tabs:** Overview, Knowledge, Tools, Agents, Topics, Activity, Analytics, Channels
- **Current Tab:** Details tab is active
- **Test Panel:** "Test your agent" panel visible on the right side

### Configuration Sections:

#### 1. Agent Details
- **Name:** T.Buddy
- **Description:** "T.Buddy enables users to select their preferred language, and communicate seamlessly. It focuses solely on translating messages between user languages. The agent receives messages about the source languages and then select a message with translation on 1 on 1 native languages."

#### 2. Orchestration
- **Status:** Enabled (toggle switch is ON)
- **Description:** "The generative AI determines how best to respond to users and events. Learn more"
- **Response model:** GPT-4o (Default)

#### 3. Analytics
- **Performance metrics:** Shows agent's key performance over last 7 days
- **Conversation sessions:** 0
- **Engagement:** 0%
- **Satisfaction score:** 0

#### 4. Instructions
- **Content:** "You are a multilingual translator working with user-selected languages."
- **Edit button:** Available for modifications

#### 5. Knowledge
- **Status:** Empty state with "Add knowledge" button
- **Description:** "Add data, files, and other resources to inform and improve AI-generated responses."

#### 6. Web Search
- **Status:** Enabled (toggle switch is ON)
- **Description:** "Enable your agent to search via public websites. Learn more"

#### 7. Tools
- **Description:** "Add tools to give your bot AI to complete specific tasks for improved engagement. Learn more"
- **Current State:** No tools added, with "Add tool" button available

#### 8. Triggers
- **Description:** "Set up your agent to activate when certain events happen. Learn more"
- **Current State:** No triggers set, with "Add trigger" button available

#### 9. Agents
- **Description:** "Connect your agent with another agent, dedicated to handling steps of your workflow. Learn more"
- **Current State:** No agents connected, with "Add agent" button available

#### 10. Topics
- **Available Topics:**
  - Greeting
  - Language/Safe
  - End Chat
- **Action:** "See all" link available

#### 11. Suggested prompts
- **Description:** "Suggest lists of making conversation for users and forward this journals Learn More"
- **Current State:** No suggested prompts, with "Add suggested prompts" button available

---

## Screenshot 2: FinalTranslator - Copilot Studio Prompt Configuration

**Tool Name:** FinalTranslator
**Platform:** Microsoft Copilot Studio (Prompt Configuration Interface)

### Interface Elements:

#### Header Section:
- **Tool Name:** FinalTranslator (with blue icon)
- **Warning Message:** "Changes will apply everywhere this prompt is used and could impact existing behavior."

#### Configuration Panel:

##### Instructions Section:
- **Content:** "Translate the text from the variable {textToTranslate} into the language specified by the variable {langCode}. Output ONLY the translated text. Do not add the language code prefix or any other explanations."
- **Variables Highlighted:** 
  - `textToTranslate` (blue highlight)
  - `langCode` (blue highlight)

##### Model Configuration:
- **Model:** GPT-4.1 mini (dropdown selection)
- **Test Button:** Blue "Test" button available

##### Output Configuration:
- **Output Type:** Text (dropdown selection)

#### Model Response Section:
- **Sample Output:** "Hello!"

#### Footer Information:
- **Processing Time:** 1812 ms
- **Credits Used:** 3 credits
- **Additional Note:** "AI-generated content may be incorrect. Read terms"

---

## Screenshot 3: LanguageProcessor - Copilot Studio Prompt Configuration

**Tool Name:** LanguageProcessor
**Platform:** Microsoft Copilot Studio (Prompt Configuration Interface)

### Interface Elements:

#### Header Section:
- **Tool Name:** LanguageProcessor (with blue icon)
- **Warning Message:** "Changes will apply everywhere this prompt is used and could impact existing behavior."

#### Configuration Panel:

##### Instructions Section:
**Detailed Prompt:**
```
You are an AI assistant that processes user-provided language names into a structured JSON format.
From the user's text, identify all mentioned languages.

Your output MUST BE a valid JSON array of objects.
Each object in the array must have two keys: "code" and "name".
- The "code" value must be the two-letter ISO 639-1 code in uppercase.
- The "name" value must be the full English language name, correctly capitalized.

USER INPUT:
{Topic.userInput}

EXAMPLE:
USER INPUT: "I want to use Russian, English, and maybe Japanese"
CORRECT JSON OUTPUT:
{"code": "RU", "name": "Russian"},
{"code": "EN", "name": "English"},
```

##### Model Configuration:
- **Model:** GPT-4.1 mini (dropdown selection)
- **Test Button:** Blue "Test" button available

##### Output Configuration:
- **Output Type:** JSON (dropdown selection)
- **Customize JSON:** Option available

#### Model Response Section:
**Sample JSON Output:**
```json
{
  "languages": [
    {
      "code": "EN",
      "name": "English"
    },
    {
      "code": "RU", 
      "name": "Russian"
    },
    {
      "code": "KO",
      "name": "Korean"
    }
  ]
}
```

#### Footer Information:
- **Processing Time:** 1128 ms
- **Credits Used:** 3 credits

---

## Screenshot 4: sourceLanguageCode - Copilot Studio Prompt Configuration

**Tool Name:** sourceLanguageCode
**Platform:** Microsoft Copilot Studio (Prompt Configuration Interface)

### Interface Elements:

#### Header Section:
- **Tool Name:** sourceLanguageCode (with blue icon)

#### Configuration Panel:

##### Instructions Section:
- **Simple Prompt:** "Detect the two-letter ISO 639-1 language code for this text. Output only the two-letter code."
- **Input Variable:** `Text input` (blue highlighted button)

##### Model Configuration:
- **Model:** GPT-4.1 mini (dropdown selection)
- **Test Button:** Blue "Test" button available

##### Output Configuration:
- **Output Type:** JSON (dropdown selection)
- **Customize JSON:** Option available

#### Model Response Section:
**Sample JSON Output:**
```json
{
  "language_code": "ru"
}
```

#### Footer Information:
- **Processing Time:** 1123 ms
- **Credits Used:** 3 credits

---

## Screenshot 5: T.Buddy Agent Flow Overview in Copilot Studio

**Platform:** Microsoft Copilot Studio
**View:** Topics Tab - Main Flow Visualization

### Browser Context:
- **Multiple Tabs Open:** Google Gemini, Administration, YouTube, Telegram Bot API, Power Apps Solutions
- **Current URL:** copilot studio environment with specific agent ID

### Interface Elements:

#### Header Section:
- **Agent Name:** T.Buddy (with green status indicator)
- **Navigation Tabs:** Overview, Knowledge, Tools, Agents, Topics, Activity, Analytics, Channels
- **Current Tab:** Topics (active)
- **Action Buttons:** Publish, Settings, Test

#### Flow Visualization:
- **View Type:** Fallback flow diagram
- **Layout:** Vertical flow chart with connected nodes

#### Main Flow Components:

##### 1. Trigger Node:
- **Type:** "On Unknown Intent"
- **Action:** Edit option available

##### 2. Topic Node:
- **Name:** LanguageGate
- **Action:** "View topic" link available

#### Test Panel (Right Side):
- **Title:** "Test your agent"
- **Sample Interaction:**
  - **Bot Message:** "Hello, I'm T.Buddy, your translator."
  - **User Prompt:** "Type 'start' to begin the language setup."
  - **Timestamp:** "A minute ago"
- **Input Field:** "Ask a question or describe what you need" with character counter (0/2000)
- **Disclaimer:** "Make sure AI-generated content is accurate and appropriate before using. See terms"

---

## Screenshot 6: Detailed Flow Diagram - Complete Agent Workflow

**Platform:** Microsoft Copilot Studio
**View:** Complete flow visualization with activity properties panel

### Layout:
- **Main Area:** Large flow diagram showing complete conversation logic
- **Right Panel:** "On Activity properties" configuration panel

### Flow Structure (Top to Bottom):

#### 1. Initial Trigger:
- **Type:** "A message is received"
- **Purpose:** Entry point for user interactions

#### 2. Variable Setting Nodes:
Multiple "Set variable value" nodes for initialization

#### 3. Conditions and Decision Points:
- **Condition Blocks:** Multiple conditional logic nodes
- **Branching:** Flow splits based on different scenarios

#### 4. Language Processing Section:
- **Language Detection:** Multiple nodes for language identification
- **Language Selection:** User preference handling

#### 5. Translation Processing:
- **GetLanguageCodes:** Processing user language preferences
- **GetLanguageName:** Converting codes to readable names
- **predictedDialect:** Language variant detection

#### 6. Message Handling:
- **Set Variable Nodes:** For storing user inputs and system responses
- **Conditional Logic:** For determining appropriate responses

#### 7. Power Automate Integrations:
- **Power Automate Inputs:** Multiple integration points
- **Data Processing:** External workflow connections

#### 8. Response Generation:
- **Message Nodes:** For sending responses to users
- **Flow Termination:** "End current topic" nodes

### Right Panel - Activity Properties:
- **Activity Type:** Message
- **Condition Settings:** Configuration options for conditional logic
- **Priority Settings:** For trigger agent event conditions

### Flow Characteristics:
- **Complexity:** High complexity with multiple branches and conditions
- **Integration:** Heavy use of Power Automate connectors
- **Language Focus:** Multiple language processing and translation nodes
- **User Experience:** Structured conversation flow with proper error handling

---

## Screenshot 7: Detailed Flow Section - User Interaction and Language Processing

**Platform:** Microsoft Copilot Studio
**View:** Focused section of the conversation flow

### Flow Components (Top to Bottom):

#### 1. Trigger Section:
- **Type:** "A message is received"
- **Configuration:** Basic message reception handling

#### 2. Variable Initialization:
- **Node:** "Set variable value"
- **Variable:** Global.userLanguage (string type)
- **Purpose:** Initialize user language preference

#### 3. User Interaction:
- **Question Node:** "What's languages you prefer? Write 2 or 3."
- **Input Type:** "User's entire response"
- **Variable Storage:** Response captured for processing

#### 4. Language Processing Chain:

##### First Processing Step:
- **Prompt Node:** "GetLanguageCodes"
- **Input:** Text Input (String)
- **Output:** sentenceSound (record)

##### Second Processing Step:
- **Prompt Node:** "GetLanguageName"
- **Input:** Text Input (String)  
- **Output:** predictedDialect (record)

##### Third Processing Step:
- **Variable Setting:** Global.userLanguage (string)
- **Source:** topic.predictedDialect.value

#### 5. Response Generation:
- **Multiple Set Variable Nodes:** For preparing response data
- **Final Action Node:** Power Automate integration
- **Inputs Include:**
  - Input.ChatID (String)
  - Input.ConversationId (String)
  - Input.LanguageCodes (Global.userLanguage)
  - Input.LanguageNames (Global.userLanguage)

#### 6. Completion:
- **Message Node:** Response delivery to user
- **Content:** Formatted message with language confirmation
- **Flow End:** "End current topic"

### Technical Details:
- **Variable Types:** Mix of string, record, and global variables
- **Integration Points:** Power Automate connectors for external processing
- **User Experience:** Guided language selection with confirmation
- **Error Handling:** Structured flow prevents hanging states