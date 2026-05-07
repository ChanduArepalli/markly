import httpx
from bs4 import BeautifulSoup
from urllib.parse import urlparse, urljoin
from typing import Optional
import logging

logger = logging.getLogger(__name__)


async def fetch_url_metadata(url: str) -> dict:
    """
    Async fetch Open Graph metadata, page title, and favicon from a URL.
    Returns a dict with: title, description, favicon_url, og_image_url, domain
    """
    result = {
        "title": None,
        "description": None,
        "favicon_url": None,
        "og_image_url": None,
        "domain": None,
    }

    try:
        parsed = urlparse(url)
        result["domain"] = parsed.netloc.replace("www.", "")

        headers = {
            "User-Agent": "Mozilla/5.0 (compatible; Markly/1.0; +http://localhost:3000)",
            "Accept": "text/html,application/xhtml+xml",
        }

        async with httpx.AsyncClient(
            timeout=10.0,
            follow_redirects=True,
            headers=headers,
        ) as client:
            response = await client.get(url)
            response.raise_for_status()
            html = response.text

        soup = BeautifulSoup(html, "html.parser")

        # Open Graph title → fallback to <title>
        og_title = soup.find("meta", property="og:title")
        result["title"] = (
            og_title["content"] if og_title and og_title.get("content")
            else (soup.title.string.strip() if soup.title else None)
        )

        # Open Graph description → fallback to meta description
        og_desc = soup.find("meta", property="og:description")
        if not og_desc:
            og_desc = soup.find("meta", attrs={"name": "description"})
        result["description"] = og_desc["content"].strip() if og_desc and og_desc.get("content") else None

        # Open Graph image
        og_image = soup.find("meta", property="og:image")
        if og_image and og_image.get("content"):
            result["og_image_url"] = og_image["content"]

        # Favicon — try link[rel=icon] first, then /favicon.ico
        favicon_link = (
            soup.find("link", rel="icon")
            or soup.find("link", rel="shortcut icon")
            or soup.find("link", rel="apple-touch-icon")
        )
        if favicon_link and favicon_link.get("href"):
            href = favicon_link["href"]
            result["favicon_url"] = urljoin(url, href)
        else:
            result["favicon_url"] = f"{parsed.scheme}://{parsed.netloc}/favicon.ico"

    except Exception as e:
        logger.warning(f"Failed to fetch metadata for {url}: {e}")
        # Return partial result with at least the domain
        if not result["domain"]:
            try:
                result["domain"] = urlparse(url).netloc.replace("www.", "")
            except Exception:
                pass

    return result
