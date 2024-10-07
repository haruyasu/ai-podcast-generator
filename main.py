from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import feedparser
import requests
from bs4 import BeautifulSoup
from langchain.llms import OpenAI
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
import os

app = FastAPI()

# OpenAI API key should be set as an environment variable
os.environ["OPENAI_API_KEY"] = "your-api-key-here"

# Initialize OpenAI LLM
llm = OpenAI(temperature=0.7)

class PodcastRequest(BaseModel):
    topic: str
    num_articles: int = 3
    listener_message: str = ""

class PodcastResponse(BaseModel):
    script: str

def get_trend_articles(topic: str, num_articles: int) -> List[str]:
    # This is a simplified version. In a real-world scenario, you'd use more robust methods
    feed = feedparser.parse(f"https://news.google.com/rss/search?q={topic}&hl=ja&gl=JP&ceid=JP:ja")
    articles = []
    for entry in feed.entries[:num_articles]:
        articles.append(entry.link)
    return articles

def summarize_article(url: str) -> str:
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    text = soup.get_text()
    
    summary_prompt = PromptTemplate(
        input_variables=["text"],
        template="以下の記事を3文で要約してください:\n\n{text}\n\n要約:"
    )
    summary_chain = LLMChain(llm=llm, prompt=summary_prompt)
    summary = summary_chain.run(text=text[:1000])  # Limit text to first 1000 characters
    return summary

def generate_listener_response(message: str) -> str:
    response_prompt = PromptTemplate(
        input_variables=["message"],
        template="以下のリスナーからのメッセージに対して、ポッドキャストホストとして親しみやすく、かつ情報提供的な返事を書いてください:\n\n{message}\n\n返事:"
    )
    response_chain = LLMChain(llm=llm, prompt=response_prompt)
    return response_chain.run(message=message)

def create_podcast_script(summaries: List[str], listener_response: str) -> str:
    script_prompt = PromptTemplate(
        input_variables=["summaries", "listener_response"],
        template="""
        以下の情報を元に、AIに関する日本語のポッドキャスト原稿を作成してください。
        原稿は以下の構成で作成してください：

        1. 番組の開始と挨拶
        2. 今日のトピックの紹介
        3. 各記事の要約と解説：
        {summaries}
        4. リスナーからのお便りとその返事：
        {listener_response}
        5. 番組のまとめと締めくくり

        原稿:
        """
    )
    script_chain = LLMChain(llm=llm, prompt=script_prompt)
    return script_chain.run(summaries="\n".join(summaries), listener_response=listener_response)

@app.post("/generate_podcast", response_model=PodcastResponse)
async def generate_podcast(request: PodcastRequest):
    try:
        # Get trend articles
        articles = get_trend_articles(request.topic, request.num_articles)
        
        # Summarize articles
        summaries = [summarize_article(url) for url in articles]
        
        # Generate listener response
        listener_response = generate_listener_response(request.listener_message) if request.listener_message else ""
        
        # Create podcast script
        script = create_podcast_script(summaries, listener_response)
        
        return PodcastResponse(script=script)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)