

<div align="center">
  <a href="https://github.com/nanbingxyz/5ire">
    <img src="https://5ire.app/logo.png" alt="Logo" width="120">
  </a>
  <div>
  <img src="https://glitch-art.vercel.app/api/simple?word=Simplicity%20Unlocks%20Power%20of%20AI&width=600&height=70&fontSize=26&font=Barlow"/>
  </div>
  <div align="center">
    <img src="https://badge.mcpx.dev/?type=client" />&nbsp;
    <img src="https://badge.mcpx.dev/?type=client&features=tools" />
  </div>
  <br />
  <img src="https://github.com/user-attachments/assets/36ba3c32-6ebb-46d8-810f-df648243fbcc" style="width:100%"/>
  <p>
    <br />
    <strong style="font-Size:24px">A Cross-platform LLMs Desktop Client</strong>
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
<video src="https://github.com/user-attachments/assets/741b23d3-31df-4749-bde4-103e2d415953.mp4"></video>
</div>

## Features

### 1. Support MCP-Compatible Tools
MCP is an open protocol that standardizes how applications provide context to LLMs. Think of MCP like a USB-C port for AI applications. Just as USB-C provides a standardized way to connect your devices to various peripherals and accessories, MCP provides a standardized way to connect AI models to different data sources and tools.

With tools, you can access the file system, obtain system information, interact with databases, access remote data, and more, rather than just having a simple conversation.

> [!NOTE]  
> Support for MCP Servers is still in its early stages, some tools perform abnormally on Windows, and some models may fail to call tools.

### 2.Local Knowledge Base
We have integrated the bge-m3 as our local embedding model, which excels in multilingual vectorization. 5ire now supports parsing and vectorization of docx, xlsx, pptx, pdf, txt, and csv documents, enabling storage of these vectors to power robust Retrieval-Augmented Generation (RAG) capabilities locally.

![Local Knowledge Base Screenshot](https://5ire.app/knowledge.png)

### 3. Usage Analytics
By keeping track of your API usage and spending, you can gain a better understanding of how much you're spending on the API and make informed decisions to optimize your use of the service.

![Usage Analytics Screenshot](https://5ire.app/analytics.png)

### 4. Prompts Library
The prompt library provides an effective way to create and organize your own prompts. These prompts are highly versatile, thanks to their support for variables.

![Prompts Library Screenshot](https://5ire.app/prompts.png)

### 5. Bookmarks
You can bookmark each conversation, and even if the original messages are deleted, the saved bookmarked content remains unaffected.
![Bookmarks Screenshot](https://5ire.app/bookmarks.png)

### 6.Quick Keyword Search
You can perform keyword searches across all conversations, quickly pinpointing the information you need.
![Search Screenshot](https://5ire.app/search.png)


> [!TIP]
> Since 5ire uses native dependencies, it needs to be packaged on the corresponding platform. If it is on Mac OS, you may also need to configure APPLE_TEAM_ID, APPLE_ID, and APPLE_ID_PASS for notarization to avoid security alerts.


## License

5ire is licensed under the GNU General Public License version 3.
