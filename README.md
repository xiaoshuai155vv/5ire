<div align="center">
  <a href="https://github.com/nanbingxyz/5ire">
    <img src="https://5ire.app/logo.png" alt="Logo" width="120">
  </a>
  <br />
   <h1>A Sleek AI assistant and MCP Client</h1>
   <div>
    <img src="https://badge.mcpx.dev/?type=client" />&nbsp;
    <img src="https://badge.mcpx.dev/?type=client&features=tools" />
     <img src="https://img.shields.io/badge/license-GNUv3-brightgreen.svg?style=flat"/>
     <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg"/>
  </div>
   <br />
  <img src="https://github.com/user-attachments/assets/36ba3c32-6ebb-46d8-810f-df648243fbcc" style="width:100%"/>
  <br />
  <p>
    <br />
    <div style="display:flex;justify-content:space-around;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:15px;">
    <span style="font-size:12px;">OpenAI</span>
    <span style="font-size:12px;">/ Azure OpenAI</span>
    <span style="font-size:12px;">/ Anthropic</span>
    <span style="font-size:12px;">/ Google</span>
    <span style="font-size:12px;">/ Baidu</span>
    <span style="font-size:12px;">/ Moonshot</span>
    <span style="font-size:12px;">/ Doubao</span>
    <span style="font-size:12px;">/ Grok</span>
    <span style="font-size:12px;">/ DeepSeek</span>
    <span style="font-size:12px;">/ Ollama</span>
  </div>
    <br />
    <a href="https://x.com/intent/follow?screen_name=1ronben">Twitter</a>
    ·
    <a href="https://github.com/nanbingxyz/5ire/releases/latest">Releases</a>
  </p>
   <br />
<video src="https://github.com/user-attachments/assets/741b23d3-31df-4749-bde4-103e2d415953.mp4"></video>
</div>
<br />

# Features

## ⚒️ Support Tools via MCP Servers
MCP is an open protocol that standardizes how applications provide context to LLMs. Think of MCP like a USB-C port for AI applications. Just as USB-C provides a standardized way to connect your devices to various peripherals and accessories, MCP provides a standardized way to connect AI models to different data sources and tools.

With tools, you can access the file system, obtain system information, interact with databases, access remote data, and more, rather than just having a simple conversation.

> [!TIP]
> 5ire is currently in the early stage, so custom MCP Servers are not open yet. However, you can add servers by modifying the `{userData}/5ire/mcp.json` configuration file (It should be  `~/Library/Application Support/5ire/mcp.json` on Mac). If there's any error, just delete the file, and 5ire will reset automatically. Feel free to explore!

## 💡 Local Knowledge Base
We have integrated the bge-m3 as our local embedding model, which excels in multilingual vectorization. 5ire now supports parsing and vectorization of docx, xlsx, pptx, pdf, txt, and csv documents, enabling storage of these vectors to power robust Retrieval-Augmented Generation (RAG) capabilities locally.

![Local Knowledge Base Screenshot](https://5ire.app/knowledge.png)

## 📈 Usage Analytics
By keeping track of your API usage and spending, you can gain a better understanding of how much you're spending on the API and make informed decisions to optimize your use of the service.

![Usage Analytics Screenshot](https://5ire.app/analytics.png)

## ✨ Prompts Library
The prompt library provides an effective way to create and organize your own prompts. These prompts are highly versatile, thanks to their support for variables.

![Prompts Library Screenshot](https://5ire.app/prompts.png)

## 🔖 Bookmarks
You can bookmark each conversation, and even if the original messages are deleted, the saved bookmarked content remains unaffected.
![Bookmarks Screenshot](https://5ire.app/bookmarks.png)

## 🔍 Quick Search
You can perform keyword searches across all conversations, quickly pinpointing the information you need.
![Search Screenshot](https://5ire.app/search.png)


> [!TIP]
> Since 5ire uses native dependencies, it needs to be packaged on the corresponding platform. If it is on Mac OS, you may also need to configure APPLE_TEAM_ID, APPLE_ID, and APPLE_ID_PASS for notarization to avoid security alerts.

<br />
<br />

# License

5ire is licensed under the GNU General Public License version 3.
